export interface Note {
  id: string;
  playerId: string;
  authorId: string;
  date: string;
  content: string;
  category: NoteCategory;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export type NoteCategory = 
  | 'general'
  | 'performance'
  | 'tactical'
  | 'technical'
  | 'physical'
  | 'medical'
  | 'disciplinary'
  | 'development';