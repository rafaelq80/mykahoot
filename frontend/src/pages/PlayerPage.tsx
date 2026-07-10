import { useState, useCallback } from 'react';
import { useGame } from '../hooks/useGame';
import styles from '../styles/PlayerPage.module.css';

const AVATARS = ['😺', '🦊', '🐼', '🤖', '👾', '🦄', '🐸', '🎃', '👻', '🦁', '🐯', '🐧'];
const OPTION_COLORS = [
  'var(--color-opt-A)',
  'var(--color-opt-B)',
  'var(--color-opt-C)',
  'var(--color-opt-D)',
];
const OPTION_ICONS = ['▲', '◆', '●', '■'];
const MEDALS = ['🥇', '🥈', '🥉'];
const CONFETTI_COLORS = ['#FFE600', '#FF2D78', '#00CFFF', '#39FF14', '#FF8C00', '#B26EFF'];

// Static particle positions (generated once)
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  top: `${Math.floor((i * 37 + 11) % 100)}%`,
  left: `${Math.floor((i * 53 + 7) % 100)}%`,
}));

// Confetti pieces
const CONFETTI_PIECES = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left: `${Math.floor((i * 31 + 5) % 100)}%`,
  delay: `${(i * 0.1) % 2}s`,
  size: `${6 + (i % 8)}px`,
}));

export function PlayerPage() {
  const {
    screen,
    playerCount,
    playerInfo,
    question,
    questionResult,
    finalResult,
    hasAnswered,
    selectedIndex,
    timer,
    errorMessage,
    entrar,
    responder,
  } = useGame();

  const [nickname, setNickname] = useState('');
  const [chosenAvatar, setChosenAvatar] = useState<string | null>(null);

  const handleEntrar = useCallback(() => {
    if (!nickname.trim() || !chosenAvatar) return;
    entrar(nickname.trim(), chosenAvatar);
  }, [nickname, chosenAvatar, entrar]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleEntrar();
  };

  const isTimerUrgent = timer > 0 && timer <= 5;

  return (
    <div className={styles.page}>
      {/* Particles */}
      <div className={styles.particles} aria-hidden="true">
        {PARTICLES.map((p) => (
          <div
            key={p.id}
            className={styles.particle}
            style={{ top: p.top, left: p.left }}
          />
        ))}
      </div>

      {/* Error banner */}
      {errorMessage && (
        <div role="alert" className={styles.errorBanner}>
          {errorMessage}
        </div>
      )}

      {/* Header — shown during game */}
      {(screen === 'question' ||
        screen === 'question_result' ||
        screen === 'lobby') &&
        playerInfo && (
          <header className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.headerAvatar} aria-hidden="true">
                {playerInfo.avatar}
              </div>
              <span className={styles.headerNickname}>{playerInfo.nickname}</span>
            </div>
            {questionResult && (
              <span className={styles.headerScore}>
                {questionResult.you.score.toLocaleString()} pts
              </span>
            )}
          </header>
        )}

      {/* Progress bar placeholder during question */}
      {screen === 'question' && (
        <div className={styles.progressBar}>
          <div className={styles.progressBarFill} style={{ width: '100%' }} />
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className={styles.content}>

        {/* Connecting */}
        {screen === 'connecting' && (
          <p className={styles.connectingText}>Conectando...</p>
        )}

        {/* Entry */}
        {screen === 'entry' && (
          <div className={styles.entryWrapper}>
            <h1 className={styles.logo}>QuizLive</h1>

            <div className={styles.card}>
              <p className={styles.cardLabel}>Escolha seu avatar</p>
              <div className={styles.avatarGrid}>
                {AVATARS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    aria-label={`Avatar ${emoji}`}
                    aria-pressed={chosenAvatar === emoji}
                    className={`${styles.avatarBtn} ${chosenAvatar === emoji ? styles.avatarBtnSelected : ''}`}
                    onClick={() => setChosenAvatar(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.card}>
              <p className={styles.cardLabel}>Seu apelido</p>
              <input
                className={styles.nicknameInput}
                type="text"
                placeholder="Digite seu apelido..."
                maxLength={20}
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                onKeyDown={handleKeyDown}
                aria-label="Apelido"
              />
            </div>

            <button
              type="button"
              className={styles.enterBtn}
              disabled={!nickname.trim() || !chosenAvatar}
              onClick={handleEntrar}
            >
              ENTRAR NA ARENA →
            </button>
          </div>
        )}

        {/* Lobby */}
        {screen === 'lobby' && (
          <div className={styles.lobbyWrapper}>
            <p className={styles.lobbyTitle}>Aguardando o professor...</p>
            <p className={styles.playerCount}>{playerCount}</p>
            <p className={styles.playerCountLabel}>
              {playerCount === 1 ? 'jogador na arena' : 'jogadores na arena'}
            </p>
          </div>
        )}

        {/* Question */}
        {screen === 'question' && question && (
          <div className={styles.questionWrapper}>
            <h2 className={styles.questionText}>{question.text}</h2>

            {question.imageUrl && (
              <img
                className={styles.questionImage}
                src={question.imageUrl}
                alt="Imagem da pergunta"
              />
            )}

            <div className={styles.timerWrap}>
              <div
                className={`${styles.timer} ${isTimerUrgent ? styles.timerUrgent : ''}`}
                aria-live="polite"
                aria-label={`${timer} segundos restantes`}
              >
                {timer}
              </div>
            </div>

            <div className={styles.optionsGrid} role="group" aria-label="Alternativas">
              {question.options.map((opt, idx) => {
                const isSelected = selectedIndex === idx;
                const isDimmed = hasAnswered && !isSelected;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={`${styles.optionBtn}${isDimmed ? ' ' + styles.optionDimmed : ''}${isSelected ? ' ' + styles.optionSelected : ''}`}
                    style={{ backgroundColor: OPTION_COLORS[idx] }}
                    disabled={hasAnswered}
                    onClick={() => responder(question.questionId, idx)}
                    aria-pressed={isSelected}
                    aria-disabled={hasAnswered}
                  >
                    <span className={styles.optionIcon} aria-hidden="true">
                      {OPTION_ICONS[idx]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Question result */}
        {screen === 'question_result' && questionResult && question && (
          <div className={styles.resultWrapper}>
            {questionResult.you.correct ? (
              <p className={styles.resultCorrect} role="status">✓ CORRETO!</p>
            ) : (
              <p className={styles.resultWrong} role="status">✗ Errou!</p>
            )}

            <p className={styles.pointsEarned}>
              {questionResult.you.score.toLocaleString()} pts
            </p>

            <p className={styles.correctAnswer}>
              Resposta certa:{' '}
              <span className={styles.correctAnswerValue}>
                {OPTION_ICONS[questionResult.correctIndex]}{' '}
                {question.options[questionResult.correctIndex]}
              </span>
            </p>

            <div className={styles.rankingList} aria-label="Top 5">
              {questionResult.top5.map((entry, idx) => {
                const isSelf =
                  playerInfo?.nickname === entry.nickname &&
                  playerInfo?.avatar === entry.avatar;
                return (
                  <div
                    key={idx}
                    className={`${styles.rankingRow} ${isSelf ? styles.rankingRowSelf : ''}`}
                    aria-current={isSelf ? 'true' : undefined}
                    style={{ animationDelay: `${idx * 0.06}s` }}
                  >
                    <span className={styles.rankingPos}>
                      {idx < 3 ? MEDALS[idx] : `${idx + 1}`}
                    </span>
                    <span className={styles.rankingAvatar} aria-hidden="true">
                      {entry.avatar}
                    </span>
                    <span className={styles.rankingNickname}>
                      {entry.nickname}
                      {isSelf && ' (você)'}
                    </span>
                    <span className={styles.rankingScore}>
                      {entry.score.toLocaleString()} pts
                    </span>
                  </div>
                );
              })}

              {/* Show self if outside top 5 */}
              {questionResult.you.position > 5 && playerInfo && (
                <div className={`${styles.rankingRow} ${styles.rankingRowSelf}`}>
                  <span className={styles.rankingPos}>
                    {questionResult.you.position}
                  </span>
                  <span className={styles.rankingAvatar} aria-hidden="true">
                    {playerInfo.avatar}
                  </span>
                  <span className={styles.rankingNickname}>
                    {playerInfo.nickname} (você)
                  </span>
                  <span className={styles.rankingScore}>
                    {questionResult.you.score.toLocaleString()} pts
                  </span>
                </div>
              )}
            </div>

            <p className={styles.waitingLabel}>Aguardando o professor...</p>
          </div>
        )}

        {/* Final ranking */}
        {screen === 'final_ranking' && finalResult && (
          <div className={styles.finalWrapper}>
            {/* Confetti */}
            <div className={styles.confetti} aria-hidden="true">
              {CONFETTI_PIECES.map((p) => (
                <div
                  key={p.id}
                  className={styles.confettiPiece}
                  style={{
                    backgroundColor: p.color,
                    left: p.left,
                    top: '-20px',
                    width: p.size,
                    height: p.size,
                    animationDelay: p.delay,
                  }}
                />
              ))}
            </div>

            <h2 className={styles.finalTitle}>🏆 FIM DA ARENA 🏆</h2>

            <div className={styles.rankingList} aria-label="Ranking final">
              {finalResult.top5.map((entry, idx) => {
                const isSelf =
                  playerInfo?.nickname === entry.nickname &&
                  playerInfo?.avatar === entry.avatar;
                return (
                  <div
                    key={idx}
                    className={`${styles.rankingRow} ${isSelf ? styles.rankingRowSelf : ''}`}
                    aria-current={isSelf ? 'true' : undefined}
                    style={{ animationDelay: `${idx * 0.08}s` }}
                  >
                    <span className={styles.rankingPos}>
                      {idx < 3 ? MEDALS[idx] : `${idx + 1}`}
                    </span>
                    <span className={styles.rankingAvatar} aria-hidden="true">
                      {entry.avatar}
                    </span>
                    <span className={styles.rankingNickname}>
                      {entry.nickname}
                      {isSelf && ' (você)'}
                    </span>
                    <span className={styles.rankingScore}>
                      {entry.score.toLocaleString()} pts
                    </span>
                  </div>
                );
              })}

              {/* Show self if outside top 5 */}
              {finalResult.you.position > 5 && playerInfo && (
                <div className={`${styles.rankingRow} ${styles.rankingRowSelf}`}>
                  <span className={styles.rankingPos}>
                    {finalResult.you.position}
                  </span>
                  <span className={styles.rankingAvatar} aria-hidden="true">
                    {playerInfo.avatar}
                  </span>
                  <span className={styles.rankingNickname}>
                    {playerInfo.nickname} (você)
                  </span>
                  <span className={styles.rankingScore}>
                    {finalResult.you.score.toLocaleString()} pts
                  </span>
                </div>
              )}
            </div>

            <p className={styles.finalPosition}>
              Sua posição final:{' '}
              <span className={styles.finalPositionValue}>
                {finalResult.you.position}º de {playerCount}
              </span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

