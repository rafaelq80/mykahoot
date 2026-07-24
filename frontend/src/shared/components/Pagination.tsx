interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex shrink-0 items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 0}
        aria-label="Página anterior"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-all enabled:hover:border-brand enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30 active:scale-95 motion-reduce:transition-none"
      >
        <ChevronIcon direction="left" />
      </button>
      <span className="text-sm font-bold tabular-nums text-white/60">
        Página {page + 1} de {totalPages}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages - 1}
        aria-label="Próxima página"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 text-white/70 transition-all enabled:hover:border-brand enabled:hover:text-white disabled:cursor-not-allowed disabled:opacity-30 active:scale-95 motion-reduce:transition-none"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path
        d={direction === 'left' ? 'M12.5 4.5 7 10l5.5 5.5' : 'M7.5 4.5 13 10l-5.5 5.5'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
