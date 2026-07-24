import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../../lib/utils';
import { uploadToImageKit, validateImageFile } from '../../services/imagekit';
import { apiFetch, ApiError } from '../../services/api';
import { quizSchema } from '../../schemas/quiz.schema';
import { questionSchema } from '../../schemas/question.schema';
import type { QuizFormData } from '../../schemas/quiz.schema';
import type { QuestionFormData } from '../../schemas/question.schema';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { QuestionEditor } from '../components/QuestionEditor';
import { ImageDropzone } from '../../shared/components/ImageDropzone';
import { useThemes } from '../hooks/useThemes';
import type { QuizDetail, Question } from '../../types/quiz';

const inputCls =
  'w-full rounded-lg border border-quiz-border bg-quiz-surface px-3 py-2 text-sm font-medium text-white placeholder:text-quiz-text-muted focus:border-quiz-highlight focus:outline-none';
const btnCls =
  'rounded-lg bg-brand px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed';

interface Props {
  token: string;
  quizId?: string;
  onClose: () => void;
  onCreated?: (quizId: string) => void;
  onSaved?: () => void;
}

export function QuizFormPage({ token, quizId, onClose, onCreated, onSaved }: Props) {
  const { themes } = useThemes(token);
  const [quiz, setQuiz] = useState<QuizDetail | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(!!quizId);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [quizImageFile, setQuizImageFile] = useState<File | null>(null);
  const [quizImagePreview, setQuizImagePreview] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [newQImageUrl, setNewQImageUrl] = useState<string | null>(null);
  const [newQUploading, setNewQUploading] = useState(false);
  const [newQUploadProgress, setNewQUploadProgress] = useState<number | null>(null);

  const quizForm = useForm<QuizFormData>({ resolver: zodResolver(quizSchema) });
  const newQForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: { text: '', options: ['', '', '', ''], correctIndex: 0, timeLimitSec: 20, order: 1, imageUrl: '' },
  });

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 2500); };

  // Load quiz + questions when editing
  const load = useCallback(async () => {
    if (!quizId) return;
    setLoading(true);
    try {
      const [quizData, questionsData] = await Promise.all([
        apiFetch<QuizDetail>(`/quizzes/${quizId}`, { token }),
        apiFetch<Question[]>(`/quizzes/${quizId}/questions`, { token }),
      ]);
      setQuiz({ id: quizData.id, title: quizData.title, themeId: quizData.themeId, imageUrl: quizData.imageUrl ?? null });
      quizForm.reset({ title: quizData.title, themeId: quizData.themeId });
      const sorted = Array.isArray(questionsData) ? [...questionsData].sort((a, b) => a.order - b.order) : [];
      setQuestions(sorted);
      newQForm.setValue('order', sorted.length + 1);
    } catch (err) {
      console.error(err);
      showFeedback('Erro ao carregar quiz.');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizId, token]);

  useEffect(() => { void load(); }, [load]);

  // --- Quiz CRUD ---
  const handleSaveQuiz = async (data: QuizFormData) => {
    setSavingQuiz(true);
    try {
      let imageUrl = quiz?.imageUrl ?? null;
      if (quizImageFile) {
        const valError = validateImageFile(quizImageFile);
        if (valError) { showFeedback(valError); setSavingQuiz(false); return; }
        setUploadProgress(0);
        try {
          imageUrl = await uploadToImageKit(quizImageFile, token, setUploadProgress, '/myquiz/quiz');
        } catch (uploadErr) {
          showFeedback(uploadErr instanceof Error ? uploadErr.message : 'Erro no upload.');
          setSavingQuiz(false); setUploadProgress(null); return;
        }
        setUploadProgress(null);
      }

      if (quizId) {
        const body: Record<string, unknown> = { title: data.title, themeId: data.themeId };
        if (imageUrl) body.imageUrl = imageUrl;
        await apiFetch(`/quizzes/${quizId}`, { method: 'PATCH', token, body });
        setQuiz((prev) => prev ? { ...prev, title: data.title, themeId: data.themeId, imageUrl } : prev);
        if (quizImagePreview) URL.revokeObjectURL(quizImagePreview);
        setQuizImageFile(null);
        setQuizImagePreview(null);
        showFeedback('Quiz atualizado!');
        onSaved?.();
      } else {
        const body: Record<string, unknown> = { title: data.title, themeId: data.themeId };
        if (imageUrl) body.imageUrl = imageUrl;
        const created = await apiFetch<{ id: string }>('/quizzes', { method: 'POST', token, body });
        if (quizImagePreview) URL.revokeObjectURL(quizImagePreview);
        setQuizImageFile(null);
        setQuizImagePreview(null);
        showFeedback('Quiz criado!');
        onCreated?.(created.id);
      }
    } catch (err) {
      showFeedback(err instanceof ApiError ? err.message : 'Erro ao salvar quiz.');
    } finally {
      setSavingQuiz(false); setUploadProgress(null);
    }
  };

  // --- Question CRUD ---
  const updateQuestionField = <K extends keyof Question>(id: string, field: K, value: Question[K]) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, [field]: value } : q)));
  };

  const saveQuestion = async (q: Question) => {
    const parsed = questionSchema.safeParse({
      text: q.text, options: q.options, correctIndex: q.correctIndex,
      timeLimitSec: q.timeLimitSec, order: q.order, imageUrl: q.imageUrl || '',
    });
    if (!parsed.success) { showFeedback(parsed.error.issues.map((i) => i.message).join('; ')); return; }
    try {
      await apiFetch(`/quizzes/${quizId}/questions/${q.id}`, {
        method: 'PATCH', token,
        body: { text: q.text, options: q.options, correctIndex: q.correctIndex, timeLimitSec: q.timeLimitSec, order: q.order, imageUrl: q.imageUrl || undefined },
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
      if (selectedQuestionId === id) setSelectedQuestionId(null);
      showFeedback('Pergunta removida.');
    } catch (err) {
      showFeedback(err instanceof ApiError ? err.message : 'Erro ao remover pergunta.');
    }
  };

  const addQuestion = async (data: QuestionFormData) => {
    if (!quizId) return;
    try {
      const created = await apiFetch<Question>(`/quizzes/${quizId}/questions`, {
        method: 'POST', token,
        body: { text: data.text, options: data.options, correctIndex: data.correctIndex, timeLimitSec: data.timeLimitSec, order: data.order, imageUrl: newQImageUrl || undefined },
      });
      setQuestions((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      newQForm.reset({ text: '', options: ['', '', '', ''], correctIndex: 0, timeLimitSec: 20, order: questions.length + 2, imageUrl: '' });
      setNewQImageUrl(null);
      setCreatingNew(false);
      setSelectedQuestionId(created.id);
      showFeedback('Pergunta adicionada!');
    } catch (err) {
      showFeedback(err instanceof ApiError ? err.message : 'Erro ao adicionar pergunta.');
    }
  };

  const selectedQuestion = questions.find((q) => q.id === selectedQuestionId) ?? null;

  return (
    <AdminScreenLayout
      title={quizId ? 'Editar Quiz' : 'Novo Quiz'}
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
    >
      <div className="flex flex-1 flex-col gap-5 px-5 py-6 sm:px-8">
        {feedback && (
          <div className="rounded-lg bg-brand px-4 py-2 text-center text-sm font-bold text-white">{feedback}</div>
        )}

        {loading ? (
          <p className="animate-pulse py-10 text-center font-bold text-quiz-text-muted">Carregando...</p>
        ) : (
          <>
            {/* Propriedades do quiz */}
            <section className="card-glass-strong flex flex-col gap-4 p-5">
              <h3 className="font-black text-sm uppercase tracking-widest text-quiz-text-muted">Propriedades</h3>
              <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                {/* Coluna esquerda: imagem */}
                <div className="w-full sm:w-48 shrink-0">
                  <ImageDropzone
                    value={quizImagePreview ?? quiz?.imageUrl ?? null}
                    onFileSelected={(file) => {
                      setQuizImageFile(file);
                      setQuizImagePreview(URL.createObjectURL(file));
                    }}
                    uploading={savingQuiz && !!quizImageFile}
                    uploadProgress={uploadProgress}
                    onRemove={() => {
                      if (quizImagePreview) URL.revokeObjectURL(quizImagePreview);
                      setQuizImageFile(null);
                      setQuizImagePreview(null);
                      if (quiz) setQuiz({ ...quiz, imageUrl: null });
                    }}
                  />
                </div>
                {/* Coluna direita: título + categoria */}
                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold uppercase text-label-xs text-quiz-text-muted">Título</label>
                    <input className={inputCls} placeholder="Título do quiz *" {...quizForm.register('title')} />
                    {quizForm.formState.errors.title && <p className="text-sm font-bold text-option-a">{quizForm.formState.errors.title.message}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="font-semibold uppercase text-label-xs text-quiz-text-muted">Categoria</label>
                    <select className={inputCls} {...quizForm.register('themeId')}>
                      <option value="">Selecione a categoria *</option>
                      {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                    {quizForm.formState.errors.themeId && <p className="text-sm font-bold text-option-a">{quizForm.formState.errors.themeId.message}</p>}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={cn(btnCls, 'w-full')}
                disabled={savingQuiz}
                onClick={() => void quizForm.handleSubmit(handleSaveQuiz)()}
              >
                {savingQuiz ? 'Salvando...' : quizId ? 'Salvar alterações' : 'Criar quiz'}
              </button>
            </section>

            {/* Perguntas — só aparece após quiz existir */}
            {quizId && (
              <div className="flex flex-1 gap-5 min-h-0">
                {/* Sidebar de perguntas */}
                <aside className="card-glass-strong flex w-56 shrink-0 flex-col gap-2 p-4 overflow-auto">
                  <h3 className="font-black text-sm uppercase tracking-widest text-quiz-text-muted">Perguntas</h3>
                  {questions.map((q, idx) => (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => { setSelectedQuestionId(q.id); setCreatingNew(false); }}
                      className={cn(
                        'flex w-full items-start gap-2 rounded-lg border px-3 py-2 text-left min-h-12 overflow-hidden transition-colors active:scale-95',
                        selectedQuestionId === q.id && !creatingNew
                          ? 'border-brand bg-brand/20'
                          : 'border-quiz-border hover:bg-quiz-surface',
                      )}
                    >
                      <span className="shrink-0 text-label-xs font-bold text-quiz-text-muted">{idx + 1}</span>
                      <span className="line-clamp-2 text-body-sm font-medium text-white">{q.text || '(sem texto)'}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => { setCreatingNew(true); setSelectedQuestionId(null); }}
                    className={cn(btnCls, 'mt-2 w-full text-center')}
                  >
                    + Nova pergunta
                  </button>
                </aside>

                {/* Painel principal */}
                <div className="flex flex-1 flex-col overflow-auto">
                  {creatingNew && (
                    <div className="card-glass flex flex-col gap-2 rounded-xl border border-dashed border-quiz-border p-4">
                      <h4 className="font-bold text-sm text-white">Nova pergunta</h4>
                      <textarea className={inputCls} placeholder="Texto da pergunta *" rows={2} {...newQForm.register('text')} />
                      {newQForm.formState.errors.text && <p className="text-sm font-bold text-option-a">{newQForm.formState.errors.text.message}</p>}
                      <ImageDropzone
                        value={newQImageUrl}
                        onFileSelected={(file) => {
                          setNewQUploading(true);
                          setNewQUploadProgress(0);
                          void uploadToImageKit(file, token, setNewQUploadProgress, '/myquiz/question')
                            .then((url) => { setNewQImageUrl(url); })
                            .catch((err) => { console.error(err); })
                            .finally(() => { setNewQUploading(false); setNewQUploadProgress(null); });
                        }}
                        uploading={newQUploading}
                        uploadProgress={newQUploadProgress}
                        onRemove={() => setNewQImageUrl(null)}
                      />
                      {([0, 1, 2, 3] as const).map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="radio" name="new-correct" checked={newQForm.watch('correctIndex') === i} onChange={() => newQForm.setValue('correctIndex', i)} className="accent-brand" aria-label={`Alt ${i + 1} correta`} />
                          <input className={inputCls} placeholder={`Alternativa ${i + 1} *`} {...newQForm.register(`options.${i}`)} />
                        </div>
                      ))}
                      <div className="flex gap-3">
                        <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
                          Tempo (s)
                          <input type="number" className={cn(inputCls, 'w-20')} min={5} max={120} {...newQForm.register('timeLimitSec', { valueAsNumber: true })} />
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-quiz-text-muted">
                          Ordem
                          <input type="number" className={cn(inputCls, 'w-20')} min={1} {...newQForm.register('order', { valueAsNumber: true })} />
                        </label>
                      </div>
                      {newQForm.formState.errors.timeLimitSec && <p className="text-sm font-bold text-option-a">{newQForm.formState.errors.timeLimitSec.message}</p>}
                      <button type="button" className={cn(btnCls, 'self-start')} disabled={newQUploading} onClick={() => void newQForm.handleSubmit(addQuestion)()}>
                        + Adicionar pergunta
                      </button>
                    </div>
                  )}

                  {!creatingNew && selectedQuestion && (
                    <QuestionEditor
                      index={questions.indexOf(selectedQuestion)}
                      question={selectedQuestion}
                      inputCls={inputCls}
                      token={token}
                      onChange={(field, value) => updateQuestionField(selectedQuestion.id, field, value)}
                      onSave={() => void saveQuestion(selectedQuestion)}
                      onDelete={() => void deleteQuestion(selectedQuestion.id)}
                    />
                  )}

                  {!creatingNew && !selectedQuestion && questions.length > 0 && (
                    <p className="py-10 text-center text-sm text-quiz-text-muted">Selecione uma pergunta na sidebar ou crie uma nova.</p>
                  )}

                  {!creatingNew && !selectedQuestion && questions.length === 0 && (
                    <p className="py-10 text-center text-sm text-quiz-text-muted">Nenhuma pergunta. Clique em &quot;+ Nova pergunta&quot; para começar.</p>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AdminScreenLayout>
  );
}
