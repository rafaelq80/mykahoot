/**
 * Serviço centralizado de upload de imagem para ImageKit.
 * Substitui as cópias inline que existiam em AdminQuizzesPage e EditQuizPage.
 */

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const IK_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY ?? '';
const IK_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT ?? '';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/**
 * Valida tipo e tamanho do arquivo antes do upload.
 * Retorna null se válido, ou uma mensagem de erro se inválido.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Formato de imagem inválido. Use PNG, JPEG ou WebP.';
  }
  if (file.size > MAX_SIZE_BYTES) {
    return `Arquivo muito grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máximo permitido: 5 MB.`;
  }
  return null;
}

/**
 * Faz upload de uma imagem para o ImageKit.
 *
 * 1. Valida tipo/tamanho localmente
 * 2. Obtém parâmetros de assinatura do backend (GET /imagekit/auth)
 * 3. Envia o arquivo diretamente para o ImageKit via XMLHttpRequest (para progresso)
 *
 * @param file - Arquivo selecionado pelo usuário
 * @param token - JWT do professor para autenticar no endpoint de auth
 * @param onProgress - Callback opcional (0–100) para indicador de progresso
 * @returns URL da imagem no CDN ou throw com mensagem de erro
 */
export async function uploadToImageKit(
  file: File,
  token: string,
  onProgress?: (percent: number) => void,
): Promise<string> {
  // 1. Validação client-side
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  // 2. Obter parâmetros de assinatura
  const authRes = await fetch(`${API_URL}/imagekit/auth`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!authRes.ok) {
    if (authRes.status === 503) {
      throw new Error('Serviço de imagens não configurado no servidor.');
    }
    throw new Error('Falha ao obter credenciais de upload.');
  }

  const auth = (await authRes.json()) as {
    token: string;
    expire: number;
    signature: string;
  };

  // 3. Upload via XMLHttpRequest (para capturar progresso)
  const fd = new FormData();
  fd.append('file', file);
  fd.append('fileName', file.name);
  fd.append('publicKey', IK_PUBLIC_KEY);
  fd.append('signature', auth.signature);
  fd.append('expire', String(auth.expire));
  fd.append('token', auth.token);

  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText) as { url: string };
          resolve(result.url);
        } catch {
          reject(new Error('Resposta inválida do serviço de imagens.'));
        }
      } else {
        reject(new Error('Falha ao enviar imagem. Tente novamente.'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Erro de rede ao enviar imagem. Verifique sua conexão.'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelado.'));
    });

    xhr.open('POST', `${IK_ENDPOINT}/api/v1/files/upload`);
    xhr.send(fd);
  });
}
