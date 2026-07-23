import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { cn } from '../../lib/utils';
import { uploadToImageKit, validateImageFile } from '../../services/imagekit';
import { AdminScreenLayout } from '../components/AdminScreenLayout';
import { useThemes } from '../hooks/useThemes';
import { useQuizzes } from '../hooks/useQuizzes';
import { useQuestions } from '../hooks/useQuestions';
import { themeSchema } from '../../schemas/theme.schema';
import { quizSchema } from '../../schemas/quiz.schema';
import { questionSchema } from '../../schemas/question.schema';
import type { ThemeFormData } from '../../schemas/theme.schema';
import type { QuizFormData } from '../../schemas/quiz.schema';
import type { QuestionFormData } from '../../schemas/question.schema';

export function AdminQuizzesPage({ token }: { token: string }) {
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [qImageFile, setQImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const { themes, deleteTheme, createTheme } = useThemes(token);
  const { quizzes, deleteQuiz, createQuiz } = useQuizzes(token);
  const { questions, deleteQuestion, createQuestion } = useQuestions(token, selectedQuizId);

  const themeForm = useForm<ThemeFormData>({ resolver: zodResolver(themeSchema) });
  const quizForm = useForm<QuizFormData>({ resolver: zodResolver(quizSchema) });
  const questionForm = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: { text: '', options: ['', '', '', ''], correctIndex: 0, timeLimitSec: 20, order: 1, imageUrl: '' },
  });

  const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(null), 3000); };

  const handleCreateTheme = async (data: ThemeFormData) => {
    const err = await createTheme(data);
    if (err) { showFeedback(err); return; }
    themeForm.reset(); showFeedback('Tema criado!');
  };
  const handleDeleteTheme = async (id: string) => {
    if (!confirm('Deletar tema?')) return;
    const err = await deleteTheme(id);
    if (err) { showFeedback(err); return; }
    showFeedback('Tema removido.');
  };
  const handleCreateQuiz = async (data: QuizFormData) => {
    const err = await createQuiz(data);
    if (err) { showFeedback(err); return; }
    quizForm.reset(); showFeedback('Quiz criado!');
  };
  const handleDeleteQuiz = async (id: string) => {
    if (!confirm('Deletar quiz?')) return;
    const err = await deleteQuiz(id);
    if (err) { showFeedback(err); return; }
    if (selectedQuizId === id) setSelectedQuizId(null);
    showFeedback('Quiz removido.');
  };
  const handleCreateQuestion = async (data: QuestionFormData) => {
    if (!selectedQuizId) return;
    let imageUrl: string | null = data.imageUrl || null;
    if (qImageFile) {
      const valError = validateImageFile(qImageFile);
      if (valError) { showFeedback(valError); return; }
      setUploading(true);
      setUploadProgress(0);
      try {
        imageUrl = await uploadToImageKit(qImageFile, token, setUploadProgress);
      } catch (err) {
        showFeedback(err instanceof Error ? err.message : 'Erro no upload.');
        setUploading(false);
        setUploadProgress(null);
        return;
      }
      setUploading(false);
      setUploadProgress(null);
    }
    const err = await createQuestion({ text: data.text, options: [...data.options], correctIndex: data.correctIndex, timeLimitSec: data.timeLimitSec, order: data.order, imageUrl });
    if (err) { showFeedback(err); return; }
    questionForm.reset({ text: '', options: ['', '', '', ''], correctIndex: 0, timeLimitSec: 20, order: questions.length + 2, imageUrl: '' });
    setQImageFile(null);
    showFeedback('Pergunta adicionada!');
  };
  const handleDeleteQuestion = async (qid: string) => {
    if (!confirm('Deletar pergunta?')) return;
    const err = await deleteQuestion(qid);
    if (err) { showFeedback(err); return; }
    showFeedback('Pergunta removida.');
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
        <div className="card-glass-strong flex flex-col overflow-hidden divide-y divide-quiz-border lg:flex-row lg:divide-y-0 lg:divide-x">
        {/* Themes */}
        <section className="flex flex-col gap-3 p-5 lg:w-80">
          <h2 className="font-black text-base text-white">Temas</h2>
          <input className={inputCls} placeholder="Nome do tema *" {...themeForm.register('name')} />
          {themeForm.formState.errors.name && <p className="text-sm font-bold text-option-a">{themeForm.formState.errors.name.message}</p>}
          <input className={inputCls} placeholder="Descrição (opcional)" {...themeForm.register('description')} />
          <button type="button" className={btnCls} onClick={() => void themeForm.handleSubmit(handleCreateTheme)()}>+ Criar tema</button>
          <ul className="flex flex-col gap-2 mt-2">
            {themes.map((t) => (
              <li key={t.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                <div><strong>{t.name}</strong>{t.description && <span className="ml-1 text-quiz-text-muted">— {t.description}</span>}</div>
                <button type="button" className={deleteBtnCls} onClick={() => void handleDeleteTheme(t.id)}>✕</button>
              </li>
            ))}
          </ul>
        </section>

        {/* Quizzes */}
        <section className="flex flex-col gap-3 p-5 lg:w-80">
          <h2 className="font-black text-base text-white">Quizzes</h2>
          <input className={inputCls} placeholder="Título do quiz *" {...quizForm.register('title')} />
          {quizForm.formState.errors.title && <p className="text-sm font-bold text-option-a">{quizForm.formState.errors.title.message}</p>}
          <select className={inputCls} {...quizForm.register('themeId')}>
            <option value="">Selecione o tema *</option>
            {themes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          {quizForm.formState.errors.themeId && <p className="text-sm font-bold text-option-a">{quizForm.formState.errors.themeId.message}</p>}
          <button type="button" className={btnCls} onClick={() => void quizForm.handleSubmit(handleCreateQuiz)()}>+ Criar quiz</button>
          <ul className="flex flex-col gap-2 mt-2">
            {quizzes.map((q) => (
              <li key={q.id}
                className={cn('flex items-center justify-between rounded-lg border p-3 text-sm text-white cursor-pointer transition-colors', selectedQuizId === q.id ? 'border-brand bg-brand/20' : 'border-quiz-border hover:bg-quiz-surface')}
                onClick={() => setSelectedQuizId(q.id)}>
                <div><strong>{q.title}</strong><span className="ml-1 text-quiz-text-muted">— {q.theme?.name ?? 'Sem tema'} ({q._count?.questions ?? 0})</span></div>
                <button type="button" className={deleteBtnCls} onClick={(e) => { e.stopPropagation(); void handleDeleteQuiz(q.id); }}>✕</button>
              </li>
            ))}
          </ul>
        </section>

        {/* Questions */}
        {selectedQuizId && (
          <section className="flex flex-col gap-3 p-5 flex-1">
            <h2 className="font-black text-base text-white">Perguntas</h2>
            <textarea className={cn(inputCls, 'resize-y')} placeholder="Texto da pergunta *" {...questionForm.register('text')} rows={3} />
            {questionForm.formState.errors.text && <p className="text-sm font-bold text-option-a">{questionForm.formState.errors.text.message}</p>}
            {([0, 1, 2, 3] as const).map((i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="radio" name="correct" checked={questionForm.watch('correctIndex') === i} onChange={() => questionForm.setValue('correctIndex', i)} aria-label={`Alt ${i + 1} correta`} className="accent-brand" />
                <input className={inputCls} placeholder={`Alternativa ${i + 1} *`} {...questionForm.register(`options.${i}`)} />
              </div>
            ))}
            {questionForm.formState.errors.options && <p className="text-sm font-bold text-option-a">{(questionForm.formState.errors.options as { message?: string })?.message ?? 'Preencha todas as alternativas'}</p>}
            <div className="flex gap-3">
              <label className="flex flex-col gap-1 text-xs text-quiz-text-muted font-medium">
                Tempo (s)
                <input type="number" className={cn(inputCls, 'w-20')} min={5} max={120} {...questionForm.register('timeLimitSec', { valueAsNumber: true })} />
              </label>
              <label className="flex flex-col gap-1 text-xs text-quiz-text-muted font-medium">
                Ordem
                <input type="number" className={cn(inputCls, 'w-20')} min={1} {...questionForm.register('order', { valueAsNumber: true })} />
              </label>
            </div>
            {questionForm.formState.errors.timeLimitSec && <p className="text-sm font-bold text-option-a">{questionForm.formState.errors.timeLimitSec.message}</p>}
            <label className="flex flex-col gap-1 text-xs text-quiz-text-muted font-medium">
              Imagem (upload)
              <input type="file" accept="image/jpeg,image/png,image/webp" className="text-sm text-white" onChange={(e) => setQImageFile(e.target.files?.[0] ?? null)} />
            </label>
            {uploadProgress !== null && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full bg-brand rounded-full transition-[width] duration-300" style={{ width: `${uploadProgress}%` }} />
                </div>
                <span className="text-xs font-mono text-quiz-text-muted">{uploadProgress}%</span>
              </div>
            )}
            <input className={inputCls} placeholder="Ou URL da imagem: https://..." {...questionForm.register('imageUrl')} />
            {questionForm.formState.errors.imageUrl && <p className="text-sm font-bold text-option-a">{questionForm.formState.errors.imageUrl.message}</p>}
            <button type="button" className={btnCls} disabled={uploading} onClick={() => void questionForm.handleSubmit(handleCreateQuestion)()}>
              {uploading ? 'Enviando...' : '+ Adicionar pergunta'}
            </button>
            <ul className="flex flex-col gap-2 mt-2">
              {questions.map((q, idx) => (
                <li key={q.id} className="flex items-center justify-between rounded-lg border border-quiz-border p-3 text-sm text-white">
                  <div><span className="text-quiz-text-muted">{idx + 1}. </span><strong>{q.text}</strong><span className="ml-1 text-quiz-text-muted">({q.timeLimitSec}s)</span></div>
                  <button type="button" className={deleteBtnCls} onClick={() => void handleDeleteQuestion(q.id)}>✕</button>
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
