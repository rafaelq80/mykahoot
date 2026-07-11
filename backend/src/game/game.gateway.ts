import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GameStateService } from './game-state.service.js';
import { GameResultsService } from './game-results.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

// ─── Local shape types ────────────────────────────────────────────────────────

interface QuizQuestionShape {
  id: string;
  text: string;
  imageUrl: string | null;
  options: unknown; // JSON array from Prisma
  correctIndex: number;
  timeLimitSec: number;
  order: number;
}

interface SelecionarTemaPayload {
  quizId: string;
}

interface EntrarPayload {
  nickname: string;
  avatar: string;
}

interface ResponderPayload {
  questionId: string;
  selectedIndex: number;
}

// ─── Gateway ─────────────────────────────────────────────────────────────────

@WebSocketGateway({ cors: { origin: '*' } })
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(GameGateway.name);

  /** Full question list cached from DB when the room is opened */
  private questions: QuizQuestionShape[] = [];

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly gameResultsService: GameResultsService,
    private readonly prisma: PrismaService,
  ) {}

  afterInit(): void {
    this.logger.log('GameGateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    const state = this.gameStateService.state;

    // If the disconnecting socket belongs to a player, figure out whether they
    // had already answered the current question before removing them.
    const wasPlayer = state.players.has(client.id);
    let currentQuestionId: string | null = null;

    if (wasPlayer && state.status === 'pergunta_ativa') {
      const currentQuestion = this.questions[state.currentQuestionIndex];
      if (currentQuestion) {
        currentQuestionId = currentQuestion.id;
      }
    }

    this.gameStateService.removerJogador(client.id);

    // Notify everyone about the updated player list
    this._broadcastEstado();
    this._emitAdminEstado();

    // If a question is active and all remaining players have now answered,
    // trigger the result flow.
    if (wasPlayer && state.status === 'pergunta_ativa' && currentQuestionId) {
      this._checkAllAnswered(currentQuestionId);
    }
  }

  // ─── Professor → Server ──────────────────────────────────────────────────

  /** Admin joins the 'admins' room and gets the current game state immediately */
  @SubscribeMessage('admin:conectar')
  async handleAdminConectar(@ConnectedSocket() client: Socket): Promise<void> {
    await client.join('admins');
    this._emitAdminEstado();
  }

  @SubscribeMessage('admin:selecionarTema')
  async handleSelecionarTema(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SelecionarTemaPayload,
  ): Promise<void> {
    try {
      const { quizId } = payload;

      // Fetch all questions for the quiz, ordered
      const questions = await this.prisma.question.findMany({
        where: { quizId },
        orderBy: { order: 'asc' },
      });

      if (questions.length === 0) {
        client.emit('game:erro', { message: 'Quiz não possui perguntas.' });
        return;
      }

      // Create a GameSession in Neon
      const session = await this.prisma.gameSession.create({
        data: { quizId, status: 'em_andamento' },
      });

      // Cache questions locally
      this.questions = questions.map((q) => ({
        id: q.id,
        text: q.text,
        imageUrl: q.imageUrl,
        options: q.options,
        correctIndex: q.correctIndex,
        timeLimitSec: q.timeLimitSec,
        order: q.order,
      }));

      // Open the in-memory room
      this.gameStateService.abrirSala(quizId, session.id);

      // Join this socket to the admins room
      await client.join('admins');

      this._broadcastEstado();
      this._emitAdminEstado();
    } catch (err) {
      this.logger.error('admin:selecionarTema error', err);
      client.emit('game:erro', {
        message: err instanceof Error ? err.message : 'Erro ao selecionar tema.',
      });
    }
  }

  @SubscribeMessage('admin:liberarPergunta')
  async handleLiberarPergunta(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const state = this.gameStateService.state;

      if (state.status !== 'lobby' && state.status !== 'mostrando_resultado') {
        client.emit('game:erro', {
          message: `Não é possível liberar pergunta com status: ${state.status}`,
        });
        return;
      }

      const question = this.questions[state.currentQuestionIndex];
      if (!question) {
        client.emit('game:erro', { message: 'Pergunta não encontrada.' });
        return;
      }

      // Update status and start timer tracking
      this.gameStateService.setStatus('pergunta_ativa');
      this.gameStateService.setQuestionStartedAt(Date.now());

      // Schedule auto-result at end of time limit
      const timer = setTimeout(() => {
        void this._processarResultado();
      }, question.timeLimitSec * 1000);

      this.gameStateService.setTimer(timer);

      // Emit to players — NO correctIndex
      this.server.to('players').emit('game:pergunta', {
        questionId: question.id,
        text: question.text,
        imageUrl: question.imageUrl,
        options: question.options,
        timeLimitSec: question.timeLimitSec,
        order: state.currentQuestionIndex + 1,
        totalQuestions: this.questions.length,
      });

      this._emitAdminEstado();
    } catch (err) {
      this.logger.error('admin:liberarPergunta error', err);
      client.emit('game:erro', {
        message: err instanceof Error ? err.message : 'Erro ao liberar pergunta.',
      });
    }
  }

  @SubscribeMessage('admin:proximaPergunta')
  async handleProximaPergunta(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const state = this.gameStateService.state;

      if (state.status !== 'mostrando_resultado') {
        client.emit('game:erro', {
          message: `Não é possível avançar com status: ${state.status}`,
        });
        return;
      }

      const hasMore = this.gameStateService.avancarPergunta(this.questions.length);

      if (hasMore) {
        // Re-use the liberarPergunta flow
        await this.handleLiberarPergunta(client);
      } else {
        await this._finalizarJogo();
      }
    } catch (err) {
      this.logger.error('admin:proximaPergunta error', err);
      client.emit('game:erro', {
        message: err instanceof Error ? err.message : 'Erro ao avançar pergunta.',
      });
    }
  }

  /** Professor manually closes the room — before the game starts or mid-game */
  @SubscribeMessage('admin:encerrarSala')
  async handleEncerrarSala(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const state = this.gameStateService.state;

      if (state.status === 'lobby' && !state.gameSessionId) {
        client.emit('game:erro', { message: 'Nenhuma sala aberta para encerrar.' });
        return;
      }

      // Stop any pending question timer
      this.gameStateService.clearTimer();

      // Mark the session as finished in Neon, same as a normal game end
      if (state.gameSessionId) {
        try {
          await this.gameResultsService.finalizarSessao(state.gameSessionId);
        } catch (dbErr) {
          this.logger.error('Failed to update GameSession status on encerrarSala', dbErr);
        }
      }

      // Tell every connected player the room is closed
      this.server.to('players').emit('game:salaEncerrada');

      // Reset in-memory state
      this.gameStateService.resetar();
      this.questions = [];

      this._emitAdminEstado();
    } catch (err) {
      this.logger.error('admin:encerrarSala error', err);
      client.emit('game:erro', {
        message: err instanceof Error ? err.message : 'Erro ao encerrar sala.',
      });
    }
  }

  // ─── Player → Server ─────────────────────────────────────────────────────

  @SubscribeMessage('player:entrar')
  async handleEntrar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: EntrarPayload,
  ): Promise<void> {
    try {
      const state = this.gameStateService.state;

      if (state.status !== 'lobby') {
        client.emit('game:erro', {
          message: 'A sala não está aberta para novos jogadores.',
        });
        return;
      }

      if (!state.gameSessionId) {
        client.emit('game:erro', { message: 'Sessão de jogo não encontrada.' });
        return;
      }

      const { nickname, avatar } = payload;

      // Persist PlayerResult in Neon immediately
      const playerResult = await this.prisma.playerResult.create({
        data: {
          gameSessionId: state.gameSessionId,
          nickname,
          avatar,
          score: 0,
          answers: [],
        },
      });

      // Add player to in-memory state
      this.gameStateService.adicionarJogador(
        client.id,
        nickname,
        avatar,
        playerResult.id,
      );

      // Join socket to players room
      await client.join('players');

      this._broadcastEstado();
      this._emitAdminEstado();
    } catch (err) {
      this.logger.error('player:entrar error', err);
      client.emit('game:erro', {
        message: err instanceof Error ? err.message : 'Erro ao entrar na sala.',
      });
    }
  }

  @SubscribeMessage('player:responder')
  async handleResponder(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: ResponderPayload,
  ): Promise<void> {
    try {
      const state = this.gameStateService.state;

      if (state.status !== 'pergunta_ativa') {
        client.emit('game:erro', {
          message: 'Não há uma pergunta ativa no momento.',
        });
        return;
      }

      const { questionId, selectedIndex } = payload;

      const allAnswered = this.gameStateService.registrarResposta(
        client.id,
        questionId,
        selectedIndex,
      );

      if (allAnswered) {
        this.gameStateService.clearTimer();
        await this._processarResultado();
      }
    } catch (err) {
      this.logger.error('player:responder error', err);
      client.emit('game:erro', {
        message: err instanceof Error ? err.message : 'Erro ao registrar resposta.',
      });
    }
  }

  // ─── Private helpers ─────────────────────────────────────────────────────

  /** Emit game:estado to everyone connected (including players not in the room yet) */
  private _broadcastEstado(): void {
    const state = this.gameStateService.state;
    this.server.emit('game:estado', {
      status: state.status,
      playerCount: state.players.size,
      totalQuestions: this.questions.length,
    });
  }

  /** Emit admin:estado to the admins room */
  private _emitAdminEstado(): void {
    const state = this.gameStateService.state;
    this.server.to('admins').emit('admin:estado', {
      status: state.status,
      players: [...state.players.values()].map((p) => ({
        nickname: p.nickname,
        avatar: p.avatar,
        socketId: p.socketId,
      })),
      currentQuestionIndex: state.currentQuestionIndex,
    });
  }

  /**
   * After a player disconnects during a question, check whether all
   * remaining players have already answered and trigger the result if so.
   */
  private _checkAllAnswered(questionId: string): void {
    const state = this.gameStateService.state;
    if (state.players.size === 0) {
      return;
    }
    const allAnswered = [...state.players.values()].every((p) =>
      p.answers.has(questionId),
    );
    if (allAnswered) {
      this.gameStateService.clearTimer();
      void this._processarResultado();
    }
  }

  /** Calculate and broadcast question result */
  private async _processarResultado(): Promise<void> {
    try {
      const state = this.gameStateService.state;
      const question = this.questions[state.currentQuestionIndex];

      if (!question) {
        this.logger.error('_processarResultado: pergunta não encontrada');
        return;
      }

      this.gameStateService.clearTimer();

      const ranking = this.gameStateService.calcularResultadoPergunta(
        this.questions,
        question.correctIndex,
        question.timeLimitSec,
      );

      // Persist each player's accumulated score and answers array in Neon
      await Promise.allSettled(
        [...state.players.values()].map(async (player) => {
          try {
            const answersArray = [...player.answers.entries()].map(
              ([qId, a]) => ({
                questionId: qId,
                selectedIndex: a.selectedIndex,
                correct: a.correct,
                timeMs: a.timeMs,
              }),
            );
            await this.prisma.playerResult.update({
              where: { id: player.playerResultId },
              data: { score: player.score, answers: answersArray },
            });
          } catch (dbErr) {
            this.logger.error(
              `Failed to persist PlayerResult for ${player.nickname}`,
              dbErr,
            );
          }
        }),
      );

      this.gameStateService.setStatus('mostrando_resultado');

      const top5 = ranking.slice(0, 5).map((e) => ({
        nickname: e.nickname,
        avatar: e.avatar,
        score: e.score,
      }));

      // Emit individual result to each player socket
      for (const [idx, entry] of ranking.entries()) {
        const socket = this.server.sockets.sockets.get(entry.socketId);
        if (socket) {
          socket.emit('game:resultadoPergunta', {
            correctIndex: question.correctIndex,
            top5,
            you: {
              correct: entry.correct,
              selectedIndex: entry.selectedIndex,
              score: entry.score,
              position: idx + 1,
            },
          });
        }
      }

      // Full ranking to admins
      this.server.to('admins').emit('admin:placar', {
        correctIndex: question.correctIndex,
        ranking: ranking.map((e) => ({
          socketId: e.socketId,
          nickname: e.nickname,
          avatar: e.avatar,
          score: e.score,
          correct: e.correct,
          selectedIndex: e.selectedIndex,
        })),
      });

      this._emitAdminEstado();
    } catch (err) {
      this.logger.error('_processarResultado error', err);
    }
  }

  /** Finalize the game, persist, and emit final rankings */
  private async _finalizarJogo(): Promise<void> {
    try {
      const state = this.gameStateService.state;

      // Build final ranking from current in-memory player scores
      const finalRanking = [...state.players.values()]
        .sort((a, b) => b.score - a.score)
        .map((p) => ({
          socketId: p.socketId,
          nickname: p.nickname,
          avatar: p.avatar,
          score: p.score,
        }));

      // Update GameSession status in Neon via GameResultsService
      if (state.gameSessionId) {
        try {
          await this.gameResultsService.finalizarSessao(state.gameSessionId);
        } catch (dbErr) {
          this.logger.error('Failed to update GameSession status', dbErr);
        }
      }

      const top5 = finalRanking.slice(0, 5).map((e) => ({
        nickname: e.nickname,
        avatar: e.avatar,
        score: e.score,
      }));

      // Emit individual game:fim to each player
      for (const [idx, entry] of finalRanking.entries()) {
        const socket = this.server.sockets.sockets.get(entry.socketId);
        if (socket) {
          socket.emit('game:fim', {
            top5,
            you: {
              score: entry.score,
              position: idx + 1,
            },
          });
        }
      }

      // Full ranking to admins
      this.server.to('admins').emit('admin:fim', {
        ranking: finalRanking.map((e) => ({
          nickname: e.nickname,
          avatar: e.avatar,
          score: e.score,
        })),
      });

      // Reset in-memory state
      this.gameStateService.resetar();
      this.questions = [];
    } catch (err) {
      this.logger.error('_finalizarJogo error', err);
    }
  }
}