import { useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '../../services/api';
import type { Aluno } from '../../types/turma';
export type { Aluno };

export function useAlunos(token: string, turmaId: string | null) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!turmaId) { setAlunos([]); return; }
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch<Aluno[]>(`/turmas/${turmaId}/alunos`, { token });
      setAlunos(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
      setAlunos([]);
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar alunos.');
    } finally {
      setLoading(false);
    }
  }, [token, turmaId]);

  useEffect(() => { void load(); }, [load]);

  const createAluno = async (data: { nome: string }): Promise<string | null> => {
    if (!turmaId) return 'Nenhuma turma selecionada.';
    try {
      await apiFetch(`/turmas/${turmaId}/alunos`, { method: 'POST', token, body: data });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao adicionar aluno.';
    }
  };

  const updateAluno = async (alunoId: string, data: { nome?: string }): Promise<string | null> => {
    if (!turmaId) return 'Nenhuma turma selecionada.';
    try {
      await apiFetch(`/turmas/${turmaId}/alunos/${alunoId}`, { method: 'PATCH', token, body: data });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao atualizar aluno.';
    }
  };

  const deleteAluno = async (alunoId: string): Promise<string | null> => {
    if (!turmaId) return 'Nenhuma turma selecionada.';
    try {
      await apiFetch(`/turmas/${turmaId}/alunos/${alunoId}`, { method: 'DELETE', token });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao remover aluno.';
    }
  };

  return { alunos, loading, error, reload: load, createAluno, updateAluno, deleteAluno };
}
