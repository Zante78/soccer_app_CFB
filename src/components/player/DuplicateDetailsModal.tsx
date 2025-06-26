import React, { useState } from 'react';
import { AlertTriangle, Eye, X, Trash2, GitMerge } from 'lucide-react';
import { Player, DuplicateStatus } from '../../types/player';
import { MergePlayersModal } from './MergePlayersModal';

interface DuplicateDetailsModalProps {
  duplicateStatus: DuplicateStatus;
  onClose: () => void;
  onViewDetails?: (player: Player) => void;
  onMergePlayers?: (masterPlayer: Player, duplicatePlayers: Player[]) => Promise<void>;
  onDeletePlayers?: (playerIds: string[]) => Promise<void>;
}

export function DuplicateDetailsModal({ 
  duplicateStatus, 
  onClose,
  onViewDetails,
  onMergePlayers,
  onDeletePlayers
}: DuplicateDetailsModalProps) {
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<Record<string, boolean>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleMergeClick = () => {
    setShowMergeModal(true);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!onDeletePlayers) return;
    
    const playerIdsToDelete = Object.entries(selectedPlayers)
      .filter(([_, isSelected]) => isSelected)
      .map(([playerId]) => playerId);
    
    if (playerIdsToDelete.length === 0) {
      alert('Bitte wählen Sie mindestens einen Spieler zum Löschen aus');
      return;
    }

    try {
      await onDeletePlayers(playerIdsToDelete);
      onClose();
    } catch (error) {
      console.error('Error deleting players:', error);
      alert('Fehler beim Löschen der Spieler');
    }
  };

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => ({
      ...prev,
      [playerId]: !prev[playerId]
    }));
  };

  const anyPlayerSelected = Object.values(selectedPlayers).some(isSelected => isSelected);

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
            <div className="flex justify-between items-center mb-2">
              <p className="font-medium text-gray-700">Gefundene Spieler:</p>
              
              {!showDeleteConfirm && (
                <div className="flex gap-2">
                  {onMergePlayers && (
                    <button
                      onClick={handleMergeClick}
                      className="flex items-center text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded"
                    >
                      <GitMerge className="w-3.5 h-3.5 mr-1" />
                      Zusammenführen
                    </button>
                  )}
                  
                  {onDeletePlayers && (
                    <button
                      onClick={handleDeleteClick}
                      className="flex items-center text-xs px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Löschen
                    </button>
                  )}
                </div>
              )}
            </div>
            
            <ul className="space-y-3 max-h-60 overflow-y-auto divide-y divide-gray-100">
              {duplicateStatus.duplicatePlayers.map((player, index) => (
                <li key={index} className="pt-3 first:pt-0">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      {showDeleteConfirm && (
                        <input
                          type="checkbox"
                          checked={selectedPlayers[player.id] || false}
                          onChange={() => togglePlayerSelection(player.id)}
                          className="mt-1 rounded text-blue-600 focus:ring-blue-500"
                        />
                      )}
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
                    </div>
                    {onViewDetails && !showDeleteConfirm && (
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
            
            {showDeleteConfirm && (
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={!anyPlayerSelected}
                  className="px-3 py-1.5 text-sm text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
                >
                  Ausgewählte löschen
                </button>
              </div>
            )}
          </div>
        )}
        
        {showMergeModal && onMergePlayers && (
          <MergePlayersModal
            duplicatePlayers={duplicateStatus.duplicatePlayers}
            onClose={() => setShowMergeModal(false)}
            onMerge={async (masterPlayer, duplicatePlayers) => {
              try {
                await onMergePlayers(masterPlayer, duplicatePlayers);
                setShowMergeModal(false);
                onClose();
              } catch (error) {
                console.error('Error merging players:', error);
                alert('Fehler beim Zusammenführen der Spieler');
              }
            }}
          />
        )}
      </div>
    </div>
  );
}