import { useEffect, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import type { Turma } from '../types/turma';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export function AdminTurmasPage({ token }: { token: string }) {
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [selectedTurmaId, setSelectedTurmaId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [turmaNome, setTurmaNome] = useState('');
  const [alunoNome, setAlunoNome] = useState('');

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const loadTurmas = useCallback(async () => {
    const r = await fetch(`${API_URL}/turmas`);
    setTurmas((await r.json()) as Turma[]);
  }, []);

  useEffect(() => { void loadTurmas(); }, []);

  const selectedTurma = turmas.find((t) => t.id === selectedTurmaId) ?? null;

  const createTurma = async () => {
    if (!turmaNome.trim()) return;
    await fetch(`${API_URL}/turmas`, { method: 'POST', headers: h, body: JSON.stringify({ nome: turmaNome }) });
    setTurmaNome(''); await loadTurmas(); showFeedback('Turma criada!');
  };
  const deleteTurma = async (id: string) => {
    if (!confirm('Deletar turma? Todos os alunos dela também serão removidos.')) return;
    await fetch(`${API_URL}/turmas/${id}`, { method: 'DELETE', headers: h });
    if (selectedTurmaId === id) setSelectedTurmaId(null);
    await loadTurmas(); showFeedback('Turma removida.');
  };
  const createAluno = async () => {
    if (!selectedTurmaId || !alunoNome.trim()) return;
    await fetch(`${API_URL}/turmas/${selectedTurmaId}/alunos`, { method: 'POST', headers: h, body: JSON.stringify({ nome: alunoNome }) });
    setAlunoNome(''); await loadTurmas(); showFeedback('Aluno adicionado!');
  };
  const deleteAluno = async (alunoId: string) => {
    if (!selectedTurmaId || !confirm('Remover aluno?')) return;
    await fetch(`${API_URL}/turmas/${selectedTurmaId}/alunos/${alunoId}`, { method: 'DELETE', headers: h });
    await loadTurmas(); showFeedback('Aluno removido.');
  };

  const inputCls = 'w-full rounded-lg border-2 border-surface bg-surface px-3 py-2 text-sm font-medium focus:border-brand focus:outline-none';
  const btnCls = 'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';
  const deleteBtnCls = 'rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white active:scale-95 transition-all shrink-0';

  return (
    <div className="min-h-full flex-1 p-4 sm:p-6">
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-brand px-5 py-2 font-bold text-white shadow-md text-sm">
          {feedback}
        </div>
      )}

      {/* Card branco sobre o fundo roxo do admin, mesmo padrão do AdminQuizzesPage */}
      <div className="rounded-2xl bg-white shadow-xl flex flex-col lg:flex-row gap-0 divide-y lg:divide-y-0 lg:divide-x divide-surface-container overflow-hidden">
        {/* Turmas */}
        <section className="flex flex-col gap-3 p-5 lg:w-80">
          <h2 className="font-black text-base text-brand">Turmas</h2>
          <input className={inputCls} placeholder="Nome da turma *" value={turmaNome} onChange={(e) => setTurmaNome(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void createTurma()} />
          <button type="button" className={btnCls} onClick={() => void createTurma()}>+ Criar turma</button>
          <ul className="flex flex-col gap-2 mt-2">
            {turmas.map((t) => (
              <li key={t.id}
                className={cn('flex items-center justify-between rounded-lg border p-3 text-sm cursor-pointer transition-colors', selectedTurmaId === t.id ? 'border-brand bg-brand/5' : 'border-surface-container hover:bg-surface-container')}
                onClick={() => setSelectedTurmaId(t.id)}>
                <div><strong>{t.nome}</strong><span className="ml-1 text-gray-400">({t.alunos.length} aluno{t.alunos.length === 1 ? '' : 's'})</span></div>
                <button type="button" className={deleteBtnCls} onClick={(e) => { e.stopPropagation(); void deleteTurma(t.id); }}>✕</button>
              </li>
            ))}
            {turmas.length === 0 && (
              <li className="text-sm text-gray-400 italic px-1">Nenhuma turma cadastrada ainda.</li>
            )}
          </ul>
        </section>

        {/* Alunos */}
        {selectedTurma && (
          <section className="flex flex-col gap-3 p-5 flex-1">
            <h2 className="font-black text-base text-brand">Alunos — {selectedTurma.nome}</h2>
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Nome do aluno *" value={alunoNome} onChange={(e) => setAlunoNome(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && void createAluno()} />
              <button type="button" className={cn(btnCls, 'shrink-0')} disabled={!alunoNome.trim()} onClick={() => void createAluno()}>+ Adicionar</button>
            </div>
            <ul className="flex flex-col gap-2 mt-2">
              {selectedTurma.alunos.map((a, idx) => (
                <li key={a.id} className="flex items-center justify-between rounded-lg border border-surface-container p-3 text-sm">
                  <div><span className="text-gray-400">{idx + 1}. </span><strong>{a.nome}</strong></div>
                  <button type="button" className={deleteBtnCls} onClick={() => void deleteAluno(a.id)}>✕</button>
                </li>
              ))}
              {selectedTurma.alunos.length === 0 && (
                <li className="text-sm text-gray-400 italic px-1">Nenhum aluno cadastrado nesta turma ainda.</li>
              )}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
