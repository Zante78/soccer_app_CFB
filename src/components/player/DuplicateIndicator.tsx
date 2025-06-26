import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Player, DuplicateStatus } from '../../types/player';

interface DuplicateIndicatorProps {
  duplicateStatus: DuplicateStatus;
  position?: 'top-right' | 'bottom-left' | 'inline';
}

export function DuplicateIndicator({ 
  duplicateStatus, 
  position = 'top-right' 
}: DuplicateIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);

  if (!duplicateStatus.isDuplicate && !duplicateStatus.isPotentialDuplicate) {
    return null;
  }

  const positionClasses = {
    'top-right': 'absolute top-2 right-2',
    'bottom-left': 'absolute bottom-2 left-2',
    'inline': 'inline-flex ml-2'
  };

  const bgColor = duplicateStatus.isDuplicate ? 'bg-red-500' : 'bg-yellow-500';
  const textColor = 'text-white';

  return (
    <div className="relative">
      <div 
        className={`${positionClasses[position]} ${bgColor} ${textColor} p-1 rounded-full cursor-pointer z-10`}
        onClick={(e) => {
          e.stopPropagation();
          setShowDetails(!showDetails);
        }}
        title={duplicateStatus.message || (duplicateStatus.isDuplicate ? 'Duplikat gefunden' : 'Mögliches Duplikat')}
      >
        <AlertTriangle className="w-4 h-4" />
      </div>

      {showDetails && (
        <div 
          className="absolute z-20 bg-white shadow-lg rounded-lg p-3 mt-1 w-64 right-0 text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`font-medium mb-2 ${duplicateStatus.isDuplicate ? 'text-red-600' : 'text-yellow-600'}`}>
            {duplicateStatus.message}
          </div>
          
          {duplicateStatus.duplicatePlayers.length > 0 && (
            <div>
              <p className="font-medium text-gray-700 mb-1">Gefundene Spieler:</p>
              <ul className="space-y-2">
                {duplicateStatus.duplicatePlayers.map((player, index) => (
                  <li key={index} className="border-t pt-2 first:border-t-0 first:pt-0">
                    <p className="font-medium">{player.firstName} {player.lastName}</p>
                    {player.dateOfBirth && (
                      <p className="text-xs text-gray-600">
                        Geburtsdatum: {new Date(player.dateOfBirth).toLocaleDateString()}
                      </p>
                    )}
                    {player.email && (
                      <p className="text-xs text-gray-600">
                        Email: {player.email}
                      </p>
                    )}
                    {player.teamName && (
                      <p className="text-xs text-gray-600">
                        Team: {player.teamName}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}