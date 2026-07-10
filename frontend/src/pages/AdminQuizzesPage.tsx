import { useEffect, useState, useCallback } from 'react';
import styles from '../styles/AdminPage.module.css';
import formStyles from '../styles/AdminForms.module.css';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const IK_PUBLIC_KEY = import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY ?? '';
const IK_ENDPOINT = import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT ?? '';

interface Theme {
  id: string;
  name: string;
  description?: string;
}

interface Quiz {
  id: string;
  title: string;
  themeId: string;
  theme: { name: string };
  _count: { questions: number };
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
  token: string;
}

// ── ImageKit upload helper ──────────────────────────────────────────────────
async function uploadToImageKit(
  file: File,
  token: string,
): Promise<string | null> {
  try {
    const authRes = await fetch(`${API_URL}/imagekit/auth`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!authRes.ok) return null;
    const auth = (await authRes.json()) as {
      token: string;
      expire: number;
      signature: string;
    };
    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', file.name);
    formData.append('publicKey', IK_PUBLIC_KEY);
    formData.append('signature', auth.signature);
    formData.append('expire', String(auth.expire));
    formData.append('token', auth.token);
    const uploadRes = await fetch(`${IK_ENDPOINT}/api/v1/files/upload`, {
      method: 'POST',
      body: formData,
    });
    if (!uploadRes.ok) return null;
    const result = (await uploadRes.json()) as { url: string };
    return result.url;
  } catch {
    return null;
  }
}

// ── Main component ────────────────────────────────────────────────────────────
export function AdminQuizzesPage({ token }: Props) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Theme form
  const [themeName, setThemeName] = useState('');
  const [themeDesc, setThemeDesc] = useState('');

  // Quiz form
  const [quizTitle, setQuizTitle] = useState('');
  const [quizThemeId, setQuizThemeId] = useState('');

  // Question form
  const [qText, setQText] = useState('');
  const [qOptions, setQOptions] = useState(['', '', '', '']);
  const [qCorrect, setQCorrect] = useState(0);
  const [qTime, setQTime] = useState(20);
  const [qOrder, setQOrder] = useState(1);
  const [qImageFile, setQImageFile] = useState<File | null>(null);
  const [qImageUrl, setQImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  const loadThemes = useCallback(async () => {
    const r = await fetch(`${API_URL}/themes`, { headers });
    setThemes((await r.json()) as Theme[]);
  }, []);

  const loadQuizzes = useCallback(async () => {
    const r = await fetch(`${API_URL}/quizzes`, { headers });
    setQuizzes((await r.json()) as Quiz[]);
  }, []);

  const loadQuestions = useCallback(async (quizId: string) => {
    const r = await fetch(`${API_URL}/quizzes/${quizId}/questions`, { headers });
    const data = (await r.json()) as Question[];
    setQuestions([...data].sort((a, b) => a.order - b.order));
  }, []);

  useEffect(() => {
    void loadThemes();
    void loadQuizzes();
  }, [loadThemes, loadQuizzes]);

  useEffect(() => {
    if (selectedQuizId) void loadQuestions(selectedQuizId);
  }, [selectedQuizId, loadQuestions]);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  // ── Themes ──────────────────────────────────────────────────────────────
  const createTheme = async () => {
    if (!themeName.trim()) return;
    await fetch(`${API_URL}/themes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: themeName, description: themeDesc || undefined }),
    });
    setThemeName('');
    setThemeDesc('');
    await loadThemes();
    showFeedback('Tema criado!');
  };

  const deleteTheme = async (id: string) => {
    if (!confirm('Deletar tema?')) return;
    await fetch(`${API_URL}/themes/${id}`, { method: 'DELETE', headers });
    await loadThemes();
    showFeedback('Tema removido.');
  };

  // ── Quizzes ──────────────────────────────────────────────────────────────
  const createQuiz = async () => {
    if (!quizTitle.trim() || !quizThemeId) return;
    await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ title: quizTitle, themeId: quizThemeId }),
    });
    setQuizTitle('');
    setQuizThemeId('');
    await loadQuizzes();
    showFeedback('Quiz criado!');
  };

  const deleteQuiz = async (id: string) => {
    if (!confirm('Deletar quiz e todas as perguntas?')) return;
    await fetch(`${API_URL}/quizzes/${id}`, { method: 'DELETE', headers });
    if (selectedQuizId === id) setSelectedQuizId(null);
    await loadQuizzes();
    showFeedback('Quiz removido.');
  };

  // ── Questions ────────────────────────────────────────────────────────────
  const createQuestion = async () => {
    if (!selectedQuizId || !qText.trim() || qOptions.some((o) => !o.trim())) return;
    let imageUrl = qImageUrl || null;

    if (qImageFile) {
      setUploading(true);
      imageUrl = await uploadToImageKit(qImageFile, token);
      setUploading(false);
      if (!imageUrl) {
        showFeedback('Erro ao fazer upload da imagem.');
        return;
      }
    }

    await fetch(`${API_URL}/quizzes/${selectedQuizId}/questions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        text: qText,
        options: qOptions,
        correctIndex: qCorrect,
        timeLimitSec: qTime,
        order: qOrder,
        imageUrl,
      }),
    });
    setQText('');
    setQOptions(['', '', '', '']);
    setQCorrect(0);
    setQTime(20);
    setQOrder(questions.length + 2);
    setQImageFile(null);
    setQImageUrl('');
    await loadQuestions(selectedQuizId);
    showFeedback('Pergunta adicionada!');
  };

  const deleteQuestion = async (questionId: string) => {
    if (!selectedQuizId || !confirm('Deletar pergunta?')) return;
    await fetch(`${API_URL}/quizzes/${selectedQuizId}/questions/${questionId}`, {
      method: 'DELETE',
      headers,
    });
    await loadQuestions(selectedQuizId);
    showFeedback('Pergunta removida.');
  };

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <span className={styles.topBarTitle}>Gerenciar Quizzes</span>
      </div>

      {feedback && (
        <div className={styles.errorBanner} style={{ backgroundColor: 'var(--color-neon-blue)', color: '#000' }}>
          {feedback}
        </div>
      )}

      <div className={formStyles.layout}>
        {/* ── Themes column ── */}
        <section className={formStyles.column}>
          <h2 className={formStyles.sectionTitle}>Temas</h2>

          <div className={formStyles.form}>
            <input
              className={formStyles.input}
              placeholder="Nome do tema *"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
            />
            <input
              className={formStyles.input}
              placeholder="Descrição (opcional)"
              value={themeDesc}
              onChange={(e) => setThemeDesc(e.target.value)}
            />
            <button type="button" className={formStyles.btn} onClick={() => void createTheme()}>
              + Criar tema
            </button>
          </div>

          <ul className={formStyles.list}>
            {themes.map((t) => (
              <li key={t.id} className={formStyles.listItem}>
                <div>
                  <strong>{t.name}</strong>
                  {t.description && <span className={formStyles.muted}> — {t.description}</span>}
                </div>
                <button type="button" className={formStyles.deleteBtn} onClick={() => void deleteTheme(t.id)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Quizzes column ── */}
        <section className={formStyles.column}>
          <h2 className={formStyles.sectionTitle}>Quizzes</h2>

          <div className={formStyles.form}>
            <input
              className={formStyles.input}
              placeholder="Título do quiz *"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
            />
            <select
              className={formStyles.select}
              value={quizThemeId}
              onChange={(e) => setQuizThemeId(e.target.value)}
            >
              <option value="">Selecione o tema *</option>
              {themes.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
            <button type="button" className={formStyles.btn} onClick={() => void createQuiz()}>
              + Criar quiz
            </button>
          </div>

          <ul className={formStyles.list}>
            {quizzes.map((q) => (
              <li
                key={q.id}
                className={`${formStyles.listItem} ${selectedQuizId === q.id ? formStyles.listItemSelected : ''}`}
                onClick={() => setSelectedQuizId(q.id)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <strong>{q.title}</strong>
                  <span className={formStyles.muted}> — {q.theme.name} ({q._count.questions} perguntas)</span>
                </div>
                <button
                  type="button"
                  className={formStyles.deleteBtn}
                  onClick={(e) => { e.stopPropagation(); void deleteQuiz(q.id); }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Questions column ── */}
        {selectedQuizId && (
          <section className={formStyles.column}>
            <h2 className={formStyles.sectionTitle}>Perguntas</h2>

            <div className={formStyles.form}>
              <textarea
                className={formStyles.textarea}
                placeholder="Texto da pergunta *"
                value={qText}
                onChange={(e) => setQText(e.target.value)}
                rows={3}
              />
              {qOptions.map((opt, i) => (
                <div key={i} className={formStyles.optionRow}>
                  <input
                    type="radio"
                    name="correct"
                    checked={qCorrect === i}
                    onChange={() => setQCorrect(i)}
                    aria-label={`Alternativa ${i + 1} correta`}
                  />
                  <input
                    className={formStyles.input}
                    placeholder={`Alternativa ${i + 1} *`}
                    value={opt}
                    onChange={(e) => {
                      const updated = [...qOptions];
                      updated[i] = e.target.value;
                      setQOptions(updated);
                    }}
                  />
                </div>
              ))}

              <div className={formStyles.row}>
                <label className={formStyles.label}>
                  Tempo (seg):
                  <input
                    type="number"
                    className={formStyles.inputSmall}
                    value={qTime}
                    min={5}
                    max={120}
                    onChange={(e) => setQTime(Number(e.target.value))}
                  />
                </label>
                <label className={formStyles.label}>
                  Ordem:
                  <input
                    type="number"
                    className={formStyles.inputSmall}
                    value={qOrder}
                    min={1}
                    onChange={(e) => setQOrder(Number(e.target.value))}
                  />
                </label>
              </div>

              <label className={formStyles.label}>
                Imagem (upload):
                <input
                  type="file"
                  accept="image/*"
                  className={formStyles.fileInput}
                  onChange={(e) => setQImageFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <label className={formStyles.label}>
                Ou URL da imagem:
                <input
                  className={formStyles.input}
                  placeholder="https://..."
                  value={qImageUrl}
                  onChange={(e) => setQImageUrl(e.target.value)}
                />
              </label>

              <button
                type="button"
                className={formStyles.btn}
                disabled={uploading || !qText.trim() || qOptions.some((o) => !o.trim())}
                onClick={() => void createQuestion()}
              >
                {uploading ? 'Enviando imagem...' : '+ Adicionar pergunta'}
              </button>
            </div>

            <ul className={formStyles.list}>
              {questions.map((q, idx) => (
                <li key={q.id} className={formStyles.listItem}>
                  <div>
                    <span className={formStyles.muted}>{idx + 1}. </span>
                    <strong>{q.text}</strong>
                    <span className={formStyles.muted}> ({q.timeLimitSec}s)</span>
                  </div>
                  <button
                    type="button"
                    className={formStyles.deleteBtn}
                    onClick={() => void deleteQuestion(q.id)}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
