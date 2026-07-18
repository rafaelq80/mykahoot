import { RankingRow } from '../../../components/shared/RankingRow';

export interface PodiumEntry {
  nickname: string;
  avatar: string;
  score: number;
}

interface PodiumDisplayProps {
  top5: PodiumEntry[];
  you?: { score: number; position: number };
  playerInfo?: { nickname: string; avatar: string } | null;
  playerCount?: number;
  headerBadge?: string;
}

export function PodiumDisplay({
  top5,
  you,
  playerInfo,
  playerCount,
}: PodiumDisplayProps) {
  const isSelf = (nickname: string, avatar: string) =>
    playerInfo?.nickname === nickname && playerInfo?.avatar === avatar;

  const first = top5[0];
  const second = top5[1];
  const third = top5[2];
  const restEntries = top5.slice(3);

  return (
    <div className="flex w-full min-h-0 flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-2xl flex-1 min-h-0 flex-col items-center justify-center gap-8 px-4 py-8 overflow-hidden">
        <div className="text-center">
          <h2 className="text-4xl font-black uppercase tracking-wider text-white md:text-5xl">
            Resultados Finais
          </h2>
        </div>

        <div className="mt-4 flex h-72 w-full items-end justify-center gap-3 sm:gap-6">
          {second ? (
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full border-4 border-gray-400 bg-surface-container text-4xl shadow-xl sm:h-20 sm:w-20">
                {second.avatar}
              </div>
              <p className="w-full truncate text-center text-sm font-black tracking-tight">
                {second.nickname}
              </p>
              <p className="mb-1 text-xs font-extrabold text-yellow-400 sm:text-sm">
                {second.score.toLocaleString('pt-BR')} pts
              </p>
              <div className="flex h-24 w-full items-center justify-center rounded-t-2xl border-t border-white/20 bg-slate-400/80 shadow-lg">
                <span className="font-mono text-4xl font-black text-white drop-shadow-sm">2</span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {first ? (
            <div className="z-10 flex min-w-0 flex-1 flex-col items-center">
              <div className="mb-2 flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-400 bg-surface-container text-5xl shadow-2xl sm:h-24 sm:w-24">
                {first.avatar}
              </div>
              <p className="w-full truncate text-center text-base font-black tracking-tight">
                {first.nickname}
              </p>
              <p className="mb-1 text-sm font-extrabold text-yellow-400">
                {first.score.toLocaleString('pt-BR')} pts
              </p>
              <div className="flex h-36 w-full items-center justify-center rounded-t-2xl border-t-4 border-yellow-300 bg-amber-500 shadow-2xl">
                <span className="font-mono text-5xl font-black text-white drop-shadow-sm">1</span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {third ? (
            <div className="flex min-w-0 flex-1 flex-col items-center">
              <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full border-4 border-orange-500 bg-surface-container text-3xl shadow-xl sm:h-16 sm:w-16">
                {third.avatar}
              </div>
              <p className="w-full truncate text-center text-xs font-black tracking-tight sm:text-sm">
                {third.nickname}
              </p>
              <p className="mb-1 text-xs font-extrabold text-yellow-400 sm:text-sm">
                {third.score.toLocaleString('pt-BR')} pts
              </p>
              <div className="flex h-18 w-full items-center justify-center rounded-t-2xl border-t border-white/10 bg-orange-600/90 shadow-lg">
                <span className="font-mono text-3xl font-black text-white drop-shadow-sm">3</span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}
        </div>

        {restEntries.length > 0 && (
          <div className="flex w-full flex-col gap-2 rounded-2xl border border-quiz-border bg-quiz-surface/30 p-3">
            {restEntries.map((entry, idx) => (
              <RankingRow
                key={`${entry.nickname}-${idx}`}
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

        {you && you.position > 5 && playerInfo && (
          <div className="flex w-full flex-col gap-2">
            <p className="text-center text-label-xs font-bold uppercase tracking-widest text-quiz-text-muted">
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

        {you && you.position > 5 && playerCount != null && (
          <p className="rounded-xl border border-quiz-border bg-quiz-surface-strong/60 px-6 py-3 text-center text-body-sm shadow-md">
            Posição final:{' '}
            <span className="ml-1 text-lg font-black">{you.position}º de {playerCount}</span>
          </p>
        )}
      </div>
    </div>
  );
}