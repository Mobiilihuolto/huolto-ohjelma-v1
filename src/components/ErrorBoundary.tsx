import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
          <div className="max-w-md w-full text-center">
            <h1 className="text-2xl font-bold mb-4 text-destructive">Oops! Jotain meni pieleen</h1>
            <p className="text-muted-foreground mb-4">
              Sovelluksessa tapahtui virhe. Yritä päivittää sivu.
            </p>
            <details className="text-left bg-muted p-4 rounded-md">
              <summary className="cursor-pointer font-semibold">Teknisiä tietoja</summary>
              <pre className="mt-2 text-xs overflow-auto">
                {this.state.error?.message}
                {this.state.error?.stack}
              </pre>
            </details>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Päivitä sivu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;