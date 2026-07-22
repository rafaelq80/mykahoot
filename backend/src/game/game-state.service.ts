import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import {
  GameState,
  GameStatus,
  PlayerState,
  QuestionShape,
  RankingEntry,
} from './game.types';

const BASE_POINTS = 1000;
const MIN_CORRECT_POINTS = 500;

@Injectable()
export class GameStateService {
  private readonly logger = new Logger(GameStateService.name);

  private readonly _state: GameState = {
    status: 'inativo',
    gameSessionId: null,
    quizId: null,
    currentQuestionIndex: 0,
    questionStartedAt: null,
    questionTimer: null,
    players: new Map<string, PlayerState>(),
    musicEnabled: false,
  };

  /** Readonly snapshot of the current game state */
  get state(): Readonly<GameState> {
    return this._state;
  }

  // ─── Status / timer helpers ───────────────────────────────────────────────

  setStatus(status: GameStatus): void {
    this._state.status = status;
  }

  setQuestionStartedAt(time: number): void {
    this._state.questionStartedAt = time;
  }

  setTimer(timer: NodeJS.Timeout): void {
    this._state.questionTimer = timer;
  }

  clearTimer(): void {
    if (this._state.questionTimer !== null) {
      clearTimeout(this._state.questionTimer);
      this._state.questionTimer = null;
    }
  }

  setMusicEnabled(enabled: boolean): void {
    this._state.musicEnabled = enabled;
  }

  getMusicEnabled(): boolean {
    return this._state.musicEnabled;
  }

  // ─── Room management ──────────────────────────────────────────────────────

  /**
   * Opens the game room. Throws ConflictException if a game is already active.
   */
  abrirSala(quizId: string, gameSessionId: string): void {
    if (this._state.status !== 'inativo') {
      throw new ConflictException(
        `Não é possível abrir uma sala: já existe uma partida ativa (status: ${this._state.status}).`,
      );
    }

    this._state.status = 'lobby';
    this._state.quizId = quizId;
    this._state.gameSessionId = gameSessionId;
    this._state.currentQuestionIndex = 0;
    this._state.questionStartedAt = null;
    this._state.questionTimer = null;
    this._state.players = new Map<string, PlayerState>();
  }

  /**
   * Adds a player to the in-memory state.
   * Throws BadRequestException if the room is not in lobby status.
   */
  adicionarJogador(
    socketId: string,
    alunoId: string,
    nickname: string,
    avatar: string,
    playerResultId: string,
  ): void {
    if (this._state.status !== 'lobby') {
      throw new BadRequestException(
        `Não é possível entrar na sala: a partida não está no lobby (status: ${this._state.status}).`,
      );
    }

    const jaConectado = [...this._state.players.values()].some(
      (p) => p.alunoId === alunoId,
    );
    if (jaConectado) {
      throw new ConflictException(
        'Este aluno já está conectado nesta partida.',
      );
    }

    const player: PlayerState = {
      socketId,
      playerResultId,
      alunoId,
      nickname,
      avatar,
      score: 0,
      answers: new Map(),
    };

    this._state.players.set(socketId, player);
    this.logger.log(`Jogador adicionado: ${nickname} (${socketId})`);
  }

  /**
   * Registers a player answer for the current question.
   * Ignores duplicate answers from the same player for the same question.
   * Returns true when ALL connected players have now answered (so the caller
   * can trigger the result flow early).
   */
  registrarResposta(
    socketId: string,
    questionId: string,
    selectedIndex: number,
  ): boolean {
    const player = this._state.players.get(socketId);
    if (!player) {
      this.logger.warn(
        `registrarResposta: jogador não encontrado (${socketId})`,
      );
      return false;
    }

    // Ignore duplicate answers
    if (player.answers.has(questionId)) {
      return false;
    }

    const timeLimitFallback = 30_000; // fallback when questionStartedAt is null
    const timeMs =
      this._state.questionStartedAt !== null
        ? Date.now() - this._state.questionStartedAt
        : timeLimitFallback;

    player.answers.set(questionId, {
      selectedIndex,
      timeMs,
      // correctness is determined later in calcularResultadoPergunta
      correct: false,
    });

    // Check if every connected player has answered this question
    const totalPlayers = this._state.players.size;
    if (totalPlayers === 0) {
      return false;
    }

    const answeredCount = [...this._state.players.values()].filter((p) =>
      p.answers.has(questionId),
    ).length;

    return answeredCount === totalPlayers;
  }

  /**
   * Calculates the result for the current question:
   * - Fills in missing answers for players who did not respond
   * - Evaluates correctness and pointsEarned
   * - Updates each player's accumulated score
   * - Returns the full ranking sorted by score descending
   */
  calcularResultadoPergunta(
    questions: QuestionShape[],
    correctIndex: number,
    timeLimitSec: number,
  ): RankingEntry[] {
    const timeLimitMs = timeLimitSec * 1000;
    const currentQuestion = questions[this._state.currentQuestionIndex];

    if (!currentQuestion) {
      this.logger.error(
        `calcularResultadoPergunta: pergunta no índice ${this._state.currentQuestionIndex} não encontrada`,
      );
      return [];
    }

    const questionId = currentQuestion.id;

    for (const player of this._state.players.values()) {
      // Fill in missing answer
      if (!player.answers.has(questionId)) {
        player.answers.set(questionId, {
          selectedIndex: -1,
          timeMs: timeLimitMs,
          correct: false,
        });
      }

      const answer = player.answers.get(questionId)!;

      // Evaluate correctness
      const isCorrect = answer.selectedIndex === correctIndex;
      answer.correct = isCorrect;

      // Calculate points
      const clampedTimeMs = Math.min(answer.timeMs, timeLimitMs);
      const remainingRatio = (timeLimitMs - clampedTimeMs) / timeLimitMs;
      const pointsEarned = isCorrect
        ? Math.round(
            MIN_CORRECT_POINTS +
              (BASE_POINTS - MIN_CORRECT_POINTS) * remainingRatio,
          )
        : 0;

      player.score += pointsEarned;

      // Store updated answer back (Map holds reference, but be explicit)
      player.answers.set(questionId, { ...answer, correct: isCorrect });
    }

    // Build and return ranking sorted by score descending
    const ranking: RankingEntry[] = [...this._state.players.values()].map(
      (player) => {
        const answer = player.answers.get(questionId)!;
        const clampedTimeMs = Math.min(answer.timeMs, timeLimitMs);
        const remainingRatio = (timeLimitMs - clampedTimeMs) / timeLimitMs;
        const pointsEarned = answer.correct
          ? Math.round(
              MIN_CORRECT_POINTS +
                (BASE_POINTS - MIN_CORRECT_POINTS) * remainingRatio,
            )
          : 0;

        return {
          socketId: player.socketId,
          nickname: player.nickname,
          avatar: player.avatar,
          score: player.score,
          correct: answer.correct,
          selectedIndex: answer.selectedIndex,
          pointsEarned,
        };
      },
    );

    ranking.sort((a, b) => b.score - a.score);
    return ranking;
  }

  /**
   * Advances to the next question index.
   * Returns true if there are more questions remaining, false if the quiz is finished.
   * The caller must provide the total number of questions to determine if there is a next one.
   *
   * Note: the total questions count is provided via the `totalQuestions` parameter so
   * this service does not need to hold a reference to the full quiz.
   */
  avancarPergunta(totalQuestions: number): boolean {
    this._state.currentQuestionIndex += 1;
    return this._state.currentQuestionIndex < totalQuestions;
  }

  /**
   * Removes a player from the in-memory map (e.g. on disconnect).
   */
  removerJogador(socketId: string): void {
    const player = this._state.players.get(socketId);
    if (player) {
      this.logger.log(`Jogador removido: ${player.nickname} (${socketId})`);
      this._state.players.delete(socketId);
    }
  }

  /**
   * Resets the entire state back to 'inativo' initial values.
   */
  resetar(): void {
    this.clearTimer();
    this._state.status = 'inativo';
    this._state.gameSessionId = null;
    this._state.quizId = null;
    this._state.currentQuestionIndex = 0;
    this._state.questionStartedAt = null;
    this._state.questionTimer = null;
    this._state.players = new Map<string, PlayerState>();
    this._state.musicEnabled = false;
    this.logger.log('Estado do jogo resetado para inativo.');
  }
}
