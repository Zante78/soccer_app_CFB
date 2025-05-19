import React from 'react';
import { Note } from '../../types/statistics';
import { NoteListItem } from './NoteListItem';

interface NoteListProps {
  notes: Note[];
  onDelete?: (id: string) => void;
}

export function NoteList({ notes, onDelete }: NoteListProps) {
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedNotes.map(note => (
        <NoteListItem 
          key={note.id} 
          note={note}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}