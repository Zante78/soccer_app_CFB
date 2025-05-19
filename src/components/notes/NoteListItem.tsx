```tsx
import React from 'react';
import { Note } from '../../types/statistics';
import { Trash2, Tag, Eye, EyeOff, Users } from 'lucide-react';
import { marked } from 'marked';

interface NoteListItemProps {
  note: Note;
  onDelete?: (id: string) => void;
}

export function NoteListItem({ note, onDelete }: NoteListItemProps) {
  const categoryColors = {
    general: 'bg-gray-100 text-gray-800',
    performance: 'bg-blue-100 text-blue-800',
    medical: 'bg-red-100 text-red-800',
    tactical: 'bg-green-100 text-green-800'
  };

  const visibilityIcon = {
    private: <EyeOff className="w-4 h-4" />,
    team: <Users className="w-4 h-4" />,
    all: <Eye className="w-4 h-4" />
  };

  const visibilityText = {
    private: 'Privat',
    team: 'Team',
    all: 'Alle'
  };

  // Convert markdown to HTML
  const contentHtml = marked(note.content);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[note.category]}`}>
            <Tag className="w-3 h-3 mr-1" />
            {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
          </span>
          <span className="text-sm text-gray-500">
            {new Date(note.date).toLocaleDateString()}
          </span>
          <span className="text-sm text-gray-500 flex items-center gap-1">
            {visibilityIcon[note.visibility]}
            {visibilityText[note.visibility]}
          </span>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(note.id)}
            className="text-gray-400 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="flex gap-1 flex-wrap mb-2">
          {note.tags.map(tag => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div 
        className="prose prose-sm max-w-none text-gray-700"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </div>
  );
}
```