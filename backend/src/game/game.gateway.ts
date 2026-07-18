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
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import { Server, Socket } from 'socket.io';
import { requireAdminSocket, verifyAdminSocket } from '../admin/ws-admin.helper';
import { Question } from '../quiz/entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { AlunoService } from '../aluno/aluno.service';
import { EntrarDto } from './dto/entrar.dto';
import { GameSession } from './entities/game-session.entity';
import { PlayerResult } from './entities/player-result.entity';
import { GameResultsService } from './game-results.service';
import { GameStateService } from './game-state.service';


// --- Local shape types ----------------------------------------------------

interface SelecionarTemaPayload {
  quizId: string;
}

interface AdminConectarPayload {
  token?: string;
}

interface ResponderPayload {
  questionId: string;
  selectedIndex: number;
}

// --- Gateway ---------------------------------------------------------------

@WebSocketGateway({
  cors: { origin: process.env.FRONTEND_URL ?? '*' },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(GameGateway.name);

  /** Full question list cached from DB when the room is opened */
  private questions: Question[] = [];
  /** Quiz atual (título/imagem) cacheado quando a sala é aberta — usado
   *  pra popular o lobby do player sem precisar guardar isso no GameState
   *  compartilhado. */
  private currentQuiz: Quiz | null = null;

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly gameResultsService: GameResultsService,
    private readonly alunoService: AlunoService,
    private readonly jwtService: JwtService,
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    @InjectRepository(Quiz)
    private readonly quizRepository: Repository<Quiz>,
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
    @InjectRepository(PlayerResult)
    private readonly playerResultRepository: Repository<PlayerResult>,
  ) {}

  afterInit(): void {
    this.logger.log('GameGateway initialized');
  }

  handleConnection(client: Socket): void {
    this.logger.log(`Client connected: ${client.id}`);
    const state = this.gameStateService.state;
    client.emit('game:estado', {
      status: state.status,
      playerCount: state.players.size,
      totalQuestions: this.questions.length || undefined,
      musicEnabled: state.musicEnabled,
      quizTitle: this.currentQuiz?.title ?? null,
      quizImageUrl: this.currentQuiz?.imageUrl ?? null,
    });
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client disconnected: ${client.id}`);

    const state = this.gameStateService.state;

    const wasPlayer = state.players.has(client.id);
    let currentQuestionId: string | null = null;

    if (wasPlayer && state.status === 'pergunta_ativa') {
      const currentQuestion = this.questions[state.currentQuestionIndex];
      if (currentQuestion) {
        currentQuestionId = currentQuestion.id;
      }
    }

    this.gameStateService.removerJogador(client.id);

    this._broadcastEstado();
    this._emitAdminEstado();

    if (wasPlayer && state.status === 'pergunta_ativa' && currentQuestionId) {
      this._checkAllAnswered(currentQuestionId);
    }
  }

  // --- Professor -> Server ---------------------------------------------------

  @SubscribeMessage('admin:conectar')
  async handleAdminConectar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: AdminConectarPayload,
  ): Promise<void> {
    if (!(await verifyAdminSocket(client, payload?.token, this.jwtService))) {
      return;
    }
    await client.join('admins');
    this._emitAdminEstado();
  }

  @SubscribeMessage('admin:selecionarTema')
  async handleSelecionarTema(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SelecionarTemaPayload,
  ): Promise<void> {
    if (!requireAdminSocket(client)) return;

    try {
      const { quizId } = payload;

      const questions = await this.questionRepository.find({
        where: { quizId },
        order: { order: 'ASC' },
      });

      if (questions.length === 0) {
        client.emit('game:erro', { message: 'Quiz não possui perguntas.' });
        return;
      }

      this.currentQuiz = await this.quizRepository.findOne({
        where: { id: quizId },
      });

      const session = this.gameSessionRepository.create({
        quizId,
        status: 'em_andamento',
      });
      await this.gameSessionRepository.save(session);

      this.questions = questions;

      this.gameStateService.abrirSala(quizId, session.id);

      await client.join('admins');

      this._broadcastEstado();
      this._emitAdminEstado();
    } catch (err) {
      this.logger.error('admin:selecionarTema error', err);
      client.emit('game:erro', {
        message:
          err instanceof Error ? err.message : 'Erro ao selecionar tema.',
      });
    }
  }

  @SubscribeMessage('admin:liberarPergunta')
  handleLiberarPergunta(@ConnectedSocket() client: Socket): void {
    if (!requireAdminSocket(client)) return;

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

      this.gameStateService.setStatus('pergunta_ativa');
      this.gameStateService.setQuestionStartedAt(Date.now());

      const timer = setTimeout(() => {
        void this._processarResultado();
      }, question.timeLimitSec * 1000);

      this.gameStateService.setTimer(timer);

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
        message:
          err instanceof Error ? err.message : 'Erro ao liberar pergunta.',
      });
    }
  }

  @SubscribeMessage('admin:proximaPergunta')
  async handleProximaPergunta(
    @ConnectedSocket() client: Socket,
  ): Promise<void> {
    if (!requireAdminSocket(client)) return;

    try {
      const state = this.gameStateService.state;

      if (state.status !== 'mostrando_resultado') {
        client.emit('game:erro', {
          message: `Não é possível avançar com status: ${state.status}`,
        });
        return;
      }

      const hasMore = this.gameStateService.avancarPergunta(
        this.questions.length,
      );

      if (hasMore) {
        this.handleLiberarPergunta(client);
      } else {
        await this._finalizarJogo();
      }
    } catch (err) {
      this.logger.error('admin:proximaPergunta error', err);
      client.emit('game:erro', {
        message:
          err instanceof Error ? err.message : 'Erro ao avançar pergunta.',
      });
    }
  }

  @SubscribeMessage('admin:finalizarJogo')
  async handleFinalizarJogo(@ConnectedSocket() client: Socket): Promise<void> {
    if (!requireAdminSocket(client)) return;

    try {
      const state = this.gameStateService.state;

      if (
        state.status !== 'mostrando_resultado' &&
        state.status !== 'pergunta_ativa'
      ) {
        client.emit('game:erro', {
          message: `Não é possível finalizar com status: ${state.status}`,
        });
        return;
      }

      if (state.status === 'pergunta_ativa') {
        await this._processarResultado();
      }

      await this._finalizarJogo();
    } catch (err) {
      this.logger.error('admin:finalizarJogo error', err);
      client.emit('game:erro', {
        message: err instanceof Error ? err.message : 'Erro ao finalizar jogo.',
      });
    }
  }

  @SubscribeMessage('admin:musica')
  handleMusica(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { enabled: boolean },
  ): void {
    if (!requireAdminSocket(client)) return;
    this.gameStateService.setMusicEnabled(!!payload.enabled);
    this.server.emit('game:musica', { enabled: !!payload.enabled });
    this._broadcastEstado();
    this._emitAdminEstado();
  }

  @SubscribeMessage('admin:encerrarSala')
  async handleEncerrarSala(@ConnectedSocket() client: Socket): Promise<void> {
    if (!requireAdminSocket(client)) return;

    try {
      const state = this.gameStateService.state;

      if (
        state.status === 'inativo' ||
        (state.status === 'lobby' && !state.gameSessionId)
      ) {
        client.emit('game:erro', {
          message: 'Nenhuma sala aberta para encerrar.',
        });
        return;
      }

      this.gameStateService.clearTimer();

      if (state.gameSessionId) {
        try {
          await this.gameResultsService.finalizarSessao(state.gameSessionId);
        } catch (dbErr) {
          this.logger.error(
            'Failed to update GameSession status on encerrarSala',
            dbErr,
          );
        }
      }

      this.server.to('players').emit('game:salaEncerrada');

      this.gameStateService.resetar();
      this.questions = [];
      this.currentQuiz = null;

      this._broadcastEstado();
      this._emitAdminEstado();
    } catch (err) {
      this.logger.error('admin:encerrarSala error', err);
      client.emit('game:erro', {
        message: err instanceof Error ? err.message : 'Erro ao encerrar sala.',
      });
    }
  }

  // --- Player -> Server --------------------------------------------------

  /**
   * Entrada do aluno na partida.
   *
   * Regra de negocio corrigida: o aluno so pode entrar se realmente
   * pertencer a turma informada. Antes, o cliente enviava um nickname
   * livre e apenas a existencia da turma era checada -- qualquer pessoa
   * podia entrar em qualquer turma digitando qualquer nome. Agora:
   *
   *  1. O payload traz `alunoId` (nao mais um nickname livre).
   *  2. Buscamos o Aluno e conferimos que aluno.turmaId === turmaId
   *     (TurmaService.findAlunoInTurma lanca NotFound caso contrario).
   *  3. O nickname exibido no jogo e sempre aluno.nome, vindo do
   *     cadastro -- nunca um valor arbitrario enviado pelo cliente.
   *  4. Um mesmo aluno nao pode ocupar duas conexoes simultaneas na
   *     mesma partida (ver GameStateService.adicionarJogador).
   */
  @SubscribeMessage('player:entrar')
  async handleEntrar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: EntrarDto,
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

      const dto = plainToInstance(EntrarDto, payload);
      const errors = await validate(dto);
      if (errors.length > 0) {
        client.emit('game:erro', {
          message: 'Dados de entrada inválidos (turma, aluno ou avatar).',
        });
        return;
      }

      let aluno;
      try {
        aluno = await this.alunoService.findAlunoInTurma(
          dto.turmaId,
          dto.alunoId,
        );
      } catch {
        client.emit('game:erro', {
          message:
            'Aluno não encontrado nesta turma. Confira sua turma e tente novamente.',
        });
        return;
      }

      const nickname = aluno.nome.trim();

      const playerResult = this.playerResultRepository.create({
        gameSessionId: state.gameSessionId,
        nickname,
        avatar: dto.avatar.trim(),
        turmaId: dto.turmaId,
        alunoId: dto.alunoId,
        score: 0,
        answers: [],
      });
      await this.playerResultRepository.save(playerResult);

      try {
        this.gameStateService.adicionarJogador(
          client.id,
          dto.alunoId,
          nickname,
          dto.avatar.trim(),
          playerResult.id,
        );
      } catch (stateErr) {
        client.emit('game:erro', {
          message:
            stateErr instanceof Error
              ? stateErr.message
              : 'Erro ao entrar na sala.',
        });
        return;
      }

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
      } else {
        this._emitAdminEstado();
      }
    } catch (err) {
      this.logger.error('player:responder error', err);
      client.emit('game:erro', {
        message:
          err instanceof Error ? err.message : 'Erro ao registrar resposta.',
      });
    }
  }

  // --- Private helpers -----------------------------------------------------

  private _broadcastEstado(): void {
    const state = this.gameStateService.state;
    this.server.emit('game:estado', {
      status: state.status,
      playerCount: state.players.size,
      totalQuestions: this.questions.length || undefined,
      musicEnabled: state.musicEnabled,
      quizTitle: this.currentQuiz?.title ?? null,
      quizImageUrl: this.currentQuiz?.imageUrl ?? null,
    });
  }

  private _emitAdminEstado(): void {
    const state = this.gameStateService.state;
    const currentQuestion = this.questions[state.currentQuestionIndex];

    let timerRemaining: number | undefined;
    let answeredCount: number | undefined;

    if (
      state.status === 'pergunta_ativa' &&
      state.questionStartedAt !== null &&
      currentQuestion
    ) {
      const elapsed = Date.now() - state.questionStartedAt;
      timerRemaining = Math.max(
        0,
        Math.ceil((currentQuestion.timeLimitSec * 1000 - elapsed) / 1000),
      );
      answeredCount = [...state.players.values()].filter((p) =>
        p.answers.has(currentQuestion.id),
      ).length;
    } else if (
      state.status === 'mostrando_resultado' ||
      state.status === 'finalizado'
    ) {
      timerRemaining = 0;
    }

    this.server.to('admins').emit('admin:estado', {
      status: state.status,
      players: [...state.players.values()].map((p) => ({
        nickname: p.nickname,
        avatar: p.avatar,
        socketId: p.socketId,
      })),
      currentQuestionIndex: state.currentQuestionIndex,
      timerRemaining,
      answeredCount,
      musicEnabled: state.musicEnabled,
    });
  }

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

  private async _processarResultado(): Promise<void> {
    try {
      const state = this.gameStateService.state;

      if (state.status !== 'pergunta_ativa') {
        return;
      }

      this.gameStateService.clearTimer();
      this.gameStateService.setStatus('mostrando_resultado');

      const question = this.questions[state.currentQuestionIndex];

      if (!question) {
        this.logger.error('_processarResultado: pergunta não encontrada');
        return;
      }

      const ranking = this.gameStateService.calcularResultadoPergunta(
        this.questions,
        question.correctIndex,
        question.timeLimitSec,
      );

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
            await this.playerResultRepository.update(
              { id: player.playerResultId },
              { score: player.score, answers: answersArray },
            );
          } catch (dbErr) {
            this.logger.error(
              `Failed to persist PlayerResult for ${player.nickname}`,
              dbErr,
            );
          }
        }),
      );

      const top5 = ranking.slice(0, 5).map((e) => ({
        nickname: e.nickname,
        avatar: e.avatar,
        score: e.score,
      }));

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

  private async _finalizarJogo(): Promise<void> {
    try {
      const state = this.gameStateService.state;

      const finalRanking = [...state.players.values()]
        .sort((a, b) => b.score - a.score)
        .map((p) => ({
          socketId: p.socketId,
          nickname: p.nickname,
          avatar: p.avatar,
          score: p.score,
        }));

      if (state.gameSessionId) {
        try {
          await this.gameResultsService.finalizarSessao(state.gameSessionId);
        } catch (dbErr) {
          this.logger.error('Failed to update GameSession status', dbErr);
        }
      }

      this.gameStateService.setStatus('finalizado');

      const top5 = finalRanking.slice(0, 5).map((e) => ({
        nickname: e.nickname,
        avatar: e.avatar,
        score: e.score,
      }));

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

      this.server.to('admins').emit('admin:fim', {
        ranking: finalRanking.map((e) => ({
          nickname: e.nickname,
          avatar: e.avatar,
          score: e.score,
        })),
      });

      this._broadcastEstado();
      this._emitAdminEstado();
    } catch (err) {
      this.logger.error('_finalizarJogo error', err);
    }
  }
}