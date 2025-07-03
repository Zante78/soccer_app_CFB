import React, { useRef, useState } from 'react';
import { Player } from '../../types/player';
import { PlayerCardHeader } from './cards/PlayerCardHeader';
import { PlayerCardActions } from './cards/PlayerCardActions';
import { usePlayerCard } from '../../hooks/usePlayerCard';
import { PlayerSkillsModal } from './PlayerSkillsModal';
import { A11yAnnouncer } from '../common/A11yAnnouncer';
import { ViewModeSelector } from './ViewMode';
import { TabView } from './views/TabView';
import { DashboardView } from './views/DashboardView';
import { ExpandedView } from './views/ExpandedView';
import { SplitView } from './views/SplitView';
import { useNotes } from '../../hooks/useNotes';
import NotesPanel from '../notes/NotesPanel';
import { usePlayerStore } from '../../store/playerStore';
import { supabase } from '../../services/database';
import { TeamService } from '../../services/team.service';
import { Loader, Users, AlertTriangle } from 'lucide-react';
import { DuplicateDetailsModal } from './DuplicateDetailsModal';
import { TeamAssignmentModal } from './TeamAssignmentModal';
import { PlayerManagementModal } from './PlayerManagementModal';

interface PlayerCardProps {
  player: Player;
  onClick: () => void;
  onEdit: () => void;
  onDelete?: (id: string) => void;
  onUpdateSkills?: (playerId: string, skills: any[]) => Promise<void>;
  onViewDuplicate?: (player: Player) => void;
}

export function PlayerCard({ 
  player, 
  onClick, 
  onEdit, 
  onDelete,
  onUpdateSkills,
  onViewDuplicate
}: PlayerCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { updatePlayer } = usePlayerStore();
  const { duplicateStatuses } = usePlayerStore();
  
  const {
    viewMode,
    activeTab,
    showSkillsModal,
    averageRating,
    announcement,
    handleViewModeChange,
    handleTabChange,
    toggleSkillsModal
  } = usePlayerCard(player);

  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showDuplicateDetailsModal, setShowDuplicateDetailsModal] = useState(false);
  const [showTeamAssignmentModal, setShowTeamAssignmentModal] = useState(false);
  const [showManagementModal, setShowManagementModal] = useState(false);
  const { notes, addNote, deleteNote } = useNotes(player.id);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const teamService = TeamService.getInstance();

  // Get duplicate status for this player
  const duplicateStatus = duplicateStatuses[player.id];
  const hasDuplicateIssue = duplicateStatus && (duplicateStatus.isDuplicate || duplicateStatus.isPotentialDuplicate);

  // Get current user session
  React.useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setCurrentUser(session.user.id);
      }
    };
    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setCurrentUser(session?.user?.id || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Reset states
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(false);

      // Validate file type
      if (!file.type.match(/^image\/(jpeg|png|gif)$/)) {
        throw new Error('Nur JPEG, PNG und GIF Dateien sind erlaubt');
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Die Datei darf maximal 5MB groß sein');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${player.id}-${Date.now()}.${fileExt}`;

      // Delete old photo if exists
      if (player.photoUrl) {
        const oldFileName = player.photoUrl.split('/').pop();
        if (oldFileName) {
          await supabase.storage
            .from('players')
            .remove([oldFileName]);
        }
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('players')
        .upload(fileName, file, {
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('players')
        .getPublicUrl(fileName);

      // Update player record
      await updatePlayer(player.id, { 
        ...player,
        photoUrl: data.publicUrl 
      });

      setUploadSuccess(true);

      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Foto erfolgreich hochgeladen';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

    } catch (err) {
      console.error('Failed to upload photo:', err);
      setUploadError(err instanceof Error ? err.message : 'Fehler beim Hochladen des Fotos');
      
      // Show error message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = err instanceof Error ? err.message : 'Fehler beim Hochladen des Fotos';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = () => {
    if (onDelete && window.confirm('Möchten Sie diesen Spieler wirklich löschen?')) {
      onDelete(player.id);
    }
  };

  const handleCloseNotesModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowNotesModal(false);
  };

  const handleAssignTeam = async (teamId: string, role: string) => {
    try {
      // If teamId is empty, remove player from team
      if (!teamId) {
        await teamService.removePlayerFromTeam(player.id);
        
        // Update player in store
        await updatePlayer(player.id, {
          ...player,
          teamId: null,
          teamName: null
        });
        
        // Show success message
        const toast = document.createElement('div');
        toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        toast.textContent = 'Spieler erfolgreich aus dem Team entfernt';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        return;
      }
      
      // Add player to team
      const result = await teamService.addTeamMember(teamId, player.id, role);
      
      // Get team name
      const { data: team } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();
      
      // Update player in store
      await updatePlayer(player.id, {
        ...player,
        teamId,
        teamName: team?.name
      });
      
      // Show success message
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = player.teamId 
        ? 'Team des Spielers erfolgreich geändert' 
        : 'Spieler erfolgreich einem Team zugewiesen';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      setShowTeamAssignmentModal(false);
    } catch (error) {
      console.error('Failed to assign team:', error);
      throw error;
    }
  };

  const handleSkillsUpdate = async (updatedSkills: any[]) => {
    try {
      if (!updatedSkills || updatedSkills.length === 0) {
        throw new Error('Ungültige Fähigkeiten');
      }

      await updatePlayer(player.id, {
        ...player,
        skills: updatedSkills
      });
      
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Fähigkeiten erfolgreich gespeichert';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);

      toggleSkillsModal();
    } catch (error) {
      console.error('Failed to update skills:', error);
      
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Fehler beim Speichern der Fähigkeiten';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      throw error;
    }
  };

  const handleSavePlayer = async (playerData: Omit<Player, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await updatePlayer(player.id, {
        ...player,
        ...playerData
      });
      
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      toast.textContent = 'Spielerdaten erfolgreich gespeichert';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 3000);
      
      setShowManagementModal(false);
    } catch (error) {
      console.error('Failed to update player:', error);
      throw error;
    }
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 relative group"
      role="button"
      tabIndex={0}
      aria-label={`${player.firstName} ${player.lastName}`}
    >
      <div className="relative">
        <PlayerCardHeader
          photoUrl={player.photoUrl}
          firstName={player.firstName}
          lastName={player.lastName}
          averageRating={averageRating}
          uploading={uploading}
          duplicateStatus={duplicateStatus}
        />

        {/* Team Badge - Display if player has a team */}
        {player.teamName && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center">
            <Users className="w-3 h-3 mr-1" />
            {player.teamName}
          </div>
        )}

        <ViewModeSelector
          currentMode={viewMode}
          onModeChange={handleViewModeChange}
        />

        <PlayerCardActions
          onEdit={onEdit}
          onDelete={handleDelete}
          onNotes={() => setShowNotesModal(true)}
          onManagePlayer={() => setShowManagementModal(true)}
          onViewSkills={toggleSkillsModal} // Add this prop to open skills modal
          onPhotoUpload={handlePhotoUpload}
          fileInputRef={fileInputRef}
          disabled={uploading}
        />

        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center text-white">
              <Loader className="w-8 h-8 animate-spin mx-auto mb-2" />
              <p>Foto wird hochgeladen...</p>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white px-4 py-2 text-sm">
            {uploadError}
          </div>
        )}
      </div>

      <div className="transition-all duration-200">
        {viewMode === 'tabs' && (
          <TabView 
            player={player} 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        )}
        {viewMode === 'dashboard' && (
          <DashboardView player={player} />
        )}
        {viewMode === 'expanded' && (
          <ExpandedView player={player} />
        )}
        {viewMode === 'split' && (
          <SplitView player={player} />
        )}
      </div>

      {showSkillsModal && (
        <PlayerSkillsModal
          player={player}
          onClose={toggleSkillsModal}
          onSave={handleSkillsUpdate}
        />
      )}

      {showNotesModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" 
          onClick={handleCloseNotesModal}
        >
          <div 
            className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <NotesPanel
              notes={notes}
              onAddNote={async (note) => {
                if (!currentUser) return;
                await addNote({
                  ...note,
                  playerId: player.id,
                  authorId: currentUser
                });
                setShowNotesModal(false);
              }}
              onDeleteNote={deleteNote}
              onClose={handleCloseNotesModal}
            />
          </div>
        </div>
      )}

      {showTeamAssignmentModal && (
        <TeamAssignmentModal
          player={player}
          onClose={() => setShowTeamAssignmentModal(false)}
          onAssign={handleAssignTeam}
        />
      )}

      {showManagementModal && (
        <PlayerManagementModal
          player={player}
          onClose={() => setShowManagementModal(false)}
          onSave={handleSavePlayer}
        />
      )}

      {/* Duplicate warning tooltip at bottom */}
      {hasDuplicateIssue && (
        <div 
          className="absolute bottom-0 left-0 right-0 p-2 bg-gray-100 cursor-pointer hover:underline"
          onClick={(e) => {
            e.stopPropagation();
            setShowDuplicateDetailsModal(true);
          }}
        >
          <div className="text-xs text-gray-900 flex items-center">
            <AlertTriangle className="w-3 h-3 mr-1 flex-shrink-0 text-gray-700" />
            <span className="truncate">{duplicateStatus.message}</span>
          </div>
        </div>
      )}

      {/* Duplicate Details Modal */}
      {showDuplicateDetailsModal && duplicateStatus && (
        <DuplicateDetailsModal
          duplicateStatus={duplicateStatus}
          onClose={() => setShowDuplicateDetailsModal(false)}
          onViewDetails={onViewDuplicate}
        />
      )}

      {announcement && (
        <A11yAnnouncer message={announcement} />
      )}
    </div>
  );
}