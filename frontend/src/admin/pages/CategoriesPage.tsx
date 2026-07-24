import { useState } from 'react';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { CategoryForm } from '../components/CategoryForm';
import { Pagination } from '../../shared/components/Pagination';
import { useThemes } from '../hooks/useThemes';
import type { ThemeFormData } from '../../schemas/theme.schema';
import type { Theme } from '../../types/quiz';

const PAGE_SIZE = 10;

const deleteBtnCls = 'rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white active:scale-95 transition-all shrink-0';

export function CategoriesPage({ token }: { token: string }) {
  const { themes, createTheme, updateTheme, deleteTheme } = useThemes(token);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
  const [page, setPage] = useState(0);

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const totalPages = Math.max(1, Math.ceil(themes.length / PAGE_SIZE));
  const pageThemes = themes.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSubmit = async (data: ThemeFormData) => {
    if (editingTheme) {
      const err = await updateTheme(editingTheme.id, data);
      if (err) { showFeedback(err); return; }
      setEditingTheme(null);
      showFeedback('Tema atualizado!');
    } else {
      const err = await createTheme(data);
      if (err) { showFeedback(err); return; }
      showFeedback('Tema criado!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deletar tema?')) return;
    const err = await deleteTheme(id);
    if (err) { showFeedback(err); return; }
    showFeedback('Tema removido.');
  };

  const handleEdit = (theme: Theme) => {
    setEditingTheme(theme);
  };

  const handleCancelEdit = () => {
    setEditingTheme(null);
  };

  return (
    <AdminScreenLayout title="Categorias" subtitle="Gerencie os temas dos quizzes">
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-brand px-5 py-2 font-bold text-white shadow-md text-sm">
          {feedback}
        </div>
      )}

      <div className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-8">
        {/* Form */}
        <section className="card-glass-strong p-5">
          <h2 className="mb-3 font-black text-base text-white">
            {editingTheme ? 'Editar Tema' : 'Novo Tema'}
          </h2>
          <CategoryForm
            mode={editingTheme ? 'edit' : 'create'}
            initialValue={editingTheme ? { name: editingTheme.name, description: editingTheme.description ?? '' } : undefined}
            onSubmit={(data) => void handleSubmit(data)}
            onCancelEdit={handleCancelEdit}
          />
        </section>

        {/* Lista */}
        <section className="card-glass-strong flex flex-col gap-3 p-5">
          <h2 className="font-black text-base text-white">Temas ({themes.length})</h2>
          {themes.length === 0 ? (
            <p className="text-sm text-quiz-text-muted">Nenhum tema cadastrado.</p>
          ) : (
            <>
              <ul className="flex flex-col gap-2">
                {pageThemes.map((t) => (
                  <li key={t.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                    <div>
                      <strong>{t.name}</strong>
                      {t.description && <span className="ml-1 text-quiz-text-muted">— {t.description}</span>}
                    </div>
                    <div className="flex items-center gap-2">
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
