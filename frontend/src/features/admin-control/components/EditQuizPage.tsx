import { useEffect, useState, useCallback } from 'react';
import { cn } from '../../../lib/utils';
import { AdminScreenLayout } from './AdminScreenLayout';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const IK_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY ?? '';
const IK_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT ?? '';

interface Theme {
  id: string;
  name: string;
}
interface QuizDetail {
  id: string;
  title: string;
  themeId: string;
  imageUrl: string | null;
}
interface Question {
  id: string;
  text: string;
  imageUrl: string | null;
  options: string[];
  correctIndex: number;
  timeLimitSec: number;
  order: number;
}

interface Props {
  quizId: string;
  token: string;
  onClose: () => void;
  /** Chamado depois de salvar propriedades do quiz, pra lista de fora atualizar (título/imagem no card). */
  onSaved: () => void;
}

async function uploadToImageKit(file: File, token: string): Promise<string | null> {
  try {
    const authRes = await fetch(`${API_URL}/imagekit/auth`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!authRes.ok) return null;
    const auth = (await authRes.json()) as { token: string; expire: number; signature: string };
    const fd = new FormData();
    fd.append('file', file);
    fd.append('fileName', file.name);
    fd.append('publicKey', IK_PUBLIC_KEY);
    fd.append('signature', auth.signature);
    fd.append('expire', String(auth.expire));
    fd.append('token', auth.token);
    const r = await fetch(`${IK_ENDPOINT}/api/v1/files/upload`, { method: 'POST', body: fd });
    if (!r.ok) return null;
    return ((await r.json()) as { url: string }).url;
  } catch {
    return null;
  }
}

export function EditQuizPage({ quizId, token, onClose, onSaved }: Props) {
  const h = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const [themes, setThemes] = useState<Theme[]>([]);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizImageFile, setQuizImageFile] = useState<File | null>(null);
  const [newQ, setNewQ] = useState({
    text: '',
    options: ['', '', '', ''],
    correctIndex: 0,
    timeLimitSec: 20,
    order: 1,
  });

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [themesRes, quizRes, questionsRes] = await Promise.all([
        fetch(`${API_URL}/themes`, { headers: h }),
        fetch(`${API_URL}/quizzes/${quizId}`, { headers: h }),
        fetch(`${API_URL}/quizzes/${quizId}/questions`, { headers: h }),
      ]);
      setThemes(themesRes.ok ? ((await themesRes.json()) as Theme[]) : []);
      if (quizRes.ok) {
        const q = (await quizRes.json()) as QuizDetail;
        setQuiz({ id: q.id, title: q.title, themeId: q.themeId, imageUrl: q.imageUrl ?? null });
      }
      const qs = questionsRes.ok ? ((await questionsRes.json()) as Question[]) : [];
      const sorted = Array.isArray(qs) ? [...qs].sort((a, b) => a.order - b.order) : [];
      setQuestions(sorted);
      setNewQ((n) => ({ ...n, order: sorted.length + 1 }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const saveQuiz = async () => {
    if (!quiz || !quiz.title.trim()) return;
    setSavingQuiz(true);
    try {
      let imageUrl = quiz.imageUrl;
      if (quizImageFile) {
        const uploaded = await uploadToImageKit(quizImageFile, token);
        if (!uploaded) {
          showFeedback('Erro no upload da imagem.');
          setSavingQuiz(false);
          return;
        }
        imageUrl = uploaded;
      }
      const body: Record<string, unknown> = { title: quiz.title, themeId: quiz.themeId };
      if (imageUrl) body.imageUrl = imageUrl;
      await fetch(`${API_URL}/quizzes/${quizId}`, { method: 'PATCH', headers: h, body: JSON.stringify(body) });
      setQuiz((prev) => (prev ? { ...prev, imageUrl } : prev));
      setQuizImageFile(null);
      showFeedback('Quiz atualizado!');
      onSaved();
    } catch (err) {
      console.error(err);
      showFeedback('Erro ao salvar.');
    } finally {
      setSavingQuiz(false);
    }
  };

  const updateQuestionField = <K extends keyof Question>(id: string, field: K, value: Question[K]) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const saveQuestion = async (q: Question) => {
    await fetch(`${API_URL}/quizzes/${quizId}/questions/${q.id}`, {
      method: 'PATCH',
      headers: h,
      body: JSON.stringify({
        text: q.text,
        options: q.options,
        correctIndex: q.correctIndex,
        timeLimitSec: q.timeLimitSec,
        order: q.order,
        imageUrl: q.imageUrl || undefined,
      }),
    });
    showFeedback('Pergunta salva!');
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Excluir esta pergunta?')) return;
    await fetch(`${API_URL}/quizzes/${quizId}/questions/${id}`, { method: 'DELETE', headers: h });
    setQuestions((prev) => prev.filter((q) => q.id !== id));
    showFeedback('Pergunta removida.');
  };

  const addQuestion = async () => {
    if (!newQ.text.trim() || newQ.options.some((o) => !o.trim())) return;
    const res = await fetch(`${API_URL}/quizzes/${quizId}/questions`, {
      method: 'POST',
      headers: h,
      body: JSON.stringify(newQ),
    });
    if (res.ok) {
      const created = (await res.json()) as Question;
      setQuestions((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      setNewQ({ text: '', options: ['', '', '', ''], correctIndex: 0, timeLimitSec: 20, order: questions.length + 2 });
      showFeedback('Pergunta adicionada!');
    }
  };

  const inputCls =
    'w-full rounded-lg border border-quiz-border bg-quiz-surface px-3 py-2 text-sm font-medium text-white placeholder:text-quiz-text-muted focus:border-quiz-highlight focus:outline-none';
  const btnCls =
    'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';

  return (
    <AdminScreenLayout
      title="Editar Quiz"
      subtitle={quiz?.title}
      headerRight={
        <button
          type="button"
          onClick={onClose}
          className="flex shrink-0 items-center gap-1.5 rounded-full bg-white/15 px-4 py-2 text-label-xs font-bold uppercase tracking-[0.14em] text-white transition-all hover:bg-white/25 active:scale-95 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2"
        >
          ‹ Voltar
        </button>
      }
      footer={
        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl bg-brand py-4 text-base font-black tracking-wide text-white shadow-lg transition-all hover:bg-brand/90 active:scale-95 motion-reduce:transition-none sm:max-w-md sm:ml-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
        >
          ‹ VOLTAR PARA A LISTA
        </button>
      }
    >
      <div className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-8">
        {feedback && (
          <div className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-bold text-white">{feedback}</div>
        )}

        {loading || !quiz ? (
          <p className="animate-pulse py-10 text-center font-bold text-quiz-text-muted">Carregando...</p>
        ) : (
          <>
            {/* Propriedades do quiz */}
            <section className="card-glass-strong flex flex-col gap-3 p-5">
              <h3 className="font-black text-sm uppercase tracking-widest text-quiz-text-muted">Propriedades</h3>
              <input
                className={inputCls}
                value={quiz.title}
                onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                placeholder="Título do quiz *"
              />
              <select
                className={inputCls}
                value={quiz.themeId}
                onChange={(e) => setQuiz({ ...quiz, themeId: e.target.value })}
              >
                {themes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                {quiz.imageUrl && (
                  <img
                    src={quiz.imageUrl}
                    alt=""
                    className="h-14 w-24 shrink-0 rounded-lg border border-quiz-border object-cover"
                  />
                )}
                <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-quiz-text-muted">
                  Imagem do quiz
                  <input
                    type="file"
                    accept="image/*"
                    className="text-sm text-white"
                    onChange={(e) => setQuizImageFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              <button
                type="button"
                className={cn(btnCls, 'self-start')}
                disabled={savingQuiz || !quiz.title.trim()}
                onClick={() => void saveQuiz()}
              >
                {savingQuiz ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </section>

            {/* Perguntas */}
            <section className="flex flex-col gap-4">
              <h3 className="font-black text-sm uppercase tracking-widest text-quiz-text-muted">
                Perguntas ({questions.length})
              </h3>
              {questions.map((q, idx) => (
                <QuestionEditor
                  key={q.id}
                  index={idx}
                  question={q}
                  inputCls={inputCls}
                  onChange={(field, value) => updateQuestionField(q.id, field, value)}
                  onSave={() => void saveQuestion(q)}
                  onDelete={() => void deleteQuestion(q.id)}
                />
              ))}

              <div className="card-glass flex flex-col gap-2 rounded-xl border border-dashed border-quiz-border p-4">
                <h4 className="font-bold text-sm text-white">+ Nova pergunta</h4>
                <textarea
                  className={inputCls}
                  placeholder="Texto da pergunta *"
                  rows={2}
                  value={newQ.text}
                  onChange={(e) => setNewQ({ ...newQ, text: e.target.value })}
                />
                {newQ.options.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="new-correct"
                      checked={newQ.correctIndex === i}
                      onChange={() => setNewQ({ ...newQ, correctIndex: i })}
                      className="accent-brand"
                      aria-label={`Alt ${i + 1} correta`}
                    />
                    <input
                      className={inputCls}
                      placeholder={`Alternativa ${i + 1} *`}
                      value={opt}
                      onChange={(e) => {
                        const options = [...newQ.options];
                        options[i] = e.target.value;
                        setNewQ({ ...newQ, options });
                      }}
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
                    Tempo (s)
                    <input
                      type="number"
                      className={cn(inputCls, 'w-20')}
                      min={5}
                      max={120}
                      value={newQ.timeLimitSec}
                      onChange={(e) => setNewQ({ ...newQ, timeLimitSec: Number(e.target.value) })}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
                    Ordem
                    <input
                      type="number"
                      className={cn(inputCls, 'w-20')}
                      min={1}
                      value={newQ.order}
                      onChange={(e) => setNewQ({ ...newQ, order: Number(e.target.value) })}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  className={cn(btnCls, 'self-start')}
                  disabled={!newQ.text.trim() || newQ.options.some((o) => !o.trim())}
                  onClick={() => void addQuestion()}
                >
                  + Adicionar pergunta
                </button>
              </div>
            </section>
          </>
        )}
      </div>
    </AdminScreenLayout>
  );
}

function QuestionEditor({
  index,
  question,
  inputCls,
  onChange,
  onSave,
  onDelete,
}: {
  index: number;
  question: Question;
  inputCls: string;
  onChange: <K extends keyof Question>(field: K, value: Question[K]) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="card-glass flex flex-col gap-2 rounded-xl border border-quiz-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-widest text-quiz-text-muted">
          Pergunta {index + 1}
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg bg-option-a px-2 py-1 text-xs font-bold text-white transition-all active:scale-95"
        >
          ✕ Excluir
        </button>
      </div>
      <textarea className={inputCls} rows={2} value={question.text} onChange={(e) => onChange('text', e.target.value)} />
      {question.options.map((opt, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="radio"
            name={`correct-${question.id}`}
            checked={question.correctIndex === i}
            onChange={() => onChange('correctIndex', i)}
            className="accent-brand"
            aria-label={`Alt ${i + 1} correta`}
          />
          <input
            className={inputCls}
            value={opt}
            onChange={(e) => {
              const options = [...question.options];
              options[i] = e.target.value;
              onChange('options', options);
            }}
          />
        </div>
      ))}
      <div className="flex gap-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
          Tempo (s)
          <input
            type="number"
            className={cn(inputCls, 'w-20')}
            min={5}
            max={120}
            value={question.timeLimitSec}
            onChange={(e) => onChange('timeLimitSec', Number(e.target.value))}
          />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
          Ordem
          <input
            type="number"
            className={cn(inputCls, 'w-20')}
            min={1}
            value={question.order}
            onChange={(e) => onChange('order', Number(e.target.value))}
          />
        </label>
      </div>
      <button
        type="button"
        onClick={onSave}
        className="self-start rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white transition-all active:scale-95"
      >
        Salvar pergunta
      </button>
    </div>
  );
}