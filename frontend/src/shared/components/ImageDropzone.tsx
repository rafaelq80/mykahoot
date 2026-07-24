import { useState, useRef, useCallback } from 'react';
import type { DragEvent, ChangeEvent } from 'react';
import { cn } from '../../lib/utils';
import { validateImageFile } from '../../services/imagekit';

interface ImageDropzoneProps {
  value: string | null;
  onFileSelected: (file: File) => void;
  uploading: boolean;
  uploadProgress: number | null;
  onRemove?: () => void;
}

export function ImageDropzone({
  value,
  onFileSelected,
  uploading,
  uploadProgress,
  onRemove,
}: ImageDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const validationError = validateImageFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    onFileSelected(file);
  }, [onFileSelected]);

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleClick = () => {
    if (!uploading) inputRef.current?.click();
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        role="button"
        aria-label="Área para upload de imagem. Arraste uma imagem ou clique para selecionar."
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleClick(); }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'card-glass flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 transition-colors cursor-pointer',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-quiz-highlight focus-visible:ring-offset-2',
          dragging
            ? 'border-quiz-highlight bg-quiz-highlight/10'
            : 'border-quiz-border hover:border-quiz-highlight/50',
          uploading && 'pointer-events-none opacity-70',
        )}
      >
        {value && !uploading ? (
          <img
            src={value}
            alt="Preview da imagem selecionada"
            className="max-h-32 max-w-full rounded-lg border border-quiz-border object-contain"
          />
        ) : (
          <>
            <ImageIcon />
            <p className="text-body-sm font-medium text-quiz-text-muted text-center">
              {dragging ? 'Solte a imagem aqui' : 'Arraste uma imagem ou clique para selecionar'}
            </p>
            <p className="text-label-xs text-quiz-text-muted">PNG, JPEG ou WebP · máx 5 MB</p>
          </>
        )}
      </div>

      {uploading && uploadProgress !== null && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-brand rounded-full transition-[width] duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <span className="text-label-xs font-mono text-quiz-text-muted">{uploadProgress}%</span>
        </div>
      )}

      {error && (
        <p className="text-body-sm font-bold text-option-a" role="alert">{error}</p>
      )}

      {value && !uploading && onRemove && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="self-start rounded-lg border border-quiz-border px-3 py-1.5 text-label-xs font-bold text-quiz-text-muted transition-colors hover:bg-quiz-surface hover:text-white active:scale-95"
        >
          Remover imagem
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}

function ImageIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-quiz-text-muted"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
