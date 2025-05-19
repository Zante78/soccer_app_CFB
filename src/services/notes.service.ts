import { supabase, handleDatabaseError } from './database';
import { Note } from '../types/core/notes';

export class NotesService {
  private static instance: NotesService;
  
  private constructor() {}

  public static getInstance(): NotesService {
    if (!NotesService.instance) {
      NotesService.instance = new NotesService();
    }
    return NotesService.instance;
  }

  async getPlayerNotes(playerId: string): Promise<Note[]> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('player_id', playerId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async createNote(note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<Note> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{
          player_id: note.playerId,
          author_id: note.authorId,
          content: note.content,
          category: note.category,
          date: note.date,
          tags: note.tags || []
        }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    try {
      const { data, error } = await supabase
        .from('notes')
        .update({
          content: updates.content,
          category: updates.category,
          date: updates.date,
          tags: updates.tags || []
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      throw handleDatabaseError(err);
    }
  }
}