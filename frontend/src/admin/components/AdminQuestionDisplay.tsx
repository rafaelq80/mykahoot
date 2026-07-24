import { useState } from 'react';
import { cn } from '../../lib/utils';

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
}

/** Cartão de alternativa — mesma aparência do OptionButton do jogador, porém não clicável. */
export function AdminOptionCard({
  index,
  text,
  mode,
  isCorrect = false,
}: AdminOptionCardProps) {
  return (
    <div
      className={cn(
        'flex min-h-18 w-full items-center gap-3 rounded-xl px-5 py-3.5 sm:min-h-21 sm:gap-4 sm:px-6',
        'text-left font-bold text-base text-white shadow-md sm:text-lg',
        'whitespace-normal break-words',
        BG_CLASSES[index],
        mode === 'result' && !isCorrect && 'opacity-75 shadow-inner',
      )}
    >
      <span className="text-2xl shrink-0 leading-none sm:text-3xl" aria-hidden="true">
        {ICONS[index]}
      </span>
      <span className="line-clamp-2 min-w-0 flex-1 leading-snug">{text}</span>
      {mode === 'result' && (
        <span className="shrink-0 text-xl font-black">
          {isCorrect ? '✓' : '✕'}
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

/**
 * Exibição da pergunta na tela do professor — mesmo visual e proporções do
 * QuestionView do jogador (card branco + imagem/moldura + alternativas),
 * ocupando toda a área disponível, porém sem interação (somente leitura).
 */
export function AdminQuestionDisplay({
  text,
  imageUrl,
  options,
  mode,
  correctIndex = null,
  voteCounts = [0, 0, 0, 0],
}: AdminQuestionDisplayProps) {
  const [showChart, setShowChart] = useState(true);

  return (
    <div className="flex h-full w-full max-w-5xl min-h-0 flex-1 flex-col gap-3 sm:gap-4">
      {/* Texto da pergunta — card branco, altura fixa, igual ao jogador */}
      <div className="shrink-0 rounded-2xl bg-white px-6 py-3.5 shadow-lg sm:px-8 sm:py-4">
        <h2 className="text-center font-extrabold text-lg leading-snug text-quiz-bg-to sm:text-xl">
          {text}
        </h2>
      </div>

      {/* Image or Bar Chart */}
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2">
        {mode === 'result' && showChart ? (
          <BarChart voteCounts={voteCounts} correctIndex={correctIndex} />
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Imagem da pergunta"
            className="h-full max-h-full w-auto max-w-full rounded-xl border border-quiz-border object-contain shadow-md"
          />
        ) : (
          <DefaultQuestionImage />
        )}
        {mode === 'result' && (
          <button
            type="button"
            onClick={() => setShowChart(!showChart)}
            className="rounded-lg bg-quiz-surface-strong px-4 py-1.5 text-xs font-bold text-white/80 transition-colors hover:bg-quiz-surface hover:text-white"
          >
            {showChart ? 'Mostrar imagem' : 'Mostrar gráfico'}
          </button>
        )}
      </div>

      {/* Alternativas — mesmo grid e tamanho do jogador, sem poder clicar */}
      <div
        className="grid shrink-0 grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3"
        role="group"
        aria-label="Alternativas"
      >
        {options.map((opt, idx) => (
          <AdminOptionCard
            key={idx}
            index={idx as 0 | 1 | 2 | 3}
            text={opt}
            mode={mode}
            isCorrect={mode === 'result' && correctIndex === idx}
          />
        ))}
      </div>
    </div>
  );
}

function BarChart({ voteCounts, correctIndex }: { voteCounts: number[]; correctIndex: number | null }) {
  const max = Math.max(...voteCounts, 1);
  const BG = ['bg-option-a', 'bg-option-b', 'bg-option-c', 'bg-option-d'] as const;
  const CHART_ICONS = ['▲', '◆', '●', '■'] as const;

  return (
    <div className="flex w-full max-w-md items-end justify-center gap-4 h-48 px-4">
      {voteCounts.map((count, idx) => (
        <div key={idx} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-sm font-black tabular-nums text-white">{count}</span>
          <div
            className={cn(
              'w-full rounded-t-lg transition-all duration-500',
              BG[idx],
              correctIndex === idx ? 'ring-2 ring-white' : '',
            )}
            style={{ height: `${(count / max) * 100}%`, minHeight: count > 0 ? '8px' : '2px' }}
          />
          <span className="text-lg" aria-hidden="true">{CHART_ICONS[idx]}</span>
        </div>
      ))}
    </div>
  );
}

function DefaultQuestionImage() {
  return (
    <div
      className="flex h-full max-h-full w-auto aspect-4/3 items-center justify-center rounded-xl border border-quiz-border bg-quiz-surface p-6"
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
