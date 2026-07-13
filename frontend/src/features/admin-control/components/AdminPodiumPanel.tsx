import { useAdminStore } from '../../../stores/useAdminStore';
import { PodiumDisplay } from '../../ranking/components/PodiumDisplay';

export function AdminPodiumPanel() {
  const finalRanking = useAdminStore((s) => s.finalRanking);
  const top5 = finalRanking.slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-white/20 bg-quiz-bg-to bg-quiz-gradient shadow-lg">
      <PodiumDisplay
        top5={top5}
        headerBadge="Top 5"
        appName="Ranking Final"
      />
    </div>
  );
}
