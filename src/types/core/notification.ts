// Existing types...

export type NotificationError = {
  code: 'network_error' | 'permission_denied' | 'storage_error' | 'unknown';
  message: string;
  details?: unknown;
};

export type NotificationResult<T> = {
  data?: T;
  error?: NotificationError;
  loading?: boolean;
};