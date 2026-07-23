import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="relative min-h-dvh flex flex-col bg-quiz-bg-to bg-quiz-gradient">
        <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
          <div className="w-full max-w-md card-glass-strong rounded-2xl p-8 flex flex-col items-center gap-6 text-center">
            <div
              className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-option-a text-3xl shadow-xl"
              aria-hidden="true"
            >
              ⚠️
            </div>
            <h1 className="font-black text-xl text-white">Algo deu errado</h1>
            <p className="text-sm font-medium text-white/70">
              Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
            </p>
            {this.state.error && (
              <pre className="w-full overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/60 text-left max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-brand py-4 font-black text-base text-white tracking-wide shadow-md transition-all active:scale-95 motion-reduce:transition-none hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Recarregar página
            </button>
          </div>
        </main>
      </div>
    );
  }
}
