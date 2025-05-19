import React, { useState, useEffect } from 'react';
import { Player } from '../types/player';
import { GameStatistics, Note } from '../types/statistics';
import { useSkills } from '../hooks/useSkills';
import { useNotes } from '../hooks/useNotes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/Tabs';
import { EvaluationMatrix } from './evaluation/EvaluationMatrix';
import { HistoryPanel } from './history/HistoryPanel';
import StatisticsPanel from './statistics/StatisticsPanel';
import NotesPanel from './notes/NotesPanel';
import { DatabaseConnectionError } from './common/DatabaseConnectionError';
import { Loader } from 'lucide-react';

interface PlayerDetailsProps {
  player: Player;
  statistics: GameStatistics[];
  onAddStatistics: () => void;
}

export default function PlayerDetails({
  player,
  statistics,
  onAddStatistics,
}: PlayerDetailsProps) {
  const { categories, skills, loading: skillsLoading, error: skillsError } = useSkills();
  const { notes, loading: notesLoading, error: notesError, loadNotes, addNote, deleteNote } = useNotes(player.id);

  useEffect(() => {
    loadNotes();
  }, [player.id]);

  if (skillsError?.message?.includes('Failed to fetch') || 
      notesError?.message?.includes('Failed to fetch')) {
    return <DatabaseConnectionError />;
  }

  if (skillsLoading || notesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {player.firstName} {player.lastName}
        </h1>
        <div className="text-sm text-gray-500">
          {player.position}
        </div>
      </div>

      <Tabs defaultValue="evaluation">
        <TabsList>
          <TabsTrigger value="evaluation">Bewertung</TabsTrigger>
          <TabsTrigger value="history">Verlauf</TabsTrigger>
          <TabsTrigger value="statistics">Statistiken</TabsTrigger>
          <TabsTrigger value="notes">Notizen</TabsTrigger>
        </TabsList>

        <TabsContent value="evaluation">
          <EvaluationMatrix
            playerId={player.id}
            skills={skills}
            categories={categories}
          />
        </TabsContent>

        <TabsContent value="history">
          <HistoryPanel playerId={player.id} />
        </TabsContent>

        <TabsContent value="statistics">
          <StatisticsPanel
            statistics={statistics}
            onAddStatistics={onAddStatistics}
          />
        </TabsContent>

        <TabsContent value="notes">
          <NotesPanel
            notes={notes}
            onAddNote={(note) => addNote({
              ...note,
              playerId: player.id,
              authorId: 'current-user-id' // TODO: Replace with actual user ID
            })}
            onDeleteNote={deleteNote}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}