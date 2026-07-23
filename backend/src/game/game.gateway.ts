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
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Server, Socket } from 'socket.io';
import {
  requireAdminSocket,
  verifyAdminSocket,
} from '../admin/ws-admin.helper';
import { Question } from '../quiz/entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { AdminConectarDto } from './dto/admin-conectar.dto';
import { EntrarDto } from './dto/entrar.dto';
import { MusicaDto } from './dto/musica.dto';
import { ResponderDto } from './dto/responder.dto';
import { SelecionarTemaDto } from './dto/selecionar-tema.dto';
import { GameStateService } from './game-state.service';
import { GameService } from './game.service';

// --- Gateway ---------------------------------------------------------------

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
})
export class GameGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(GameGateway.name);

  /** Full question list cached from DB when the room is opened */
  private questions: Question[] = [];
  /** Quiz atual (título/imagem) cacheado quando a sala é aberta */
  private currentQuiz: Quiz | null = null;

  /** Simple in-memory rate limiter for socket events (per socketId) */
  private readonly socketRateMap = new Map<string, number[]>();
  private readonly SOCKET_RATE_LIMIT = 5;
  private readonly SOCKET_RATE_WINDOW_MS = 1000;

  private isSocketRateLimited(socketId: string): boolean {
    const now = Date.now();
    const timestamps = this.socketRateMap.get(socketId) ?? [];
    const recent = timestamps.filter(
      (t) => now - t < this.SOCKET_RATE_WINDOW_MS,
    );
    if (recent.length >= this.SOCKET_RATE_LIMIT) {
      this.socketRateMap.set(socketId, recent);
      return true;
    }
    recent.push(now);
    this.socketRateMap.set(socketId, recent);
    return false;
  }

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly gameService: GameService,
    private readonly jwtService: JwtService,
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
    this.socketRateMap.delete(client.id);

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
    @MessageBody() payload: AdminConectarDto,
  ): Promise<void> {
    const dto = plainToInstance(AdminConectarDto, payload ?? {});
    const errors = await validate(dto);
    if (errors.length > 0) {
      client.emit('game:erro', { message: 'Dados de conexão inválidos.' });
      return;
    }
    if (!(await verifyAdminSocket(client, dto.token, this.jwtService))) {
      return;
    }
    await client.join('admins');
    this._emitAdminEstado();
  }

  @SubscribeMessage('admin:selecionarTema')
  async handleSelecionarTema(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SelecionarTemaDto,
  ): Promise<void> {
    if (!requireAdminSocket(client)) return;

    const dto = plainToInstance(SelecionarTemaDto, payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      client.emit('game:erro', {
        message: 'Dados inválidos ao selecionar quiz.',
      });
      return;
    }

    try {
      const { quizId } = dto;

      const result = await this.gameService.abrirSala(quizId);

      this.questions = result.questions;
      this.currentQuiz = result.quiz;

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
        message:
          err instanceof Error ? err.message : 'Erro ao finalizar jogo.',
      });
    }
  }

  @SubscribeMessage('admin:musica')
  async handleMusica(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: MusicaDto,
  ): Promise<void> {
    if (!requireAdminSocket(client)) return;
    const dto = plainToInstance(MusicaDto, payload);
    const errors = await validate(dto);
    if (errors.length > 0) {
      client.emit('game:erro', {
        message: 'Dados inválidos para controle de música.',
      });
      return;
    }
    this.gameStateService.setMusicEnabled(!!dto.enabled);
    this.server.emit('game:musica', { enabled: !!dto.enabled });
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

      await this.gameService.encerrarSala();

      this.server.to('players').emit('game:salaEncerrada');

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

  @SubscribeMessage('player:entrar')
  async handleEntrar(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: EntrarDto,
  ): Promise<void> {
    if (this.isSocketRateLimited(client.id)) {
      client.emit('game:erro', {
        message: 'Muitas tentativas. Aguarde um momento.',
      });
      return;
    }
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

      try {
        await this.gameService.processarEntrada(client.id, {
          turmaId: dto.turmaId,
          alunoId: dto.alunoId,
          avatar: dto.avatar,
        });
      } catch (entradaErr) {
        client.emit('game:erro', {
          message:
            entradaErr instanceof Error
              ? entradaErr.message
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
    @MessageBody() payload: ResponderDto,
  ): Promise<void> {
    if (this.isSocketRateLimited(client.id)) {
      client.emit('game:erro', {
        message: 'Muitas tentativas. Aguarde um momento.',
      });
      return;
    }
    try {
      const dto = plainToInstance(ResponderDto, payload);
      const errors = await validate(dto);
      if (errors.length > 0) {
        client.emit('game:erro', { message: 'Dados de resposta inválidos.' });
        return;
      }

      const state = this.gameStateService.state;

      if (state.status !== 'pergunta_ativa') {
        client.emit('game:erro', {
          message: 'Não há uma pergunta ativa no momento.',
        });
        return;
      }

      const { questionId, selectedIndex } = dto;

      const { allAnswered } = this.gameService.registrarResposta(
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

  // --- Private helpers (need Server access) --------------------------------

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
      const result = await this.gameService.processarResultado(this.questions);

      if (!result) return;

      const { ranking, top5, correctIndex } = result;

      for (const [idx, entry] of ranking.entries()) {
        const socket = this.server.sockets.sockets.get(entry.socketId);
        if (socket) {
          socket.emit('game:resultadoPergunta', {
            correctIndex,
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
        correctIndex,
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
      const { finalRanking, top5 } = await this.gameService.finalizarJogo();

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
