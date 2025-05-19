import React, { Component, ErrorInfo } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Application error:', error, errorInfo);
  }

  private getErrorMessage(error: Error): string {
    if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
      return 'Verbindungsfehler. Bitte überprüfen Sie Ihre Internetverbindung.';
    }
    if (error.message.includes('permission') || error.message.includes('Berechtigung')) {
      return 'Sie haben keine Berechtigung für diese Aktion.';
    }
    if (error.message.includes('not found') || error.message.includes('nicht gefunden')) {
      return 'Die angeforderte Ressource wurde nicht gefunden.';
    }
    return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[200px] flex items-center justify-center p-4" role="alert">
          <div className="bg-red-50 text-red-700 p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h2 className="text-lg font-semibold">Ein Fehler ist aufgetreten</h2>
            </div>
            
            <p className="mb-4 text-sm">
              {this.state.error && this.getErrorMessage(this.state.error)}
            </p>

            <div className="flex justify-end gap-3">
              {this.props.onReset && (
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    this.props.onReset?.();
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  Erneut versuchen
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                <RefreshCw className="w-4 h-4" />
                Seite neu laden
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}