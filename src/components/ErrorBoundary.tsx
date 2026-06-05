import { Component, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean; message?: string }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error) {
    // eslint-disable-next-line no-console
    console.error("App error boundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
          <span className="text-5xl">🐷</span>
          <h1 className="text-xl font-bold text-foreground">Something went sideways</h1>
          <p className="max-w-xs text-sm text-muted-foreground">
            ThriftWar hit an unexpected error. Try reloading — your data is safe.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground"
          >
            Reload app
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
