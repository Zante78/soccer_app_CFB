```tsx
import React from 'react';
import { Note } from '../../types/statistics';
import { Filter, Tag, Calendar } from 'lucide-react';

interface NotesFilterProps {
  selectedCategory: Note['category'] | 'all';
  selectedTags: string[];
  dateRange: {
    start: string;
    end: string;
  };
  onCategoryChange: (category: Note['category'] | 'all') => void;
  onTagSelect: (tag: string) => void;
  onDateRangeChange: (range: { start: string; end: string }) => void;
  availableTags: string[];
}

export function NotesFilter({
  selectedCategory,
  selectedTags,
  dateRange,
  onCategoryChange,
  onTagSelect,
  onDateRangeChange,
  availableTags
}: NotesFilterProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Filter className="w-4 h-4 inline mr-1" />
            Kategorie
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as Note['category'] | 'all')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          >
            <option value="all">Alle Kategorien</option>
            <option value="general">Allgemein</option>
            <option value="performance">Leistung</option>
            <option value="tactical">Taktisch</option>
            <option value="medical">Medizinisch</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Tag className="w-4 h-4 inline mr-1" />
            Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => onTagSelect(tag)}
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Calendar className="w-4 h-4 inline mr-1" />
            Zeitraum
          </label>
          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => onDateRangeChange({ ...dateRange, start: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
            <span className="text-gray-500">bis</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => onDateRangeChange({ ...dateRange, end: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
```