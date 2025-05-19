import React from 'react';
import { Injury } from '../../types/core/medical';
import { InjuryListItem } from './InjuryListItem';

interface InjuryListProps {
  injuries: Injury[];
  onStatusChange: (id: string, status: Injury['status']) => void;
}

export function InjuryList({ injuries, onStatusChange }: InjuryListProps) {
  const activeInjuries = injuries.filter(i => i.status === 'active');
  const pastInjuries = injuries.filter(i => i.status !== 'active');

  return (
    <div className="space-y-6">
      {activeInjuries.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Aktuelle Verletzungen</h3>
          <div className="space-y-4">
            {activeInjuries.map(injury => (
              <InjuryListItem
                key={injury.id}
                injury={injury}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}

      {pastInjuries.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-3">Vergangene Verletzungen</h3>
          <div className="space-y-4">
            {pastInjuries.map(injury => (
              <InjuryListItem
                key={injury.id}
                injury={injury}
                onStatusChange={onStatusChange}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}