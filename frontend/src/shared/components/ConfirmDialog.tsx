import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  // Fechar ao clicar no backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) {
      onCancel();
    }
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClick}
      onCancel={onCancel}
      className="fixed inset-0 z-50 m-auto flex items-center justify-center bg-transparent backdrop:bg-black/60"
    >
      <div className="card-glass-strong w-full max-w-sm rounded-2xl p-6 flex flex-col gap-4 text-white">
        <h2 className="font-black text-base">{title}</h2>
        {message && <p className="text-sm font-medium text-white/70">{message}</p>}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'rounded-lg border border-quiz-border px-4 py-2 text-sm font-bold text-white',
              'transition-colors hover:bg-quiz-surface active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'rounded-lg bg-option-a px-4 py-2 text-sm font-bold text-white',
              'transition-all active:scale-95',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-option-a focus-visible:ring-offset-2',
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
