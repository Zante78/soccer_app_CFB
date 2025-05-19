import React, { useEffect } from 'react';
import { TeamManagement } from './components/team/TeamManagement';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { DatabaseErrorBoundary } from './components/common/DatabaseErrorBoundary';
import { Loader } from 'lucide-react';
import { useStore } from './store/store';
import { SignInForm } from './components/auth/SignInForm';
import { AuthService } from './services/auth.service';
import { Header } from './components/Header';
import { usePlayerStore } from './store/playerStore';
import { cleanup as cleanupDatabase } from './services/database';

function App() {
  const { isLoading, error, initialized, initialize } = useStore();
  const { initialize: initializePlayers } = usePlayerStore();
  const [session, setSession] = React.useState<boolean | null>(null);
  const [authChecked, setAuthChecked] = React.useState(false);

  useEffect(() => {
    const authService = AuthService.getInstance();

    authService.onSessionChange((hasSession) => {
      setSession(hasSession);
      setAuthChecked(true);
    });

    const checkAuth = async () => {
      try {
        const currentSession = await authService.getCurrentSession();
        setSession(!!currentSession);
      } catch (err) {
        console.error('Auth check failed:', err);
        setSession(false);
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();

    return () => {
      authService.destroy();
      cleanupDatabase();
    };
  }, []);

  useEffect(() => {
    if (!initialized && session && authChecked) {
      Promise.all([
        initialize(),
        initializePlayers()
      ]).catch(console.error);
    }
  }, [initialized, initialize, initializePlayers, session, authChecked]);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Anwendung wird geladen...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <SignInForm />;
  }

  return (
    <ErrorBoundary>
      <DatabaseErrorBoundary>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <TeamManagement />
          </main>
        </div>
      </DatabaseErrorBoundary>
    </ErrorBoundary>
  );
}

export default App;