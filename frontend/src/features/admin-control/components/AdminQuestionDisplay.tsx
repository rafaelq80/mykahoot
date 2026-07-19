import { cn } from '../../../lib/utils';

const ICONS = ['▲', '◆', '●', '■'] as const;
const BG_CLASSES = [
  'bg-option-a',
  'bg-option-b',
  'bg-option-c',
  'bg-option-d',
] as const;

export type AdminOptionMode = 'preview' | 'result';

interface AdminOptionCardProps {
  index: 0 | 1 | 2 | 3;
  text: string;
  mode: AdminOptionMode;
  isCorrect?: boolean;
  voteCount?: number;
}

export function AdminOptionCard({
  index,
  text,
  mode,
  isCorrect = false,
  voteCount = 0,
}: AdminOptionCardProps) {
  return (
    <div
      className={cn(
        'flex min-h-18 w-full items-center gap-4 rounded-xl px-5 py-4',
        'text-left font-bold text-lg text-white shadow-md',
        BG_CLASSES[index],
        mode === 'result' && isCorrect && 'ring-4 ring-white ring-offset-2',
        mode === 'result' && !isCorrect && 'opacity-85',
      )}
    >
      <span className="shrink-0 text-2xl leading-none" aria-hidden="true">
        {mode === 'result' && isCorrect ? '✓' : ICONS[index]}
      </span>
      <span className="min-w-0 flex-1 leading-snug">{text}</span>
      {mode === 'result' && (
        <span
          className={cn(
            'shrink-0 rounded-full px-3 py-1 text-sm font-black tabular-nums',
            isCorrect ? 'bg-white text-brand' : 'bg-quiz-surface-strong text-white',
          )}
        >
          {voteCount}
        </span>
      )}
    </div>
  );
}

interface AdminQuestionDisplayProps {
  text: string;
  imageUrl: string | null;
  options: string[];
  mode: AdminOptionMode;
  correctIndex?: number | null;
  voteCounts?: number[];
}

export function AdminQuestionDisplay({
  text,
  imageUrl,
  options,
  mode,
  correctIndex = null,
  voteCounts = [0, 0, 0, 0],
}: AdminQuestionDisplayProps) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <h2 className="text-center font-extrabold text-2xl leading-snug text-white sm:text-3xl">
        {text}
      </h2>

      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Imagem da pergunta"
          className="mx-auto aspect-4/3 w-full max-w-sm rounded-xl border border-quiz-border object-cover shadow-lg"
        />
      ) : (
        <div
          className="mx-auto flex aspect-4/3 w-full max-w-sm items-center justify-center rounded-xl border border-quiz-border bg-quiz-surface p-6"
          role="img"
          aria-label="Pergunta sem imagem"
        >
          <div className="flex h-full w-2/3 items-center justify-center rounded-lg bg-quiz-surface-strong">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              className="text-white/50"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((opt, idx) => (
          <AdminOptionCard
            key={idx}
            index={idx as 0 | 1 | 2 | 3}
            text={opt}
            mode={mode}
            isCorrect={mode === 'result' && correctIndex === idx}
            voteCount={voteCounts[idx] ?? 0}
          />
        ))}
      </div>
    </div>
  );
}

export function computeVoteCounts(
  ranking: { selectedIndex: number }[],
): number[] {
  const counts = [0, 0, 0, 0];
  for (const entry of ranking) {
    if (entry.selectedIndex >= 0 && entry.selectedIndex <= 3) {
      counts[entry.selectedIndex]++;
    }
  }
  return counts;
}