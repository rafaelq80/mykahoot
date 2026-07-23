import { useAdminStore } from '../store/useAdminStore';
import { PodiumDisplay } from '../../shared/components/PodiumDisplay';

export function AdminPodiumPanel() {
  const finalRanking = useAdminStore((s) => s.finalRanking);
  const top5 = finalRanking.slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <div className="card-glass-strong overflow-hidden">
      <PodiumDisplay
        top5={top5}
        headerBadge="Top 5"
      />
    </div>
  );
}