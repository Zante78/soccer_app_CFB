import React from 'react';
import { PlayerHistory } from '../../types/statistics';

interface ProgressionTableProps {
  history: PlayerHistory[];
  type: 'evaluation' | 'statistics' | 'medical';
}

export function ProgressionTable({ history, type }: ProgressionTableProps) {
  // Sort history by date (newest first)
  const sortedHistory = [...history].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Get appropriate headers based on history type
  const getHeaders = () => {
    if (type === 'evaluation') {
      return (
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bewertung</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kontext</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bewerter</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notizen</th>
        </tr>
      );
    } else if (type === 'statistics') {
      return (
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minuten</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tore</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vorlagen</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gegner</th>
        </tr>
      );
    } else {
      return (
        <tr>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fitness</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notizen</th>
        </tr>
      );
    }
  };

  // Get appropriate row data based on history type
  const getRowData = (item: PlayerHistory, index: number) => {
    if (type === 'evaluation') {
      return (
        <tr key={index} className="hover:bg-gray-50">
          <td className="px-4 py-2 text-sm">{new Date(item.date).toLocaleDateString()}</td>
          <td className="px-4 py-2 text-sm font-medium">
            <span className={getValueColor(item.data.overallRating)}>
              {item.data.overallRating}
            </span>
          </td>
          <td className="px-4 py-2 text-sm">{item.data.context || '-'}</td>
          <td className="px-4 py-2 text-sm">{item.data.evaluatorName || '-'}</td>
          <td className="px-4 py-2 text-sm">{item.data.notes || '-'}</td>
        </tr>
      );
    } else if (type === 'statistics') {
      return (
        <tr key={index} className="hover:bg-gray-50">
          <td className="px-4 py-2 text-sm">{new Date(item.date).toLocaleDateString()}</td>
          <td className="px-4 py-2 text-sm font-medium">
            <span className={getValueColor(item.data.minutesPlayed)}>
              {item.data.minutesPlayed}
            </span>
          </td>
          <td className="px-4 py-2 text-sm">{item.data.goals || 0}</td>
          <td className="px-4 py-2 text-sm">{item.data.assists || 0}</td>
          <td className="px-4 py-2 text-sm">{item.data.opponent || '-'}</td>
        </tr>
      );
    } else {
      return (
        <tr key={index} className="hover:bg-gray-50">
          <td className="px-4 py-2 text-sm">{new Date(item.date).toLocaleDateString()}</td>
          <td className="px-4 py-2 text-sm font-medium">
            <span className={getValueColor(item.data.fitnessLevel)}>
              {item.data.fitnessLevel}
            </span>
          </td>
          <td className="px-4 py-2 text-sm">{item.data.status || '-'}</td>
          <td className="px-4 py-2 text-sm">{item.data.notes || '-'}</td>
        </tr>
      );
    }
  };

  // Function to get appropriate color based on value
  const getValueColor = (value: number) => {
    if (type === 'evaluation') {
      if (value >= 16) return 'text-green-600';
      if (value >= 12) return 'text-blue-600';
      if (value >= 8) return 'text-yellow-600';
      return 'text-red-600';
    } else if (type === 'statistics') {
      if (value >= 80) return 'text-green-600';
      if (value >= 45) return 'text-blue-600';
      if (value >= 20) return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (value >= 8) return 'text-green-600';
      if (value >= 6) return 'text-blue-600';
      if (value >= 4) return 'text-yellow-600';
      return 'text-red-600';
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {getHeaders()}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedHistory.map((item, index) => getRowData(item, index))}
        </tbody>
      </table>
    </div>
  );
}