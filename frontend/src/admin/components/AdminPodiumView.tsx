import type { AdminFimEntry } from '../../types/events';
import { PodiumDisplay } from '../../shared/components/PodiumDisplay';

interface AdminPodiumViewProps {
  finalRanking: AdminFimEntry[];
}

export function AdminPodiumView({ finalRanking }: AdminPodiumViewProps) {
  const top5 = finalRanking.slice(0, 5);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-quiz-bg-to bg-quiz-gradient text-white">
      <PodiumDisplay top5={top5} headerBadge="Partida encerrada" />
    </div>
  );
}
