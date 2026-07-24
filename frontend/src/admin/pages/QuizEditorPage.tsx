import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../../lib/utils';
import { uploadToImageKit, validateImageFile } from '../../services/imagekit';
import { apiFetch, ApiError } from '../../services/api';
import { questionSchema } from '../../schemas/question.schema';
import type { QuestionFormData } from '../../schemas/question.schema';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import type { Theme, QuizDetail, Question } from '../../types/quiz';

interface Props {
  quizId: string;
  token: string;
  onClose: () => void;
  /** Chamado depois de salvar propriedades do quiz, pra lista de fora atualizar (título/imagem no card). */
  onSaved: () => void;
}

export function EditQuizPage({ quizId, token, onClose, onSaved }: Props) {

  const [themes, setThemes] = useState<Theme[]>([]);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [quizImageFile, setQuizImageFile] = useState<File | null>(null);
  const newQForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: { text: '', options: ['', '', '', ''], correctIndex: 0, timeLimitSec: 20, order: 1, imageUrl: '' },
  });

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [themesData, quizData, questionsData] = await Promise.all([
        apiFetch<Theme[]>('/themes', { token }),
        apiFetch<QuizDetail>(`/quizzes/${quizId}`, { token }),
        apiFetch<Question[]>(`/quizzes/${quizId}/questions`, { token }),
      ]);
      setThemes(themesData);
      setQuiz({ id: quizData.id, title: quizData.title, themeId: quizData.themeId, imageUrl: quizData.imageUrl ?? null });
      const sorted = Array.isArray(questionsData) ? [...questionsData].sort((a, b) => a.order - b.order) : [];
      setQuestions(sorted);
      newQForm.setValue('order', sorted.length + 1);
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
        const valError = validateImageFile(quizImageFile);
        if (valError) {
          showFeedback(valError);
          setSavingQuiz(false);
          return;
        }
        setUploadProgress(0);
        try {
          imageUrl = await uploadToImageKit(quizImageFile, token, setUploadProgress);
        } catch (uploadErr) {
          showFeedback(uploadErr instanceof Error ? uploadErr.message : 'Erro no upload da imagem.');
          setSavingQuiz(false);
          setUploadProgress(null);
          return;
        }
        setUploadProgress(null);
      }
      const body: Record<string, unknown> = { title: quiz.title, themeId: quiz.themeId };
      if (imageUrl) body.imageUrl = imageUrl;
      await apiFetch(`/quizzes/${quizId}`, { method: 'PATCH', token, body });
      setQuiz((prev) => (prev ? { ...prev, imageUrl } : prev));
      setQuizImageFile(null);
      showFeedback('Quiz atualizado!');
      onSaved();
    } catch (err) {
      showFeedback(err instanceof ApiError ? err.message : 'Erro ao salvar.');
    } finally {
      setSavingQuiz(false);
      setUploadProgress(null);
    }
  };

  const updateQuestionField = <K extends keyof Question>(id: string, field: K, value: Question[K]) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const saveQuestion = async (q: Question) => {
    const parsed = questionSchema.safeParse({
      text: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      timeLimitSec: q.timeLimitSec,
      order: q.order,
      imageUrl: q.imageUrl || '',
    });
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join('; ');
      showFeedback(msg);
      return;
    }
    try {
      await apiFetch(`/quizzes/${quizId}/questions/${q.id}`, {
        method: 'PATCH',
        token,
        body: {
          text: q.text,
          options: q.options,
          correctIndex: q.correctIndex,
          timeLimitSec: q.timeLimitSec,
          order: q.order,
          imageUrl: q.imageUrl || undefined,
        },
      });
      showFeedback('Pergunta salva!');
    } catch (err) {
      showFeedback(err instanceof ApiError ? err.message : 'Erro ao salvar pergunta.');
    }
  };

  const deleteQuestion = async (id: string) => {
    if (!confirm('Excluir esta pergunta?')) return;
    try {
      await apiFetch(`/quizzes/${quizId}/questions/${id}`, { method: 'DELETE', token });
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      showFeedback('Pergunta removida.');
    } catch (err) {
      showFeedback(err instanceof ApiError ? err.message : 'Erro ao remover pergunta.');
    }
  };

  const addQuestion = async (data: QuestionFormData) => {
    try {
      const created = await apiFetch<Question>(`/quizzes/${quizId}/questions`, {
        method: 'POST',
        token,
        body: { text: data.text, options: data.options, correctIndex: data.correctIndex, timeLimitSec: data.timeLimitSec, order: data.order },
      });
      setQuestions((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      newQForm.reset({ text: '', options: ['', '', '', ''], correctIndex: 0, timeLimitSec: 20, order: questions.length + 2, imageUrl: '' });
      showFeedback('Pergunta adicionada!');
    } catch (err) {
      showFeedback(err instanceof ApiError ? err.message : 'Erro ao adicionar pergunta.');
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
                    accept="image/jpeg,image/png,image/webp"
                    className="text-sm text-white"
                    onChange={(e) => setQuizImageFile(e.target.files?.[0] ?? null)}
                  />
                </label>
              </div>
              {uploadProgress !== null && (
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-brand rounded-full transition-[width] duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-quiz-text-muted">{uploadProgress}%</span>
                </div>
              )}
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
                  {...newQForm.register('text')}
                />
                {newQForm.formState.errors.text && <p className="text-sm font-bold text-option-a">{newQForm.formState.errors.text.message}</p>}
                {([0, 1, 2, 3] as const).map((i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="new-correct"
                      checked={newQForm.watch('correctIndex') === i}
                      onChange={() => newQForm.setValue('correctIndex', i)}
                      className="accent-brand"
                      aria-label={`Alt ${i + 1} correta`}
                    />
                    <input
                      className={inputCls}
                      placeholder={`Alternativa ${i + 1} *`}
                      {...newQForm.register(`options.${i}`)}
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
                      {...newQForm.register('timeLimitSec', { valueAsNumber: true })}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
                    Ordem
                    <input
                      type="number"
                      className={cn(inputCls, 'w-20')}
                      min={1}
                      {...newQForm.register('order', { valueAsNumber: true })}
                    />
                  </label>
                </div>
                {newQForm.formState.errors.timeLimitSec && <p className="text-sm font-bold text-option-a">{newQForm.formState.errors.timeLimitSec.message}</p>}
                <button
                  type="button"
                  className={cn(btnCls, 'self-start')}
                  onClick={() => void newQForm.handleSubmit(addQuestion)()}
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