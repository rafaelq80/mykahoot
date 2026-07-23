const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

let _onUnauthorized: (() => void) | null = null;

/**
 * Registra um callback global chamado sempre que a API responder 401.
 * Útil para logout automático.
 */
export function setOnUnauthorized(cb: (() => void) | null): void {
  _onUnauthorized = cb;
}

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'body'> {
  token?: string;
  body?: unknown;
}

/**
 * Client fetch fino para a API do backend.
 *
 * - Monta URL completa a partir de `path` (ex: `/themes`, `/quizzes/123`)
 * - Adiciona Authorization Bearer se `token` for passado
 * - Serializa `body` como JSON automaticamente (exceto FormData)
 * - Checa `res.ok`; lança `ApiError` com a `message` do backend em caso de falha
 * - Se 401, chama o callback `onUnauthorized` registrado (se houver)
 */
export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const { token, body, headers: customHeaders, ...rest } = options ?? {};

  const headers = new Headers(customHeaders as HeadersInit | undefined);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  let processedBody: BodyInit | undefined;

  if (body !== undefined && body !== null) {
    if (body instanceof FormData) {
      processedBody = body;
    } else if (typeof body === 'string') {
      if (!headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      processedBody = body;
    } else {
      headers.set('Content-Type', 'application/json');
      processedBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers,
    body: processedBody,
  });

  if (!res.ok) {
    let message = `Erro ${res.status}`;
    try {
      const err = (await res.json()) as { message?: string };
      if (err.message) {
        message = Array.isArray(err.message) ? (err.message as string[]).join('; ') : err.message;
      }
    } catch {
      // corpo não era JSON — usa mensagem genérica
    }

    if (res.status === 401 && _onUnauthorized) {
      _onUnauthorized();
    }

    throw new ApiError(res.status, message);
  }

  // 204 No Content — retorna undefined cast como T
  if (res.status === 204) {
    return undefined as unknown as T;
  }

  return (await res.json()) as T;
}
