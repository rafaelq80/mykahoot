import { useEffect, useState, useCallback } from 'react';
import { cn } from '../lib/utils';
import { AdminScreenLayout } from '../features/admin-control/components/AdminScreenLayout';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const IK_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY ?? '';
const IK_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT ?? '';

interface Theme { id: string; name: string; description?: string }
interface Quiz { id: string; title: string; themeId: string; theme: { name: string }; _count: { questions: number } }
interface Question { id: string; text: string; imageUrl: string | null; options: string[]; correctIndex: number; timeLimitSec: number; order: number }

async function uploadToImageKit(file: File, token: string): Promise<string | null> {
  try {
    const authRes = await fetch(`${API_URL}/imagekit/auth`, { headers: { Authorization: `Bearer ${token}` } });
    if (!authRes.ok) return null;
    const auth = (await authRes.json()) as { token: string; expire: number; signature: string };
    const fd = new FormData();
    fd.append('file', file); fd.append('fileName', file.name);
    fd.append('publicKey', IK_PUBLIC_KEY); fd.append('signature', auth.signature);
    fd.append('expire', String(auth.expire)); fd.append('token', auth.token);
    const r = await fetch(`${IK_ENDPOINT}/api/v1/files/upload`, { method: 'POST', body: fd });
    if (!r.ok) return null;
    return ((await r.json()) as { url: string }).url;
  } catch { return null; }
}

export function AdminQuizzesPage({ token }: { token: string }) {
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [themes, setThemes] = useState<Theme[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [themeName, setThemeName] = useState('');
  const [themeDesc, setThemeDesc] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizThemeId, setQuizThemeId] = useState('');
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qTime, setQTime] = useState(20);
  const [qOrder, setQOrder] = useState(1);
  const [qImageFile, setQImageFile] = useState<File | null>(null);
  const [qImageUrl, setQImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const loadThemes = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/themes`, { headers: h });
      if (!r.ok) throw new Error(`GET /themes falhou com status ${r.status}`);
      const d = (await r.json()) as Theme[];
      setThemes(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
      setThemes([]);
    }
  }, []);
  const loadQuizzes = useCallback(async () => {
    try {
      const r = await fetch(`${API_URL}/quizzes`, { headers: h });
      if (!r.ok) throw new Error(`GET /quizzes falhou com status ${r.status}`);
      const d = (await r.json()) as Quiz[];
      setQuizzes(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
      setQuizzes([]);
    }
  }, []);
  const loadQuestions = useCallback(async (id: string) => {
    try {
      const r = await fetch(`${API_URL}/quizzes/${id}/questions`, { headers: h });
      if (!r.ok) throw new Error(`GET /quizzes/${id}/questions falhou com status ${r.status}`);
      const d = (await r.json()) as Question[];
      setQuestions(Array.isArray(d) ? [...d].sort((a, b) => a.order - b.order) : []);
    } catch (err) {
      console.error(err);
      setQuestions([]);
    }
  }, []);

  useEffect(() => { void loadThemes(); void loadQuizzes(); }, []);
  useEffect(() => { if (selectedQuizId) void loadQuestions(selectedQuizId); }, [selectedQuizId]);

  const createTheme = async () => {
    if (!themeName.trim()) return;
    await fetch(`${API_URL}/themes`, { method: 'POST', headers: h, body: JSON.stringify({ name: themeName, description: themeDesc || undefined }) });
    setThemeName(''); setThemeDesc(''); await loadThemes(); showFeedback('Tema criado!');
  };
  const deleteTheme = async (id: string) => {
    if (!confirm('Deletar tema?')) return;
    await fetch(`${API_URL}/themes/${id}`, { method: 'DELETE', headers: h }); await loadThemes(); showFeedback('Tema removido.');
  };
  const createQuiz = async () => {
    if (!quizTitle.trim() || !quizThemeId) return;
    await fetch(`${API_URL}/quizzes`, { method: 'POST', headers: h, body: JSON.stringify({ title: quizTitle, themeId: quizThemeId }) });
    setQuizTitle(''); setQuizThemeId(''); await loadQuizzes(); showFeedback('Quiz criado!');
  };
  const deleteQuiz = async (id: string) => {
    if (!confirm('Deletar quiz?')) return;
    await fetch(`${API_URL}/quizzes/${id}`, { method: 'DELETE', headers: h });
    if (selectedQuizId === id) setSelectedQuizId(null); await loadQuizzes(); showFeedback('Quiz removido.');
  };
  const createQuestion = async () => {
    if (!selectedQuizId || !qText.trim() || qOptions.some((o) => !o.trim())) return;
    let imageUrl: string | null = qImageUrl || null;
    if (qImageFile) { setUploading(true); imageUrl = await uploadToImageKit(qImageFile, token); setUploading(false); if (!imageUrl) { showFeedback('Erro no upload.'); return; } }
    await fetch(`${API_URL}/quizzes/${selectedQuizId}/questions`, { method: 'POST', headers: h, body: JSON.stringify({ text: qText, options: qOptions, correctIndex: qCorrect, timeLimitSec: qTime, order: qOrder, imageUrl }) });
    setQText(''); setQOptions(['', '', '', '']); setQCorrect(0); setQTime(20); setQOrder(questions.length + 2); setQImageFile(null); setQImageUrl('');
    await loadQuestions(selectedQuizId); showFeedback('Pergunta adicionada!');
  };
  const deleteQuestion = async (qid: string) => {
    if (!selectedQuizId || !confirm('Deletar pergunta?')) return;
    await fetch(`${API_URL}/quizzes/${selectedQuizId}/questions/${qid}`, { method: 'DELETE', headers: h });
    await loadQuestions(selectedQuizId); showFeedback('Pergunta removida.');
  };

  const inputCls = 'w-full rounded-lg border border-quiz-border bg-quiz-surface px-3 py-2 text-sm font-medium text-white placeholder:text-quiz-text-muted focus:border-quiz-highlight focus:outline-none';
  const btnCls = 'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';
  const deleteBtnCls = 'rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white active:scale-95 transition-all shrink-0';

  return (
    <AdminScreenLayout title="Quizzes" subtitle="Gerencie temas, quizzes e perguntas">
      {feedback && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 rounded-xl bg-brand px-5 py-2 font-bold text-white shadow-md text-sm">
          {feedback}
        </div>
      )}

      <div className="flex flex-1 flex-col px-5 py-6 sm:px-8">
        {/* Painel vidro sobre o gradiente do admin — mesmo padrão do resto do painel do professor */}
        <div className="card-glass-strong flex flex-col overflow-hidden divide-y divide-quiz-border lg:flex-row lg:divide-y-0 lg:divide-x">
        {/* Themes */}
        <section className="flex flex-col gap-3 p-5 lg:w-80">
          <h2 className="font-black text-base text-white">Temas</h2>
          <input className={inputCls} placeholder="Nome do tema *" value={themeName} onChange={(e) => setThemeName(e.target.value)} />
          <input className={inputCls} placeholder="Descrição (opcional)" value={themeDesc} onChange={(e) => setThemeDesc(e.target.value)} />
          <button type="button" className={btnCls} onClick={() => void createTheme()}>+ Criar tema</button>
          <ul className="flex flex-col gap-2 mt-2">
            {themes.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                <div><strong>{t.name}</strong>{t.description && <span className="ml-1 text-quiz-text-muted">— {t.description}</span>}</div>
                <button type="button" className={deleteBtnCls} onClick={() => void deleteTheme(t.id)}>✕</button>
              </li>
            ))}
          </ul>
        </section>

        {/* Quizzes */}
        <section className="flex flex-col gap-3 p-5 lg:w-80">
          <h2 className="font-black text-base text-white">Quizzes</h2>
          <input className={inputCls} placeholder="Título do quiz *" value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} />
          <select className={inputCls} value={quizThemeId} onChange={(e) => setQuizThemeId(e.target.value)}>
            <option value="">Selecione o tema *</option>
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <button type="button" className={btnCls} onClick={() => void createQuiz()}>+ Criar quiz</button>
          <ul className="flex flex-col gap-2 mt-2">
            {quizzes.map((q) => (
              <li key={q.id}
                className={cn('flex items-center justify-between rounded-lg border p-3 text-sm text-white cursor-pointer transition-colors', selectedQuizId === q.id ? 'border-brand bg-brand/20' : 'border-quiz-border hover:bg-quiz-surface')}
                onClick={() => setSelectedQuizId(q.id)}>
                <div><strong>{q.title}</strong><span className="ml-1 text-quiz-text-muted">— {q.theme?.name ?? 'Sem tema'} ({q._count?.questions ?? 0})</span></div>
                <button type="button" className={deleteBtnCls} onClick={(e) => { e.stopPropagation(); void deleteQuiz(q.id); }}>✕</button>
              </li>
            ))}
          </ul>
        </section>

        {/* Questions */}
        {selectedQuizId && (
          <section className="flex flex-col gap-3 p-5 flex-1">
            <h2 className="font-black text-base text-white">Perguntas</h2>
            <textarea className={cn(inputCls, 'resize-y')} placeholder="Texto da pergunta *" value={qText} onChange={(e) => setQText(e.target.value)} rows={3} />
            {qOptions.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={qCorrect === i} onChange={() => setQCorrect(i)} aria-label={`Alt ${i + 1} correta`} className="accent-brand" />
                <input className={inputCls} placeholder={`Alternativa ${i + 1} *`} value={opt} onChange={(e) => { const u = [...qOptions]; u[i] = e.target.value; setQOptions(u); }} />
              </div>
            ))}
            <div className="flex gap-3">
              <label className="flex flex-col gap-1 text-xs text-quiz-text-muted font-medium">
                Tempo (s)
                <input type="number" className={cn(inputCls, 'w-20')} value={qTime} min={5} max={120} onChange={(e) => setQTime(Number(e.target.value))} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-quiz-text-muted font-medium">
                Ordem
                <input type="number" className={cn(inputCls, 'w-20')} value={qOrder} min={1} onChange={(e) => setQOrder(Number(e.target.value))} />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-xs text-quiz-text-muted font-medium">
              Imagem (upload)
              <input type="file" accept="image/*" className="text-sm text-white" onChange={(e) => setQImageFile(e.target.files?.[0] ?? null)} />
            </label>
            <input className={inputCls} placeholder="Ou URL da imagem: https://..." value={qImageUrl} onChange={(e) => setQImageUrl(e.target.value)} />
            <button type="button" className={btnCls} disabled={uploading || !qText.trim() || qOptions.some((o) => !o.trim())} onClick={() => void createQuestion()}>
              {uploading ? 'Enviando...' : '+ Adicionar pergunta'}
            </button>
            <ul className="flex flex-col gap-2 mt-2">
              {questions.map((q, idx) => (
                <li key={q.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                  <div><span className="text-quiz-text-muted">{idx + 1}. </span><strong>{q.text}</strong><span className="ml-1 text-quiz-text-muted">({q.timeLimitSec}s)</span></div>
                  <button type="button" className={deleteBtnCls} onClick={() => void deleteQuestion(q.id)}>✕</button>
                </li>
              ))}
            </ul>
          </section>
        )}
        </div>
      </div>
    </AdminScreenLayout>
  );
}