import { cn } from '../../lib/utils';
import type { Question } from '../../types/quiz';

interface QuestionEditorProps {
  index: number;
  question: Question;
  inputCls: string;
  onChange: <K extends keyof Question>(field: K, value: Question[K]) => void;
  onSave: () => void;
  onDelete: () => void;
}

export function QuestionEditor({
  index,
  question,
  inputCls,
  onChange,
  onSave,
  onDelete,
}: QuestionEditorProps) {
  return (
    <div className="card-glass flex flex-col gap-2 rounded-xl border border-quiz-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-quiz-text-muted">
          Pergunta {index + 1}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white transition-all active:scale-95"
        >
          ✕ Excluir
        </button>
      </div>
      <textarea className={inputCls} rows={2} value={question.text} onChange={(e) => onChange('text', e.target.value)} />
      {question.options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${question.id}`}
            checked={question.correctIndex === i}
            onChange={() => onChange('correctIndex', i)}
            className="accent-brand"
            aria-label={`Alt ${i + 1} correta`}
          />
          <input
            className={inputCls}
            value={opt}
            onChange={(e) => {
              const options = [...question.options];
              options[i] = e.target.value;
              onChange('options', options);
            }}
          />
        </div>
      ))}
      <div className="flex gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
          Tempo (s)
          <input
            type="number"
            className={cn(inputCls, 'w-20')}
            min={5}
            max={120}
            value={question.timeLimitSec}
            onChange={(e) => onChange('timeLimitSec', Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
          Ordem
          <input
            type="number"
            className={cn(inputCls, 'w-20')}
            min={1}
            value={question.order}
            onChange={(e) => onChange('order', Number(e.target.value))}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={onSave}
        className="self-start rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white transition-all active:scale-95"
      >
        Salvar pergunta
      </button>
    </div>
  );
}
