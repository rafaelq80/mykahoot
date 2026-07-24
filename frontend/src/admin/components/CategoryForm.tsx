import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { themeSchema } from '../../schemas/theme.schema';
import type { ThemeFormData } from '../../schemas/theme.schema';

const inputCls = 'w-full rounded-lg border border-quiz-border bg-quiz-surface px-3 py-2 text-sm font-medium text-white placeholder:text-quiz-text-muted focus:border-quiz-highlight focus:outline-none';
const btnCls = 'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';

interface CategoryFormProps {
  mode: 'create' | 'edit';
  initialValue?: ThemeFormData;
  onSubmit: (data: ThemeFormData) => void;
  onCancelEdit?: () => void;
}

export function CategoryForm({ mode, initialValue, onSubmit, onCancelEdit }: CategoryFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ThemeFormData>({
    resolver: zodResolver(themeSchema),
    defaultValues: initialValue ?? { name: '', description: '' },
  });

  useEffect(() => {
    if (initialValue) {
      reset(initialValue);
    } else {
      reset({ name: '', description: '' });
    }
  }, [initialValue, reset]);

  const handle = (data: ThemeFormData) => {
    onSubmit(data);
    if (mode === 'create') reset({ name: '', description: '' });
  };

  return (
    <div className="flex flex-col gap-3">
      <input className={inputCls} placeholder="Nome do tema *" {...register('name')} />
      {errors.name && <p className="text-sm font-bold text-option-a">{errors.name.message}</p>}
      <input className={inputCls} placeholder="Descrição (opcional)" {...register('description')} />
      <div className="flex items-center gap-2">
        <button type="button" className={btnCls} onClick={() => void handleSubmit(handle)()}>
          {mode === 'edit' ? 'Salvar' : '+ Criar tema'}
        </button>
        {mode === 'edit' && onCancelEdit && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-lg border border-quiz-border px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-quiz-surface active:scale-95"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
