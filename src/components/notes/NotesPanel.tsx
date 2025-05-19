import React, { useState } from 'react';
import { useTranslation } from '../../i18n/hooks/useTranslation';
import { Note } from '../../types/statistics';
import { NoteForm } from './NoteForm';
import { 
  PenSquare, 
  Notebook, 
  X, 
  Clock, 
  Search, 
  Calendar, 
  Stethoscope, 
  Trophy, 
  Target, 
  MessageSquare 
} from 'lucide-react';

interface NotesPanelProps {
  notes: Note[];
  onAddNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteNote?: (id: string) => void;
  onClose?: () => void;
}

export default function NotesPanel({ notes, onAddNote, onDeleteNote, onClose }: NotesPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categoryIcons = {
    general: <MessageSquare className="w-4 h-4" />,
    performance: <Trophy className="w-4 h-4" />,
    tactical: <Target className="w-4 h-4" />,
    medical: <Stethoscope className="w-4 h-4" />
  };

  const categoryColors = {
    general: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    performance: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    tactical: 'bg-green-100 text-green-800 hover:bg-green-200',
    medical: 'bg-red-100 text-red-800 hover:bg-red-200'
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const filteredNotes = notes.filter(note => {
    const matchesCategory = !selectedCategory || note.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const groupedNotes = filteredNotes.reduce((groups, note) => {
    const date = new Date(note.date).toLocaleDateString();
    return {
      ...groups,
      [date]: [...(groups[date] || []), note]
    };
  }, {} as Record<string, Note[]>);

  const handleAddNote = async (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await onAddNote(note);
      setShowForm(false);
    } catch (error) {
      console.error('Error adding note:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Notebook className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Notizen</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* Add Note Button */}
          <div className="relative group/add">
            <button
              onClick={() => setShowForm(true)}
              className="p-2 text-blue-600 hover:text-blue-700 rounded-full transition-colors duration-200"
            >
              <PenSquare className="w-5 h-5" />
            </button>
            <span className="invisible opacity-0 absolute pointer-events-none text-gray-900 text-xs py-1 px-2 whitespace-nowrap left-1/2 -translate-x-1/2 top-full mt-1 transition-opacity duration-200 group-hover/add:visible group-hover/add:opacity-100">
              Neue Notiz erstellen
            </span>
          </div>

          {/* Close Button */}
          {onClose && (
            <div className="relative group/close">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-full transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
              <span className="invisible opacity-0 absolute pointer-events-none text-gray-900 text-xs py-1 px-2 whitespace-nowrap left-1/2 -translate-x-1/2 top-full mt-1 transition-opacity duration-200 group-hover/close:visible group-hover/close:opacity-100">
                Schließen
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Notizen durchsuchen..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-2">
            {Object.entries(categoryColors).map(([category, colorClass]) => (
              <div key={category} className="relative group/category">
                <button
                  onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                  className={`p-2 rounded-lg transition-colors duration-200 hover:bg-opacity-80 ${
                    selectedCategory === category 
                      ? colorClass.split(' ')[0] + ' ' + colorClass.split(' ')[1]
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {categoryIcons[category as keyof typeof categoryIcons]}
                </button>
                <span className="invisible opacity-0 absolute pointer-events-none text-gray-900 text-xs py-1 px-2 whitespace-nowrap left-1/2 -translate-x-1/2 top-full mt-1 transition-opacity duration-200 group-hover/category:visible group-hover/category:opacity-100">
                  {category === 'general' && 'Allgemeine Notizen'}
                  {category === 'performance' && 'Leistungsnotizen'}
                  {category === 'tactical' && 'Taktische Notizen'}
                  {category === 'medical' && 'Medizinische Notizen'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notes List */}
      <div className="overflow-y-auto max-h-[calc(90vh-12rem)]">
        {Object.entries(groupedNotes).map(([date, dateNotes]) => (
          <div key={date} className="border-b border-gray-100 last:border-b-0">
            <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-4 py-2 border-b border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                {date}
              </div>
            </div>
            <div className="space-y-2 p-4">
              {dateNotes.map((note) => (
                <div 
                  key={note.id}
                  className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${categoryColors[note.category].split(' ').slice(0, 2).join(' ')}`}>
                        {categoryIcons[note.category as keyof typeof categoryIcons]}
                        <span className="ml-1">
                          {note.category === 'general' && 'Allgemein'}
                          {note.category === 'performance' && 'Leistung'}
                          {note.category === 'tactical' && 'Taktik'}
                          {note.category === 'medical' && 'Medizin'}
                        </span>
                      </span>
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(note.date)}
                      </span>
                    </div>
                    {onDeleteNote && (
                      <div className="relative group/delete">
                        <button
                          onClick={() => onDeleteNote(note.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded-full transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <span className="invisible opacity-0 absolute pointer-events-none text-gray-900 text-xs py-1 px-2 whitespace-nowrap right-0 top-full mt-1 transition-opacity duration-200 group-hover/delete:visible group-hover/delete:opacity-100">
                          Notiz löschen
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        
        {filteredNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 px-4 text-gray-500">
            <Notebook className="w-12 h-12 mb-4 text-gray-400" />
            {searchQuery || selectedCategory ? (
              <p>Keine Notizen gefunden</p>
            ) : (
              <p>Keine Notizen vorhanden</p>
            )}
          </div>
        )}
      </div>

      {/* Note Form Modal */}
      {showForm && (
        <NoteForm
          onSave={handleAddNote}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}