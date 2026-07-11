import { PodiumView } from '../../features/ranking/components/PodiumView';

export default function PodiumPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-quiz-bg-to bg-quiz-gradient text-white select-none">
      <PodiumView />
    </div>
  );
}