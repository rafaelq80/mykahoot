import { useGameStore } from '../../../stores/useGameStore';
import { RankingRow } from '../../../components/shared/RankingRow';

const MEDALS = ['🥇', '🥈', '🥉'] as const;

export function PodiumView() {
  const finalResult = useGameStore((s) => s.finalResult);
  const playerInfo = useGameStore((s) => s.playerInfo);
  const playerCount = useGameStore((s) => s.playerCount);

  if (!finalResult) return null;

  const { top5, you } = finalResult;

  const isSelf = (nickname: string, avatar: string) =>
    playerInfo?.nickname === nickname && playerInfo?.avatar === avatar;

  // Top 3 cards (podium display) — larger, with medal
  const podiumEntries = top5.slice(0, 3);
  // Remaining (4th and 5th)
  const restEntries = top5.slice(3);

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6">
      {/* Title */}
      <h2 className="font-black text-3xl text-brand text-center">
        🏆 FIM DA ARENA 🏆
      </h2>

      {/* Podium top 3 — larger cards */}
      {podiumEntries.length > 0 && (
        <div className="w-full flex flex-col gap-3">
          {podiumEntries.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center gap-4 rounded-xl bg-surface shadow-md border border-surface-container px-5 py-4"
              style={{ animationDelay: `${idx * 80}ms` }}
            >
              <span className="text-3xl" aria-hidden="true">{MEDALS[idx]}</span>
              <span className="text-3xl" aria-hidden="true">{entry.avatar}</span>
              <div className="flex flex-col flex-1 min-w-0">
                <span className="font-bold text-base truncate">
                  {entry.nickname}
                  {isSelf(entry.nickname, entry.avatar) && (
                    <span className="ml-1 text-brand text-xs">(você)</span>
                  )}
                </span>
                <span className="font-mono font-black text-brand text-lg tabular-nums">
                  {entry.score.toLocaleString()} pts
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4th and 5th place */}
      {restEntries.length > 0 && (
        <div className="w-full flex flex-col gap-2">
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

      {/* Show self if outside top 5 */}
      {you.position > 5 && playerInfo && (
        <div className="w-full flex flex-col gap-2">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 text-center">
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

      {/* Final position callout */}
      <p className="rounded-xl bg-surface-container px-6 py-3 text-center text-sm shadow-md border border-surface-container">
        Sua posição final:{' '}
        <span className="font-black text-brand text-lg">
          {you.position}º de {playerCount}
        </span>
      </p>
    </div>
  );
}
