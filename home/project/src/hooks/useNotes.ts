import { useState, useCallback } from 'react';
import { Note } from '../types/core/notes';
import { NotesService } from '../services/notes.service';

const notesService = NotesService.getInstance();

export function useNotes(playerId: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await notesService.getPlayerNotes(playerId);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [playerId]);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      const newNote = await notesService.createNote(note);
      setNotes(prev => [newNote, ...prev]);
      return newNote;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create note');
      throw err;
    }
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    try {
      setError(null);
      await notesService.deleteNote(id);
      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  }, []);

  return {
    notes,
    loading,
    error,
    loadNotes,
    addNote,
    deleteNote
  };
}