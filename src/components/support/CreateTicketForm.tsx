import React, { useState } from 'react';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { SupportService } from '../../services/support.service';
import { X } from 'lucide-react';

interface CreateTicketFormProps {
  onClose?: () => void;
}

const supportService = new SupportService();

export function CreateTicketForm({ onClose }: CreateTicketFormProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    category: 'technical',
    priority: 'medium',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await supportService.createSupportTicket({
        ...formData,
        userId: 'current-user-id', // Replace with actual user ID
      });
      onClose?.();
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('support.ticket.subject')}
        </label>
        <input
          type="text"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('support.ticket.category')}
        </label>
        <select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="technical">{t('support.categories.technical')}</option>
          <option value="account">{t('support.categories.account')}</option>
          <option value="feature">{t('support.categories.feature')}</option>
          <option value="bug">{t('support.categories.bug')}</option>
          <option value="other">{t('support.categories.other')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('support.ticket.priority')}
        </label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="low">{t('support.priority.low')}</option>
          <option value="medium">{t('support.priority.medium')}</option>
          <option value="high">{t('support.priority.high')}</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          {t('support.ticket.description')}
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end gap-4">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {t('common.cancel')}
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          {t('support.ticket.submit')}
        </button>
      </div>
    </form>
  );
}