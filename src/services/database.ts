import { createClient } from '@supabase/supabase-js';

// Get environment variables with proper validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase configuration. Please check your .env file.');
}

// Validate URL format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format. Expected format: https://[project-id].supabase.co');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storage: localStorage
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-my-custom-header': 'my-app-name' }
  }
});

let isConnected = false;
let connectionCheckPromise: Promise<boolean> | null = null;
let connectionCheckTimeout: NodeJS.Timeout | null = null;
const CONNECTION_CHECK_INTERVAL = 30000; // 30 seconds
const CONNECTION_CHECK_TIMEOUT = 5000; // 5 seconds
const MAX_RETRIES = 3;
let retryCount = 0;
let intervalId: NodeJS.Timeout | null = null;

export const handleDatabaseError = (error: unknown): Error => {
  if (!navigator.onLine) {
    return new Error('Keine Internetverbindung');
  }

  if (!isConnected) {
    return new Error('Bitte klicken Sie auf "Connect to Supabase" um die Datenbankverbindung herzustellen');
  }

  if (error && typeof error === 'object' && 'message' in error) {
    if (error.message === 'Authentication required' || 
        error.message.includes('JWT expired')) {
      window.location.reload();
      return new Error('Bitte melden Sie sich erneut an');
    }
    if (error.message.includes('Failed to fetch')) {
      return new Error('Bitte klicken Sie auf "Connect to Supabase" um die Datenbankverbindung herzustellen');
    }
    return new Error(error.message as string);
  }

  return new Error('Ein unerwarteter Datenbankfehler ist aufgetreten');
};

export async function testDatabaseConnection(): Promise<boolean> {
  // Clear any existing timeout
  if (connectionCheckTimeout) {
    clearTimeout(connectionCheckTimeout);
    connectionCheckTimeout = null;
  }

  // Return cached result if already connected
  if (isConnected) return true;

  // Return existing promise if connection check is in progress
  if (connectionCheckPromise) {
    return connectionCheckPromise;
  }

  // Start new connection check with timeout and retries
  connectionCheckPromise = (async () => {
    try {
      console.log('Testing database connection to:', supabaseUrl);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        connectionCheckTimeout = setTimeout(() => {
          reject(new Error('Connection check timed out'));
        }, CONNECTION_CHECK_TIMEOUT);
      });

      // Test connection with a simple query
      const connectionPromise = supabase
        .from('club_settings')
        .select('count')
        .limit(1)
        .single();

      // Race between timeout and connection test
      const { error } = await Promise.race([
        connectionPromise,
        timeoutPromise
      ]);

      if (error) {
        console.error('Database connection test failed:', error);
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Retrying connection (attempt ${retryCount}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return testDatabaseConnection();
        }
        throw error;
      }

      console.log('Database connection successful');
      retryCount = 0;
      isConnected = true;
      return true;
    } catch (err) {
      console.error('Database connection test failed:', err);
      isConnected = false;
      return false;
    } finally {
      // Clear timeout and reset promise
      if (connectionCheckTimeout) {
        clearTimeout(connectionCheckTimeout);
        connectionCheckTimeout = null;
      }
      connectionCheckPromise = null;
    }
  })();

  return connectionCheckPromise;
}

// Reset connection status when window loses focus
window.addEventListener('blur', () => {
  isConnected = false;
});

// Check connection when window gains focus
window.addEventListener('focus', () => {
  testDatabaseConnection().catch(console.error);
});

// Check connection when online status changes
window.addEventListener('online', () => {
  testDatabaseConnection().catch(console.error);
});

window.addEventListener('offline', () => {
  isConnected = false;
});

// Cleanup function to clear all intervals and timeouts
export function cleanup() {
  if (connectionCheckTimeout) {
    clearTimeout(connectionCheckTimeout);
    connectionCheckTimeout = null;
  }
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}

// Start periodic connection check
intervalId = setInterval(() => {
  if (document.hasFocus()) {
    testDatabaseConnection().catch(console.error);
  }
}, CONNECTION_CHECK_INTERVAL);

// Initial connection test
testDatabaseConnection().catch(console.error);

// Export connection status
export const getConnectionStatus = () => isConnected;