import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AlunoService } from '../aluno/aluno.service';
import { QuestionService } from '../quiz/question.service';
import { Question } from '../quiz/entities/question.entity';
import { Quiz } from '../quiz/entities/quiz.entity';
import { GameSession } from './entities/game-session.entity';
import { PlayerResult } from './entities/player-result.entity';
import { GameHistoryService } from '../game-history/game-history.service';
import { GameStateService } from './game-state.service';
import { RankingEntry } from './game.types';

export interface AbrirSalaResult {
  questions: Question[];
  quiz: Quiz | null;
  session: GameSession;
}

export interface ProcessarResultadoResult {
  ranking: RankingEntry[];
  top5: { nickname: string; avatar: string; score: number }[];
  correctIndex: number;
  question: Question;
}

export interface FinalizarJogoResult {
  finalRanking: {
    socketId: string;
    nickname: string;
    avatar: string;
    score: number;
  }[];
  top5: { nickname: string; avatar: string; score: number }[];
}

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly gameHistoryService: GameHistoryService,
    private readonly alunoService: AlunoService,
    private readonly questionService: QuestionService,
    @InjectRepository(GameSession)
    private readonly gameSessionRepository: Repository<GameSession>,
    @InjectRepository(PlayerResult)
    private readonly playerResultRepository: Repository<PlayerResult>,
  ) {}

  // ─── Public methods ─────────────────────────────────────────────────────

  /**
   * Opens a game room: fetches questions, creates a GameSession, opens state.
   * Throws if quizId has no questions or if a room is already active.
   */
  async abrirSala(quizId: string): Promise<AbrirSalaResult> {
    const questions = (await this.questionService.findAllQuestions(
      quizId,
      true,
    )) as Question[];

    if (questions.length === 0) {
      throw new Error('Quiz não possui perguntas.');
    }

    const quiz = await this.getQuizInfo(quizId);

    const session = this.gameSessionRepository.create({
      quizId,
      status: 'em_andamento',
    });
    await this.gameSessionRepository.save(session);

    this.gameStateService.abrirSala(quizId, session.id);

    return { questions, quiz, session };
  }

  /**
   * Validates aluno membership in turma, creates PlayerResult, adds to state.
   * Returns the validated nickname.
   */
  async processarEntrada(
    socketId: string,
    payload: { turmaId: string; alunoId: string; avatar: string },
  ): Promise<string> {
    const state = this.gameStateService.state;

    if (!state.gameSessionId) {
      throw new Error('Sessão de jogo não encontrada.');
    }

    const aluno = await this.alunoService.findAlunoInTurma(
      payload.turmaId,
      payload.alunoId,
    );

    const nickname = aluno.nome.trim();

    const playerResult = this.playerResultRepository.create({
      gameSessionId: state.gameSessionId,
      nickname,
      avatar: payload.avatar.trim(),
      turmaId: payload.turmaId,
      alunoId: payload.alunoId,
      score: 0,
      answers: [],
    });
    await this.playerResultRepository.save(playerResult);

    this.gameStateService.adicionarJogador(
      socketId,
      payload.alunoId,
      nickname,
      payload.avatar.trim(),
      playerResult.id,
    );

    return nickname;
  }

  /**
   * Delegates answer registration to GameStateService.
   * Returns whether all players have now answered.
   */
  registrarResposta(
    socketId: string,
    questionId: string,
    selectedIndex: number,
  ): { allAnswered: boolean } {
    const allAnswered = this.gameStateService.registrarResposta(
      socketId,
      questionId,
      selectedIndex,
    );
    return { allAnswered };
  }

  /**
   * Calculates results for the current question, persists player results.
   * Returns ranking data needed for event emission.
   */
  async processarResultado(
    questions: Question[],
  ): Promise<ProcessarResultadoResult | null> {
    const state = this.gameStateService.state;

    if (state.status !== 'pergunta_ativa') {
      return null;
    }

    this.gameStateService.clearTimer();
    this.gameStateService.setStatus('mostrando_resultado');

    const question = questions[state.currentQuestionIndex];

    if (!question) {
      this.logger.error('processarResultado: pergunta não encontrada');
      return null;
    }

    const ranking = this.gameStateService.calcularResultadoPergunta(
      questions,
      question.correctIndex,
      question.timeLimitSec,
    );

    // Persist player results (non-blocking — failures are logged, not thrown)
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

    return { ranking, top5, correctIndex: question.correctIndex, question };
  }

  /**
   * Builds final ranking, finalizes session, updates state to 'finalizado'.
   * Returns final ranking data for event emission.
   */
  async finalizarJogo(): Promise<FinalizarJogoResult> {
    const state = this.gameStateService.state;

    const finalRanking = [...state.players.values()]
      .sort((a, b) => b.score - a.score)
      .map((p) => ({
        socketId: p.socketId,
        nickname: p.nickname,
        avatar: p.avatar,
        score: p.score,
      }));

    // Persist classification, correctCount and wrongCount
    await Promise.allSettled(
      [...state.players.values()].map(async (player) => {
        try {
          const classificacao = finalRanking.findIndex(
            (r) => r.socketId === player.socketId,
          ) + 1;
          const correctCount = [...player.answers.values()].filter(
            (a) => a.correct,
          ).length;
          const totalAnswered = player.answers.size;
          const wrongCount = totalAnswered - correctCount;

          await this.playerResultRepository.update(
            { id: player.playerResultId },
            { correctCount, wrongCount, classificacao },
          );
        } catch (dbErr) {
          this.logger.error(
            `Failed to persist classification for ${player.nickname}`,
            dbErr,
          );
        }
      }),
    );

    if (state.gameSessionId) {
      try {
        await this.gameHistoryService.finalizarSessao(state.gameSessionId);
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

    return { finalRanking, top5 };
  }

  /**
   * Clears timer, marks session as interrupted, resets state.
   */
  async encerrarSala(): Promise<void> {
    const state = this.gameStateService.state;

    this.gameStateService.clearTimer();

    if (state.gameSessionId) {
      try {
        await this.gameHistoryService.finalizarSessao(state.gameSessionId);
      } catch (dbErr) {
        this.logger.error(
          'Failed to update GameSession status on encerrarSala',
          dbErr,
        );
      }
    }

    this.gameStateService.resetar();
  }

  /**
   * Fetches Quiz entity for caching (title/image).
   */
  async getQuizInfo(quizId: string): Promise<Quiz | null> {
    return this.gameSessionRepository.manager
      .getRepository(Quiz)
      .findOne({ where: { id: quizId } });
  }
}
