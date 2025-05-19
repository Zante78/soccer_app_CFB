import { useState, useCallback } from 'react';
import { NotificationError } from '../types/core/notification';
import { handleNotificationError } from '../utils/errorUtils';

export function useNotificationError() {
  const [error, setError] = useState<NotificationError | null>(null);

  const handleError = useCallback((e: unknown) => {
    const notificationError = handleNotificationError(e);
    setError(notificationError);
    return notificationError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError
  };
}