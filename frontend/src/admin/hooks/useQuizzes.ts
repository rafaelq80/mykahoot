import { useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '../../services/api';

export interface Quiz {
  id: string;
  title: string;
  themeId: string;
  theme: { name: string };
  _count: { questions: number };
}

export function useQuizzes(token: string) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch<Quiz[]>('/quizzes', { token });
      setQuizzes(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
      setQuizzes([]);
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar quizzes.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const createQuiz = async (data: { title: string; themeId: string }): Promise<string | null> => {
    try {
      await apiFetch('/quizzes', { method: 'POST', token, body: data });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao criar quiz.';
    }
  };

  const deleteQuiz = async (id: string): Promise<string | null> => {
    try {
      await apiFetch(`/quizzes/${id}`, { method: 'DELETE', token });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao deletar quiz.';
    }
  };

  return { quizzes, loading, error, reload: load, createQuiz, deleteQuiz };
}
