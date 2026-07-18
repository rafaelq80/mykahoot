import { useGameStore } from '../../stores/useGameStore';

const APP_NAME = import.meta.env.VITE_APP_NAME ?? 'QuizMaster Live';

export default function LobbyPage() {
  const playerCount = useGameStore((s) => s.playerCount);
  const playerInfo = useGameStore((s) => s.playerInfo);
  const quizTitle = useGameStore((s) => s.quizTitle);
  const quizImageUrl = useGameStore((s) => s.quizImageUrl);

  return (
    <div className="flex min-h-dvh flex-col bg-quiz-bg-to bg-quiz-gradient text-white">
      {/* Top bar: Padronizado com o QuestionPage */}
      <header className="flex items-center px-4 py-4 sm:px-6 border-b border-quiz-border bg-quiz-surface">
        <span className="font-extrabold text-lg sm:text-xl">{APP_NAME}</span>
      </header>

      {/* Conteúdo central */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-6 gap-8">
        
        {/* Bloco Superior Central: Card do Jogador (Avatar maior, redondo e com fundo #F8F1FC) */}
        {playerInfo && (
          <div className="flex flex-col items-center gap-3 animate-fade-in">
            <div
              className="flex h-32 w-32 items-center justify-center rounded-full bg-surface-container text-6xl shadow-xl border-4 border-quiz-border"
              aria-hidden="true"
            >
              {playerInfo.avatar}
            </div>
            <p className="font-black text-2xl text-white tracking-tight">
              {playerInfo.nickname}
            </p>
          </div>
        )}

        {/* Bloco Inferior Central: Contadores e Status de Espera */}
        <div className="flex flex-col items-center gap-2 text-center">
          {/* Big player count */}
          <p
            className="font-mono font-black tabular-nums leading-none tracking-tighter"
            style={{ fontSize: '6rem' }}
            aria-label={`${playerCount} jogadores na sala`}
          >
            {playerCount}
          </p>
          <p className="text-body-md text-white/70 font-bold uppercase tracking-[0.14em]">
            {playerCount === 1 ? 'jogador conectado' : 'jogadores conectados'}
          </p>
        </div>

        <div className="animate-pulse rounded-full bg-yellow-400 px-6 py-2.5 shadow-md">
          <p className="text-body-sm font-extrabold text-black">
            Aguardando o professor iniciar a partida...
          </p>
        </div>
      </main>

      {/* Rodapé estruturado: Informações do Quiz à esquerda e Status do Jogo à direita */}
      <footer className="grid grid-cols-2 items-center border-t border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6 w-full">
        {/* Lado Esquerdo: Nome do Quiz + Ícone temporário */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-2 text-white/90 font-bold">
            {quizImageUrl ? (
              <img
                src={quizImageUrl}
                alt=""
                className="h-5 w-5 shrink-0 rounded-full object-cover"
              />
            ) : (
              <PlaceholderIcon />
            )}
            <span className="text-body-md font-extrabold tracking-tight truncate max-w-90 sm:max-w-xs">
              {quizTitle ?? '—'}
            </span>
          </div>
        </div>

        {/* Lado Direito: Status secundário */}
        <div className="flex flex-col items-end text-right">
          <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted mb-1">
            Status do Jogo
          </span>
          <span className="text-body-sm font-bold text-white/90">
            {`Sala aberta - ${playerCount} conectado${playerCount === 1 ? '' : 's'}`}
          </span>
        </div>
      </footer>
    </div>
  );
}

// Ícone temporário que será substituído pelo ícone real do jogo posteriormente
function PlaceholderIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-quiz-text-muted"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  );
}