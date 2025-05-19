import React from 'react';
import { LayoutGrid, Rows, Columns, Layout } from 'lucide-react';

type ViewMode = 'tabs' | 'expanded' | 'split' | 'dashboard';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ currentMode, onModeChange }: ViewModeSelectorProps) {
  return (
    <div className="flex gap-2 p-2 bg-white rounded-lg shadow">
      <button
        onClick={() => onModeChange('tabs')}
        className={`p-2 rounded ${currentMode === 'tabs' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
        title="Tabs Ansicht"
      >
        <Layout className="w-5 h-5" />
      </button>
      <button
        onClick={() => onModeChange('expanded')}
        className={`p-2 rounded ${currentMode === 'expanded' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
        title="Erweiterte Ansicht"
      >
        <Rows className="w-5 h-5" />
      </button>
      <button
        onClick={() => onModeChange('split')}
        className={`p-2 rounded ${currentMode === 'split' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
        title="Geteilte Ansicht"
      >
        <Columns className="w-5 h-5" />
      </button>
      <button
        onClick={() => onModeChange('dashboard')}
        className={`p-2 rounded ${currentMode === 'dashboard' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 hover:bg-gray-100'}`}
        title="Dashboard Ansicht"
      >
        <LayoutGrid className="w-5 h-5" />
      </button>
    </div>
  );
}