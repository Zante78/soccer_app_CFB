import React, { useState } from 'react';
import { GameStatistics } from '../../types/statistics';
import { StatisticsSummary } from './StatisticsSummary';
import { StatisticsChart } from './StatisticsChart';
import { StatisticsForm } from './StatisticsForm';
import { Plus } from 'lucide-react';

interface StatisticsPanelProps {
  statistics: GameStatistics[];
  onAddStatistics: () => void;
}

export default function StatisticsPanel({ statistics, onAddStatistics }: StatisticsPanelProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<'goals' | 'assists' | 'minutesPlayed'>('minutesPlayed');

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <StatisticsSummary statistics={statistics} />

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as any)}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="minutesPlayed">Spielminuten</option>
            <option value="goals">Tore</option>
            <option value="assists">Assists</option>
          </select>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-5 h-5" />
            Neue Statistik
          </button>
        </div>

        <StatisticsChart 
          statistics={statistics} 
          metric={selectedMetric}
        />
      </div>

      {/* Statistics Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Datum
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Minuten
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tore
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assists
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Gelbe K.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rote K.
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statistics.map((stat) => (
              <tr key={stat.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(stat.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.minutesPlayed}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.goals}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.assists}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.yellowCards}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {stat.redCards}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Statistics Form Modal */}
      {showForm && (
        <StatisticsForm
          onSave={onAddStatistics}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}