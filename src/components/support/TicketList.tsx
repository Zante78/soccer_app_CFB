import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { SupportService } from '../../services/support.service';
import { SupportTicket } from '../../types/core/support';
import { CreateTicketForm } from './CreateTicketForm';
import { Plus } from 'lucide-react';

const supportService = new SupportService();

export function TicketList() {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const statusColors = {
    open: 'bg-yellow-100 text-yellow-800',
    in_progress: 'bg-blue-100 text-blue-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t('support.tickets.title')}
        </h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          {t('support.tickets.create')}
        </button>
      </div>

      {showCreateForm ? (
        <CreateTicketForm onClose={() => setShowCreateForm(false)} />
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    statusColors[ticket.status]
                  }`}
                >
                  {t(`support.tickets.status.${ticket.status}`)}
                </span>
              </div>
              <p className="mt-2 text-gray-700">{ticket.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}