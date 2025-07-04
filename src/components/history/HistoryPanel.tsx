import React, { useState, useEffect } from 'react';
import { useHistory } from '../../hooks/useHistory';
import { Line } from 'react-chartjs-2';
import { DatabaseConnectionError } from '../common/DatabaseConnectionError';
import { Loader, Calendar, BarChart2, List } from 'lucide-react';
import { ProgressionTable } from './ProgressionTable';

interface HistoryPanelProps {
  playerId: string;
}

export function HistoryPanel({ playerId }: HistoryPanelProps) {
  const [selectedType, setSelectedType] = useState<'evaluation' | 'statistics' | 'medical'>('evaluation');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const { history, loading, error, loadHistory } = useHistory(playerId);

  useEffect(() => {
    loadHistory({
      type: selectedType,
      startDate: dateRange.startDate,
      endDate: dateRange.endDate
    });
  }, [playerId, selectedType, dateRange, loadHistory]);

  if (error?.includes('Failed to fetch')) {
    return <DatabaseConnectionError />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  const chartData = {
    labels: history.map(h => new Date(h.date).toLocaleDateString()),
    datasets: [{
      label: selectedType === 'evaluation' ? 'Gesamtbewertung' :
             selectedType === 'statistics' ? 'Spielminuten' : 'Fitness',
      data: history.map(h => {
        if (selectedType === 'evaluation') return h.data.overallRating;
        if (selectedType === 'statistics') return h.data.minutesPlayed;
        return h.data.fitnessLevel;
      }),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.3
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="evaluation">Bewertungen</option>
            <option value="statistics">Statistiken</option>
            <option value="medical">Medizinisch</option>
          </select>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            <span className="text-gray-500">bis</span>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex bg-gray-100 rounded-md p-1">
          <button
            onClick={() => setViewMode('chart')}
            className={`p-2 rounded-md ${viewMode === 'chart' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Diagramm-Ansicht"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-md ${viewMode === 'table' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            title="Tabellen-Ansicht"
          >
            <List className="w-5 h-5" />
          </button>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-12">
          Keine Verlaufsdaten für den ausgewählten Zeitraum verfügbar
        </div>
      ) : viewMode === 'chart' ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <Line 
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
                title: {
                  display: true,
                  text: 'Entwicklung über Zeit'
                }
              },
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }}
          />
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
          <ProgressionTable history={history} type={selectedType} />
        </div>
      )}
    </div>
  );
}