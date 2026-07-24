interface RoomFooterBarProps {
  quizTitle: string | null;
  quizImageUrl: string | null;
  playerCount: number;
  roomOpen: boolean;
}

export function RoomFooterBar({ quizTitle, quizImageUrl, playerCount, roomOpen }: RoomFooterBarProps) {
  return (
    <footer className="grid w-full grid-cols-2 items-center border-t border-quiz-border bg-quiz-surface px-4 py-3 sm:px-6">
      <div className="flex flex-col items-start">
        {roomOpen && quizTitle ? (
          <div className="flex items-center gap-2">
            {quizImageUrl ? (
              <img
                src={quizImageUrl}
                alt=""
                className="h-5 w-5 shrink-0 rounded-full object-cover"
              />
            ) : (
              <PlaceholderIcon />
            )}
            <span className="text-body-md font-extrabold tracking-tight text-white/90 truncate max-w-40 sm:max-w-xs">
              {quizTitle}
            </span>
          </div>
        ) : (
          <>
            <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted mb-1">
              Jogadores na sala
            </span>
            <span className="text-body-md font-extrabold tracking-tight text-white/90">
              {playerCount} {playerCount === 1 ? 'conectado' : 'conectados'}
            </span>
          </>
        )}
      </div>
      <div className="flex flex-col items-end text-right">
        <span className="text-label-xs font-bold uppercase tracking-[0.14em] text-quiz-text-muted mb-1">
          Status do Jogo
        </span>
        <span className="text-body-sm font-bold text-white/90">
          {roomOpen
            ? `Sala aberta - ${playerCount} conectado${playerCount === 1 ? '' : 's'}`
            : 'Aguardando professor'}
        </span>
      </div>
    </footer>
  );
}

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
      className="text-quiz-text-muted shrink-0"
      aria-hidden="true"
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
      <path d="M6 6h10" />
      <path d="M6 10h10" />
    </svg>
  );
}
