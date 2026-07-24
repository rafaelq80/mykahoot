import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { alunoSchema } from '../../schemas/aluno.schema';
import type { AlunoFormData } from '../../schemas/aluno.schema';

const inputCls = 'w-full rounded-lg border border-quiz-border bg-quiz-surface px-3 py-2 text-sm font-medium text-white placeholder:text-quiz-text-muted focus:border-quiz-highlight focus:outline-none';
const btnCls = 'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';

interface AlunoFormProps {
  mode: 'create' | 'edit';
  initialValue?: AlunoFormData;
  onSubmit: (data: AlunoFormData) => void;
  onCancelEdit?: () => void;
}

export function AlunoForm({ mode, initialValue, onSubmit, onCancelEdit }: AlunoFormProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AlunoFormData>({
    resolver: zodResolver(alunoSchema),
    defaultValues: initialValue ?? { nome: '' },
  });

  useEffect(() => {
    if (initialValue) {
      reset(initialValue);
    } else {
      reset({ nome: '' });
    }
  }, [initialValue, reset]);

  const handle = (data: AlunoFormData) => {
    onSubmit(data);
    if (mode === 'create') reset({ nome: '' });
  };

  return (
    <div className="flex flex-col gap-3">
      <input className={inputCls} placeholder="Nome do aluno *" {...register('nome')} />
      {errors.nome && <p className="text-sm font-bold text-option-a">{errors.nome.message}</p>}
      <div className="flex items-center gap-2">
        <button type="button" className={btnCls} onClick={() => void handleSubmit(handle)()}>
          {mode === 'edit' ? 'Salvar' : '+ Adicionar aluno'}
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
