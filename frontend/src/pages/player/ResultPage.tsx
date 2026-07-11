import { useGameStore } from '../../stores/useGameStore';
import { QuestionResultView } from '../../features/ranking/components/QuestionResultView';
import { AvatarBadge } from '../../components/shared/AvatarBadge';
import { ScorePill } from '../../components/shared/ScorePill';

export default function ResultPage() {
  const playerInfo = useGameStore((s) => s.playerInfo);
  const questionResult = useGameStore((s) => s.questionResult);

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      {/* Header */}
      {playerInfo && (
        <header className="flex items-center justify-between border-b border-surface-container bg-surface px-4 py-3 shadow-sm">
          <AvatarBadge avatar={playerInfo.avatar} nickname={playerInfo.nickname} />
          {questionResult && <ScorePill score={questionResult.you.score} />}
        </header>
      )}

      <main className="flex flex-1 flex-col items-center justify-start px-4 py-6">
        <QuestionResultView />
      </main>
    </div>
  );
}
