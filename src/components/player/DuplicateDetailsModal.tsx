import React from 'react';
import { AlertTriangle, Eye, X } from 'lucide-react';
import { Player, DuplicateStatus } from '../../types/player';

interface DuplicateDetailsModalProps {
  duplicateStatus: DuplicateStatus;
  onClose: () => void;
  onViewDetails?: (player: Player) => void;
}

export function DuplicateDetailsModal({ 
  duplicateStatus, 
  onClose,
  onViewDetails
}: DuplicateDetailsModalProps) {
  if (!duplicateStatus.isDuplicate && !duplicateStatus.isPotentialDuplicate) {
    return null;
  }

  const handleViewDetails = (player: Player, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(player);
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div 
        className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full text-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 mt-0.5 ${duplicateStatus.isDuplicate ? 'text-red-500' : 'text-yellow-500'}`} />
            <div>
              <h3 className={`font-semibold text-lg ${duplicateStatus.isDuplicate ? 'text-red-600' : 'text-yellow-600'}`}>
                {duplicateStatus.isDuplicate ? 'Duplikat gefunden' : 'Mögliches Duplikat'}
              </h3>
              <p className="text-gray-600 mt-1">{duplicateStatus.message}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {duplicateStatus.duplicatePlayers.length > 0 && (
          <div>
            <p className="font-medium text-gray-700 mb-2">Gefundene Spieler:</p>
            <ul className="space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-100">
              {duplicateStatus.duplicatePlayers.map((player, index) => (
                <li key={index} className="pt-3 first:pt-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{player.firstName} {player.lastName}</p>
                      <div className="text-xs space-y-0.5 mt-1 text-gray-600">
                        {player.dateOfBirth && (
                          <p>Geburtsdatum: {new Date(player.dateOfBirth).toLocaleDateString()}</p>
                        )}
                        {player.email && <p>Email: {player.email}</p>}
                        {player.teamName && <p>Team: {player.teamName}</p>}
                      </div>
                    </div>
                    {onViewDetails && (
                      <button
                        onClick={(e) => handleViewDetails(player, e)}
                        className="flex items-center text-xs text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" />
                        Details anzeigen
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}