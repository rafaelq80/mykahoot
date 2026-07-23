import { useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '../../services/api';

export interface Question {
  id: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
  order: number;
}

export interface CreateQuestionPayload {
  text: string;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
  order: number;
  imageUrl: string | null;
}

export function useQuestions(token: string, quizId: string | null) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!quizId) { setQuestions([]); return; }
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch<Question[]>(`/quizzes/${quizId}/questions`, { token });
      setQuestions(Array.isArray(d) ? [...d].sort((a, b) => a.order - b.order) : []);
    } catch (err) {
      console.error(err);
      setQuestions([]);
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar perguntas.');
    } finally {
      setLoading(false);
    }
  }, [token, quizId]);

  useEffect(() => { void load(); }, [load]);

  const createQuestion = async (data: CreateQuestionPayload): Promise<string | null> => {
    if (!quizId) return 'Nenhum quiz selecionado.';
    try {
      await apiFetch(`/quizzes/${quizId}/questions`, { method: 'POST', token, body: data });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao criar pergunta.';
    }
  };

  const deleteQuestion = async (questionId: string): Promise<string | null> => {
    if (!quizId) return 'Nenhum quiz selecionado.';
    try {
      await apiFetch(`/quizzes/${quizId}/questions/${questionId}`, { method: 'DELETE', token });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao deletar pergunta.';
    }
  };

  return { questions, loading, error, reload: load, createQuestion, deleteQuestion };
}
