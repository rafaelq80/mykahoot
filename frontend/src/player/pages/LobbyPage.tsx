import { useGameStore } from '../store/useGameStore';
import { TopNavBar } from '../components/TopNavBar';
import { RoomFooterBar } from '../components/RoomFooterBar';

export default function LobbyPage() {
  const playerCount = useGameStore((s) => s.playerCount);
  const playerInfo = useGameStore((s) => s.playerInfo);
  const quizTitle = useGameStore((s) => s.quizTitle);
  const quizImageUrl = useGameStore((s) => s.quizImageUrl);

  return (
    <div className="flex min-h-dvh flex-col bg-quiz-bg-to bg-quiz-gradient text-white">
      <TopNavBar className="py-4" />

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

      <RoomFooterBar quizTitle={quizTitle} quizImageUrl={quizImageUrl} playerCount={playerCount} roomOpen={true} />
    </div>
  );
}