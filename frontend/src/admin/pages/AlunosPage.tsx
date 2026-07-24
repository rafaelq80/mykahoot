import { useState } from 'react';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { AlunoForm } from '../components/AlunoForm';
import { Pagination } from '../../shared/components/Pagination';
import { useAlunos } from '../hooks/useAlunos';
import type { AlunoFormData } from '../../schemas/aluno.schema';
import type { Aluno } from '../../types/turma';

const PAGE_SIZE = 10;

const deleteBtnCls = 'rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white active:scale-95 transition-all shrink-0';

interface Props {
  token: string;
  turmaId: string;
  turmaNome?: string;
  onBack: () => void;
}

export function AlunosPage({ token, turmaId, turmaNome, onBack }: Props) {
  const { alunos, createAluno, updateAluno, deleteAluno } = useAlunos(token, turmaId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingAluno, setEditingAluno] = useState<Aluno | null>(null);
  const [page, setPage] = useState(0);

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const totalPages = Math.max(1, Math.ceil(alunos.length / PAGE_SIZE));
  const pageAlunos = alunos.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSubmit = async (data: AlunoFormData) => {
    if (editingAluno) {
      const err = await updateAluno(editingAluno.id, data);
      if (err) { showFeedback(err); return; }
      setEditingAluno(null);
      showFeedback('Aluno atualizado!');
    } else {
      const err = await createAluno(data);
      if (err) { showFeedback(err); return; }
      showFeedback('Aluno adicionado!');
    }
  };

  const handleDelete = async (alunoId: string) => {
    if (!confirm('Remover aluno?')) return;
    const err = await deleteAluno(alunoId);
    if (err) { showFeedback(err); return; }
    showFeedback('Aluno removido.');
  };

  const handleEdit = (aluno: Aluno) => {
    setEditingAluno(aluno);
  };

  const handleCancelEdit = () => {
    setEditingAluno(null);
  };

  return (
    <AdminScreenLayout
      title="Alunos"
      subtitle={turmaNome}
      headerRight={
        <button
          type="button"
          onClick={onBack}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-label-xs font-bold uppercase tracking-[0.14em] text-white transition-all hover:bg-white/25 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        >
          ← Voltar para Turmas
        </button>
      }
    >
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-brand px-5 py-2 font-bold text-white shadow-md text-sm">
          {feedback}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-8">
        {/* Form */}
        <section className="card-glass-strong p-5">
          <h2 className="mb-3 font-black text-base text-white">
            {editingAluno ? 'Editar Aluno' : 'Novo Aluno'}
          </h2>
          <AlunoForm
            mode={editingAluno ? 'edit' : 'create'}
            initialValue={editingAluno ? { nome: editingAluno.nome } : undefined}
            onSubmit={(data) => void handleSubmit(data)}
            onCancelEdit={handleCancelEdit}
          />
        </section>

        {/* Lista */}
        <section className="card-glass-strong flex flex-col gap-3 p-5">
          <h2 className="font-black text-base text-white">Alunos ({alunos.length})</h2>
          {alunos.length === 0 ? (
            <p className="text-sm text-quiz-text-muted">Nenhum aluno cadastrado nesta turma.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {pageAlunos.map((a, idx) => (
                  <li key={a.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                    <div>
                      <span className="text-quiz-text-muted">{page * PAGE_SIZE + idx + 1}. </span>
                      <strong>{a.nome}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(a)}
                        className="rounded-lg border border-quiz-border px-2 py-1 text-xs font-bold text-white transition-colors hover:bg-quiz-surface active:scale-95"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        className={deleteBtnCls}
                        onClick={() => void handleDelete(a.id)}
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
