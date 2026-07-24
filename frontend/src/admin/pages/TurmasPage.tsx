import { useState } from 'react';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { TurmaForm } from '../components/TurmaForm';
import { AlunosPage } from './AlunosPage';
import { Pagination } from '../../shared/components/Pagination';
import { useTurmas } from '../hooks/useTurmas';
import type { TurmaFormData } from '../../schemas/turma.schema';
import type { Turma } from '../../types/turma';

const PAGE_SIZE = 10;

const deleteBtnCls = 'rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white active:scale-95 transition-all shrink-0';

interface Props {
  token: string;
}

export function AdminTurmasPage({ token }: Props) {
  const { turmas, createTurma, updateTurma, deleteTurma } = useTurmas(token);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingTurma, setEditingTurma] = useState<Turma | null>(null);
  const [managingTurmaId, setManagingTurmaId] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const managingTurma = turmas.find((t) => t.id === managingTurmaId) ?? null;

  if (managingTurmaId) {
    return (
      <AlunosPage
        token={token}
        turmaId={managingTurmaId}
        turmaNome={managingTurma?.nome}
        onBack={() => setManagingTurmaId(null)}
      />
    );
  }

  const totalPages = Math.max(1, Math.ceil(turmas.length / PAGE_SIZE));
  const pageTurmas = turmas.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSubmit = async (data: TurmaFormData) => {
    if (editingTurma) {
      const err = await updateTurma(editingTurma.id, data);
      if (err) { showFeedback(err); return; }
      setEditingTurma(null);
      showFeedback('Turma atualizada!');
    } else {
      const err = await createTurma(data);
      if (err) { showFeedback(err); return; }
      showFeedback('Turma criada!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar turma? Todos os alunos dela também serão removidos.')) return;
    const err = await deleteTurma(id);
    if (err) { showFeedback(err); return; }
    showFeedback('Turma removida.');
  };

  const handleEdit = (turma: Turma) => {
    setEditingTurma(turma);
  };

  const handleCancelEdit = () => {
    setEditingTurma(null);
  };

  return (
    <AdminScreenLayout title="Turmas" subtitle="Gerencie turmas e alunos">
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-brand px-5 py-2 font-bold text-white shadow-md text-sm">
          {feedback}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-8">
        {/* Form */}
        <section className="card-glass-strong p-5">
          <h2 className="mb-3 font-black text-base text-white">
            {editingTurma ? 'Editar Turma' : 'Nova Turma'}
          </h2>
          <TurmaForm
            mode={editingTurma ? 'edit' : 'create'}
            initialValue={editingTurma ? { nome: editingTurma.nome } : undefined}
            onSubmit={(data) => void handleSubmit(data)}
            onCancelEdit={handleCancelEdit}
          />
        </section>

        {/* Lista */}
        <section className="card-glass-strong flex flex-col gap-3 p-5">
          <h2 className="font-black text-base text-white">Turmas ({turmas.length})</h2>
          {turmas.length === 0 ? (
            <p className="text-sm text-quiz-text-muted">Nenhuma turma cadastrada.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {pageTurmas.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                    <div>
                      <strong>{t.nome}</strong>
                      <span className="ml-2 text-quiz-text-muted">({t.alunos.length} aluno{t.alunos.length === 1 ? '' : 's'})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setManagingTurmaId(t.id)}
                        className="rounded-lg border border-quiz-border px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-quiz-surface active:scale-95"
                      >
                        Alunos
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(t)}
                        className="rounded-lg border border-quiz-border px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-quiz-surface active:scale-95"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={deleteBtnCls}
                        onClick={() => void handleDelete(t.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              {totalPages > 1 && (
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
              )}
            </>
          )}
        </section>
      </div>
    </AdminScreenLayout>
  );
}
