import React from 'react';
import { Injury } from '../../types/core/medical';
import { Activity, AlertTriangle } from 'lucide-react';

interface InjuryListItemProps {
  injury: Injury;
  onStatusChange: (id: string, status: Injury['status']) => void;
}

export function InjuryListItem({ injury, onStatusChange }: InjuryListItemProps) {
  const severityColors = {
    minor: 'bg-yellow-100 text-yellow-800',
    moderate: 'bg-orange-100 text-orange-800',
    severe: 'bg-red-100 text-red-800'
  };

  const statusColors = {
    active: 'bg-red-100 text-red-800',
    recovered: 'bg-green-100 text-green-800',
    recurring: 'bg-purple-100 text-purple-800'
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${severityColors[injury.severity]}`}>
              <AlertTriangle className="w-3 h-3 mr-1" />
              {injury.severity === 'minor' ? 'Leicht' : 
               injury.severity === 'moderate' ? 'Mittel' : 'Schwer'}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[injury.status]}`}>
              <Activity className="w-3 h-3 mr-1" />
              {injury.status === 'active' ? 'Aktiv' :
               injury.status === 'recovered' ? 'Geheilt' : 'Wiederkehrend'}
            </span>
          </div>
          <h4 className="text-lg font-medium text-gray-900">{injury.type}</h4>
          <p className="text-sm text-gray-600">Lokalisation: {injury.location}</p>
          <p className="text-sm text-gray-500">
            Seit: {new Date(injury.startDate).toLocaleDateString()}
          </p>
        </div>

        {injury.status === 'active' && (
          <select
            value={injury.status}
            onChange={(e) => onStatusChange(injury.id, e.target.value as Injury['status'])}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="active">Aktiv</option>
            <option value="recovered">Geheilt</option>
            <option value="recurring">Wiederkehrend</option>
          </select>
        )}
      </div>

      {injury.rehabilitationPlan && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-900">Rehabilitationsplan</h5>
          <p className="text-sm text-gray-600 mt-1">{injury.rehabilitationPlan}</p>
        </div>
      )}

      {injury.notes && (
        <div className="mt-4">
          <h5 className="text-sm font-medium text-gray-900">Notizen</h5>
          <p className="text-sm text-gray-600 mt-1">{injury.notes}</p>
        </div>
      )}
    </div>
  );
}