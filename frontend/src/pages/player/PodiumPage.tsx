import { useGameStore } from '../../stores/useGameStore';
import { PodiumView } from '../../features/ranking/components/PodiumView';
import { AvatarBadge } from '../../components/shared/AvatarBadge';

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'QuizMaster Live';

export default function PodiumPage() {
  const playerInfo = useGameStore((s) => s.playerInfo);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white select-none">
      {/* Top bar — mesmo padrão das demais telas do player */}
      <header className="flex items-center border-b border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
        <span className="font-extrabold text-lg sm:text-xl">{APP_NAME}</span>
      </header>

      <main className="flex flex-1 min-h-0 flex-col items-center justify-center overflow-hidden px-4 py-3">
        <PodiumView />
      </main>

      {/* Rodapé — jogador à esquerda, status da partida à direita */}
      {playerInfo && (
        <footer className="flex items-center justify-between border-t border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
          <div className="flex flex-col items-start">
            <AvatarBadge avatar={playerInfo.avatar} nickname={playerInfo.nickname} />
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted mb-1">
              Status do Jogo
            </span>
            <span className="text-body-sm font-bold text-white/90">
              Finalizado
            </span>
          </div>
        </footer>
      )}
    </div>
  );
}