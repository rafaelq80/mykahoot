import { useEffect, useState, useCallback } from 'react';
import { apiFetch, ApiError } from '../../services/api';

export interface Theme {
  id: string;
  name: string;
  description?: string;
}

export function useThemes(token: string) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await apiFetch<Theme[]>('/themes', { token });
      setThemes(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
      setThemes([]);
      setError(err instanceof ApiError ? err.message : 'Erro ao carregar temas.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { void load(); }, [load]);

  const createTheme = async (data: { name: string; description?: string }): Promise<string | null> => {
    try {
      await apiFetch('/themes', { method: 'POST', token, body: { name: data.name, description: data.description || undefined } });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao criar tema.';
    }
  };

  const deleteTheme = async (id: string): Promise<string | null> => {
    try {
      await apiFetch(`/themes/${id}`, { method: 'DELETE', token });
      await load();
      return null;
    } catch (err) {
      return err instanceof ApiError ? err.message : 'Erro ao deletar tema.';
    }
  };

  return { themes, loading, error, reload: load, createTheme, deleteTheme };
}
