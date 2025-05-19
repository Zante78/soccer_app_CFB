import React from 'react';
import { useSync } from '../../hooks/useSync';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { Cloud, CloudOff, RefreshCw } from 'lucide-react';

export function SyncStatus() {
  const { isOnline, isSyncing, sync } = useSync();
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-2">
      {isOnline ? (
        <Cloud className="w-5 h-5 text-green-500" />
      ) : (
        <CloudOff className="w-5 h-5 text-yellow-500" />
      )}
      
      <span className="text-sm text-gray-600">
        {isOnline ? t('sync.online') : t('sync.offline')}
      </span>

      {isOnline && (
        <button
          onClick={sync}
          disabled={isSyncing}
          className="ml-2 p-1 text-gray-600 hover:text-gray-900 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}