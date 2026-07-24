import { cn } from '../../lib/utils';
import type { WaitingRoomFooterState } from '../pages/DashboardPage';

export interface GameControlFooterState {
  screen: 'question_active' | 'showing_result';
  isLastQuestion: boolean;
  answeredCount: number;
  totalPlayers: number;
  totalQuestions: number;
  currentQuestion: number;
  showingRanking: boolean;
  onRanking: () => void;
  onProximaPergunta: () => void;
  onEncerrarJogo: () => void;
}

export interface GameOverFooterState {
  onNovoQuiz: () => void;
  onClassificacao: () => void;
  showingClassificacao: boolean;
  onVoltarPodium: () => void;
}

interface AdminFooterProps {
  adminUsername: string | null;
  waitingRoom: WaitingRoomFooterState | null;
  quizzesCount: number | null;
  gameControl?: GameControlFooterState | null;
  gameOver?: GameOverFooterState | null;
}

export function AdminFooter({ adminUsername, waitingRoom, quizzesCount, gameControl, gameOver }: AdminFooterProps) {
  return (
    <footer className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-3 border-t border-surface-container bg-white px-4 py-2.5 sm:px-6">
      <div className="flex items-center gap-2.5 justify-self-start">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-black text-white">
          {(adminUsername ?? '?').charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-bold text-gray-700">{adminUsername ?? 'Admin'}</span>
      </div>

      {waitingRoom ? (
        <span className="justify-self-center whitespace-nowrap font-black text-lg tabular-nums text-brand sm:text-xl">
          {String(waitingRoom.playersCount).padStart(2, '0')}{' '}
          {waitingRoom.playersCount === 1 ? 'conectado' : 'conectados'}
        </span>
      ) : gameControl?.screen === 'question_active' ? (
        <span className="justify-self-center rounded-full bg-surface-container px-4 py-2 text-sm font-bold tabular-nums text-brand">
          {String(gameControl.answeredCount).padStart(2, '0')} de {String(gameControl.totalPlayers).padStart(2, '0')} responderam
        </span>
      ) : (
        <span />
      )}

      <div className="justify-self-end">
        {waitingRoom ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={waitingRoom.onFinalizarSala}
              className="rounded-lg border-2 border-option-a bg-white px-3 py-1.5 text-xs font-black tracking-wide text-option-a transition-all hover:bg-option-a/5 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-option-a focus-visible:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              FECHAR SALA
            </button>
            <button
              type="button"
              onClick={waitingRoom.onIniciarJogo}
              disabled={waitingRoom.iniciarDisabled}
              className={cn(
                'rounded-lg px-4 py-1.5 text-xs font-black tracking-wide text-white transition-all active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:px-5 sm:py-2 sm:text-sm',
                waitingRoom.iniciarDisabled
                  ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                  : 'cursor-pointer bg-option-d shadow-sm hover:bg-option-d/90',
              )}
            >
              INICIAR JOGO ›
            </button>
          </div>
        ) : gameControl?.screen === 'showing_result' ? (
          <div className="flex items-center gap-2">
            {!gameControl.isLastQuestion && !gameControl.showingRanking && (
              <button
                type="button"
                onClick={gameControl.onEncerrarJogo}
                className="rounded-lg border-2 border-option-a bg-white px-3 py-1.5 text-xs font-black tracking-wide text-option-a transition-all hover:bg-option-a/5 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-option-a focus-visible:ring-offset-2 sm:px-4 sm:py-2 sm:text-sm"
              >
                ENCERRAR JOGO
              </button>
            )}
            <button
              type="button"
              onClick={
                gameControl.isLastQuestion
                  ? gameControl.onProximaPergunta
                  : gameControl.showingRanking
                    ? gameControl.onProximaPergunta
                    : gameControl.onRanking
              }
              className="rounded-lg bg-quiz-highlight px-4 py-1.5 text-xs font-black tracking-wide text-quiz-highlight-foreground shadow-sm transition-all hover:bg-quiz-highlight/90 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2 sm:px-5 sm:py-2 sm:text-sm"
            >
              {gameControl.isLastQuestion
                ? 'RESULTADO FINAL ›'
                : gameControl.showingRanking
                  ? 'PRÓXIMA PERGUNTA ›'
                  : 'RANKING ›'}
            </button>
          </div>
        ) : gameOver ? (
          gameOver.showingClassificacao ? (
            <button
              type="button"
              onClick={gameOver.onVoltarPodium}
              className="rounded-lg bg-quiz-highlight px-4 py-1.5 text-xs font-black tracking-wide text-quiz-highlight-foreground shadow-sm transition-all hover:bg-quiz-highlight/90 active:scale-95 motion-reduce:transition-none sm:px-5 sm:py-2 sm:text-sm"
            >
              VOLTAR AO PÓDIO ›
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={gameOver.onClassificacao}
                className="rounded-lg bg-quiz-highlight px-3 py-1.5 text-xs font-black tracking-wide text-quiz-highlight-foreground shadow-sm transition-all hover:bg-quiz-highlight/90 active:scale-95 motion-reduce:transition-none sm:px-4 sm:py-2 sm:text-sm"
              >
                CLASSIFICAÇÃO
              </button>
              <button
                type="button"
                onClick={gameOver.onNovoQuiz}
                className="rounded-lg bg-option-d px-4 py-1.5 text-xs font-black tracking-wide text-white shadow-sm transition-all hover:bg-option-d/90 active:scale-95 motion-reduce:transition-none sm:px-5 sm:py-2 sm:text-sm"
              >
                NOVO QUIZ ›
              </button>
            </div>
          )
        ) : (
          !gameControl &&
          quizzesCount !== null && (
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
              {quizzesCount} {quizzesCount === 1 ? 'quiz disponível' : 'quizzes disponíveis'}
            </span>
          )
        )}
      </div>
    </footer>
  );
}
