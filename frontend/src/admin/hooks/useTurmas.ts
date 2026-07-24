import { useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '../../services/api';
import type { Turma } from '../../types/turma';
export type { Turma };

export function useTurmas(token: string) {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch<Turma[]>('/turmas', { token });
      setTurmas(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
      setTurmas([]);
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar turmas.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const createTurma = async (data: { nome: string }): Promise<string | null> => {
    try {
      await apiFetch('/turmas', { method: 'POST', token, body: data });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao criar turma.';
    }
  };

  const updateTurma = async (id: string, data: { nome?: string }): Promise<string | null> => {
    try {
      await apiFetch(`/turmas/${id}`, { method: 'PATCH', token, body: data });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao atualizar turma.';
    }
  };

  const deleteTurma = async (id: string): Promise<string | null> => {
    try {
      await apiFetch(`/turmas/${id}`, { method: 'DELETE', token });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao deletar turma.';
    }
  };

  return { turmas, loading, error, reload: load, createTurma, updateTurma, deleteTurma };
}
