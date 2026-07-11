import { useGameStore } from '../../../stores/useGameStore';
import { RankingRow } from '../../../components/shared/RankingRow';
import { cn } from '../../../lib/utils';

const ICONS = ['▲', '◆', '●', '■'] as const;

export function QuestionResultView() {
  const questionResult = useGameStore((s) => s.questionResult);
  const question = useGameStore((s) => s.question);
  const playerInfo = useGameStore((s) => s.playerInfo);

  if (!questionResult || !question) return null;

  const { you, top5, correctIndex } = questionResult;
  const correctOption = question.options[correctIndex];

  const isSelf = (nickname: string, avatar: string) =>
    playerInfo?.nickname === nickname && playerInfo?.avatar === avatar;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5 animate-[slideUp_0.4s_ease_both]">
      {/* Correct / Wrong banner */}
      <div
        className={cn(
          'w-full rounded-xl px-5 py-5 text-center shadow-md',
          you.correct ? 'bg-option-d' : 'bg-option-a',
        )}
        role="status"
      >
        <p className="font-black text-3xl text-white">
          {you.correct ? '✓ CORRETO!' : '✗ Errou!'}
        </p>
        <p className="mt-2 font-bold text-xl text-white/90">
          {you.correct
            ? `+${you.score.toLocaleString()} pts`
            : '+0 pts'}
        </p>
      </div>

      {/* Correct answer */}
      <p className="text-center text-sm text-gray-500">
        Resposta certa:{' '}
        <span className="font-bold text-gray-800">
          {ICONS[correctIndex]} {correctOption}
        </span>
      </p>

      {/* Top 5 */}
      <div className="w-full">
        <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">
          Top 5
        </p>
        <div className="flex flex-col gap-2">
          {top5.map((entry, idx) => (
            <RankingRow
              key={idx}
              position={idx + 1}
              avatar={entry.avatar}
              nickname={entry.nickname}
              score={entry.score}
              isSelf={isSelf(entry.nickname, entry.avatar)}
              animationDelay={`${idx * 60}ms`}
            />
          ))}

          {/* Show self if outside top 5 */}
          {you.position > 5 && playerInfo && (
            <RankingRow
              position={you.position}
              avatar={playerInfo.avatar}
              nickname={playerInfo.nickname}
              score={you.score}
              isSelf
            />
          )}
        </div>
      </div>

      <p className="text-sm text-gray-400 animate-pulse motion-reduce:animate-none">
        Aguardando o professor...
      </p>
    </div>
  );
}
