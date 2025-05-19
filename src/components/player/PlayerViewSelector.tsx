import React from 'react';
import { LayoutGrid, LayoutList, Rows, Table } from 'lucide-react';

export type ViewMode = 'large-grid' | 'small-grid' | 'list' | 'detail-list';

interface PlayerViewSelectorProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export function PlayerViewSelector({ currentView, onViewChange }: PlayerViewSelectorProps) {
  const views: { mode: ViewMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'large-grid', icon: <LayoutGrid className="w-4 h-4" />, label: 'Große Kacheln' },
    { mode: 'small-grid', icon: <Rows className="w-4 h-4" />, label: 'Kleine Kacheln' },
    { mode: 'list', icon: <LayoutList className="w-4 h-4" />, label: 'Liste' },
    { mode: 'detail-list', icon: <Table className="w-4 h-4" />, label: 'Detaillierte Liste' }
  ];

  return (
    <div className="flex gap-2">
      {views.map(({ mode, icon, label }) => (
        <button
          key={mode}
          onClick={() => onViewChange(mode)}
          className={`p-2 rounded-md flex items-center gap-2 ${
            currentView === mode
              ? 'bg-blue-100 text-blue-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
          title={label}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}