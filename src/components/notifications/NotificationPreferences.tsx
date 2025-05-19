import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { NotificationService } from '../../services/notification.service';
import { NotificationPreference } from '../../types/core/notification';
import { Bell, Settings } from 'lucide-react';

const notificationService = new NotificationService();

export function NotificationPreferences() {
  const { t } = useTranslation();
  const [preferences, setPreferences] = useState<NotificationPreference>({
    matchReminders: true,
    trainingReminders: true,
    playerUpdates: true,
    teamNews: true,
    systemUpdates: true,
    notificationGroups: []
  });

  const handleToggle = async (key: keyof NotificationPreference) => {
    try {
      const newPreferences = {
        ...preferences,
        [key]: !preferences[key]
      };
      
      await notificationService.updatePreferences('current-user-id', newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Failed to update preferences:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-900">
          {t('notifications.preferences.title')}
        </h2>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <label className="font-medium text-gray-900">
              {t('notifications.preferences.matchReminders')}
            </label>
            <p className="text-sm text-gray-500">
              {t('notifications.preferences.matchRemindersDesc')}
            </p>
          </div>
          <button
            onClick={() => handleToggle('matchReminders')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full ${
              preferences.matchReminders ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                preferences.matchReminders ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Similar toggles for other notification types */}
        {/* Add more preference controls as needed */}
      </div>
    </div>
  );
}