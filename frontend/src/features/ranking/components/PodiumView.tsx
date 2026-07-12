import { useGameStore } from '../../../stores/useGameStore';
import { RankingRow } from '../../../components/shared/RankingRow';

const APP_NAME = 'QuizMaster Live';

export function PodiumView() {
  const finalResult = useGameStore((s) => s.finalResult);
  const playerInfo = useGameStore((s) => s.playerInfo);
  const playerCount = useGameStore((s) => s.playerCount);

  if (!finalResult) return null;

  const { top5, you } = finalResult;

  const isSelf = (nickname: string, avatar: string) =>
    playerInfo?.nickname === nickname && playerInfo?.avatar === avatar;

  // Separação das posições para o pódio gráfico 3D
  const first = top5[0];
  const second = top5[1];
  const third = top5[2];
  const restEntries = top5.slice(3);

  return (
    <div className="w-full flex flex-col min-h-dvh">
      
      {/* Cabeçalho idêntico ao da página Lobby */}
      <header className="flex items-center justify-between px-4 py-4 sm:px-6 border-b border-quiz-border bg-quiz-surface w-full">
        <div className="flex items-center gap-3">
          <span className="font-extrabold text-lg sm:text-xl">{APP_NAME}</span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-quiz-highlight px-4 py-1.5 text-label-xs font-extrabold uppercase tracking-[0.14em] text-quiz-highlight-foreground shadow-sm">
          <span
            className="inline-block h-2 w-2 rounded-full bg-quiz-highlight-foreground animate-pulse"
            aria-hidden="true"
          />
          Partida Finalizada
        </div>
      </header>

      {/* Miolo do Pódio */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto w-full gap-8">
        
        {/* Títulos em português */}
        <div className="text-center">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-wider text-white">
            Resultados Finais
          </h2>
          <p className="text-sm md:text-base font-bold text-white/60 mt-1 tracking-widest uppercase">
            Os campeões surgiram!
          </p>
        </div>

        {/* Estrutura 3D do Pódio baseada na imagem de referência */}
        <div className="flex items-end justify-center w-full gap-3 sm:gap-6 h-72 mt-4">
          
          {/* 2º LUGAR (Esquerda) */}
          {second ? (
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className="relative mb-2">
                <div className="flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full text-4xl shadow-xl border-4 border-gray-400 bg-surface-container">
                  {second.avatar}
                </div>
              </div>
              <p className="font-black text-sm text-center truncate w-full tracking-tight">
                {second.nickname}
                {isSelf(second.nickname, second.avatar) && <span className="text-xs text-quiz-text-muted block">(você)</span>}
              </p>
              <p className="text-yellow-400 font-extrabold text-xs sm:text-sm mb-1">
                {second.score.toLocaleString('pt-BR')} pts
              </p>
              <div className="w-full bg-slate-400/80 h-24 rounded-t-2xl flex items-center justify-center shadow-lg border-t border-white/20">
                <span className="text-white/20 text-4xl font-black font-mono">2</span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* 1º LUGAR (Centro) */}
          {first ? (
            <div className="flex flex-col items-center flex-1 min-w-0 z-10">
              <div className="relative mb-2">
                <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-full text-5xl shadow-2xl border-4 border-yellow-400 bg-surface-container">
                  {first.avatar}
                </div>
              </div>
              <p className="font-black text-base text-center truncate w-full tracking-tight">
                {first.nickname}
                {isSelf(first.nickname, first.avatar) && <span className="text-xs text-quiz-text-muted block">(você)</span>}
              </p>
              <p className="text-yellow-400 font-extrabold text-sm mb-1">
                {first.score.toLocaleString('pt-BR')} pts
              </p>
              <div className="w-full bg-amber-500 h-36 rounded-t-2xl flex items-center justify-center shadow-2xl border-t-4 border-yellow-300">
                <span className="text-white/30 text-5xl font-black font-mono">1</span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* 3º LUGAR (Direita) */}
          {third ? (
            <div className="flex flex-col items-center flex-1 min-w-0">
              <div className="relative mb-2">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full text-3xl shadow-xl border-4 border-orange-500 bg-surface-container">
                  {third.avatar}
                </div>
              </div>
              <p className="font-black text-xs sm:text-sm text-center truncate w-full tracking-tight">
                {third.nickname}
                {isSelf(third.nickname, third.avatar) && <span className="text-xs text-quiz-text-muted block">(você)</span>}
              </p>
              <p className="text-yellow-400 font-extrabold text-xs sm:text-sm mb-1">
                {third.score.toLocaleString('pt-BR')} pts
              </p>
              <div className="w-full bg-orange-600/90 h-18 rounded-t-2xl flex items-center justify-center shadow-lg border-t border-white/10">
                <span className="text-white/20 text-3xl font-black font-mono">3</span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

        </div>

        {/* Linhas Restantes (4º e 5º Lugar) */}
        {restEntries.length > 0 && (
          <div className="w-full flex flex-col gap-2 bg-quiz-surface/30 p-3 rounded-2xl border border-quiz-border">
            {restEntries.map((entry, idx) => (
              <RankingRow
                key={idx + 3}
                position={idx + 4}
                avatar={entry.avatar}
                nickname={entry.nickname}
                score={entry.score}
                isSelf={isSelf(entry.nickname, entry.avatar)}
                animationDelay={`${(idx + 3) * 80}ms`}
              />
            ))}
          </div>
        )}

        {/* Exibir o próprio jogador caso esteja abaixo do Top 5 */}
        {you.position > 5 && playerInfo && (
          <div className="w-full flex flex-col gap-2">
            <p className="text-label-xs font-bold uppercase tracking-widest text-quiz-text-muted text-center">
              Sua posição
            </p>
            <RankingRow
              position={you.position}
              avatar={playerInfo.avatar}
              nickname={playerInfo.nickname}
              score={you.score}
              isSelf
            />
          </div>
        )}

        {/* Callout de posição final e Botão para Admin */}
        <div className="w-full flex flex-col items-center gap-4 mt-2">
          <p className="rounded-xl bg-quiz-surface-strong/60 px-6 py-3 text-center text-body-sm shadow-md border border-quiz-border">
            Sua posição final:{' '}
            <span className="font-white text-lg ml-1">
              {you.position}º de {playerCount}
            </span>
          </p>
        </div>

      </div>
    </div>
  );
}