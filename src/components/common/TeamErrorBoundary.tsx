import React, { Component, ErrorInfo } from 'react';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class TeamErrorBoundary extends Component<Props, State> {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Team operation error:', error, errorInfo);
  }

  private getErrorMessage(error: Error): string {
    if (error.message.includes('keine Berechtigung')) {
      return 'Sie haben keine Berechtigung für diese Aktion. Bitte wenden Sie sich an einen Administrator.';
    }
    if (error.message.includes('bereits Mitglied') || error.message.includes('already has an active team membership') || error.message.includes('Player already has an active team membership')) {
      return 'Der Spieler ist bereits Mitglied eines anderen Teams. Ein Spieler kann nur einem Team zugewiesen werden.';
    }
    if (error.message.includes('Player must be at least 5 years old')) {
      return 'Der Spieler muss mindestens 5 Jahre alt sein.';
    }
    return 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.';
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-lg bg-red-50 p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Fehler bei der Team-Operation
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{this.state.error && this.getErrorMessage(this.state.error)}</p>
              </div>
              {this.props.onRetry && (
                <button
                  onClick={() => {
                    this.setState({ hasError: false, error: null });
                    this.props.onRetry?.();
                  }}
                  className="mt-4 text-sm font-medium text-red-600 hover:text-red-500"
                >
                  Erneut versuchen
                </button>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}