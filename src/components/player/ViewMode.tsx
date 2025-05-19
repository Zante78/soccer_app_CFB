import React, { useState, useRef, useEffect } from 'react';
import { Layout, LayoutTemplate, Monitor, LayoutDashboard } from 'lucide-react';

export type ViewMode = 'tabs' | 'expanded' | 'split' | 'dashboard';

interface ViewModeSelectorProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export function ViewModeSelector({ currentMode, onModeChange }: ViewModeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (mode: ViewMode) => {
    switch (mode) {
      case 'tabs': return <Layout className="w-4 h-4" />;
      case 'expanded': return <LayoutTemplate className="w-4 h-4" />;
      case 'split': return <Monitor className="w-4 h-4" />;
      case 'dashboard': return <LayoutDashboard className="w-4 h-4" />;
    }
  };

  const getModeName = (mode: ViewMode) => {
    switch (mode) {
      case 'tabs': return 'Tabs Ansicht';
      case 'expanded': return 'Erweiterte Ansicht';
      case 'split': return 'Geteilte Ansicht';
      case 'dashboard': return 'Dashboard Ansicht';
    }
  };

  return (
    <div ref={dropdownRef} className="absolute top-2 left-2 z-10">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white/95 transition-all duration-200 group"
        title="Ansicht wechseln"
      >
        <Layout className="w-5 h-5 text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg py-1 border border-gray-100 min-w-[180px]">
          {(['tabs', 'expanded', 'split', 'dashboard'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={(e) => {
                e.stopPropagation();
                onModeChange(mode);
                setIsOpen(false);
              }}
              className={`w-full px-3 py-2 flex items-center gap-2 text-sm transition-colors ${
                currentMode === mode 
                  ? 'bg-blue-50 text-blue-600' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {getIcon(mode)}
              <span>{getModeName(mode)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}