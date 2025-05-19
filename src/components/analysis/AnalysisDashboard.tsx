import React, { useEffect, useState } from 'react';
import { AnalysisService } from '../../services/analysis.service';
import { PerformanceTrend, PlayerStatistics } from '../../types/core/analysis';
import { Line } from 'react-chartjs-2';
import { DatabaseConnectionError } from '../common/DatabaseConnectionError';
import { Loader, TrendingUp, Target, Award } from 'lucide-react';

interface AnalysisDashboardProps {
  playerId: string;
}

export function AnalysisDashboard({ playerId }: AnalysisDashboardProps) {
  const [performanceTrend, setPerformanceTrend] = useState<PerformanceTrend[]>([]);
  const [statistics, setStatistics] = useState<PlayerStatistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMetric, setSelectedMetric] = useState('overall');
  const [timeRange, setTimeRange] = useState(30); // Tage

  const analysisService = AnalysisService.getInstance();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [trendData, statsData] = await Promise.all([
          analysisService.getPerformanceTrend(playerId, selectedMetric, timeRange),
          analysisService.getPlayerStatistics(playerId)
        ]);

        setPerformanceTrend(trendData);
        setStatistics(statsData);
      } catch (err) {
        if (err instanceof Error && err.message.includes('Failed to fetch')) {
          return; // Wird von DatabaseConnectionError behandelt
        }
        setError(err instanceof Error ? err.message : 'Fehler beim Laden der Analysedaten');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [playerId, selectedMetric, timeRange]);

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

  const trendData = {
    labels: performanceTrend.map(t => new Date(t.date).toLocaleDateString()),
    datasets: [{
      label: 'Entwicklung',
      data: performanceTrend.map(t => t.value),
      borderColor: 'rgb(59, 130, 246)',
      tension: 0.3
    }]
  };

  const getStatColor = (value: number) => {
    if (value >= 15) return 'text-green-600';
    if (value >= 10) return 'text-blue-600';
    if (value >= 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Metriken-Übersicht */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statistics.slice(0, 3).map(stat => (
          <div key={stat.metricName} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-500">{stat.metricName}</h3>
              {stat.trend > 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingUp className="w-5 h-5 text-red-500 transform rotate-180" />
              )}
            </div>
            <div className="flex items-baseline">
              <p className={`text-2xl font-semibold ${getStatColor(stat.avgValue)}`}>
                {stat.avgValue.toFixed(1)}
              </p>
              <p className={`ml-2 text-sm ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Trend-Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Entwicklung</h3>
            <p className="text-sm text-gray-500">Verlauf der letzten {timeRange} Tage</p>
          </div>
          <div className="flex gap-4">
            <select
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="overall">Gesamtbewertung</option>
              <option value="technical">Technische Fähigkeiten</option>
              <option value="physical">Körperliche Fähigkeiten</option>
              <option value="mental">Mentale Stärke</option>
            </select>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(Number(e.target.value))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value={7}>7 Tage</option>
              <option value={30}>30 Tage</option>
              <option value={90}>90 Tage</option>
            </select>
          </div>
        </div>
        <Line 
          data={trendData}
          options={{
            responsive: true,
            plugins: {
              legend: {
                display: false
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 20
              }
            }
          }}
        />
      </div>

      {/* Detaillierte Statistiken */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Detaillierte Statistiken</h3>
        </div>
        <div className="divide-y divide-gray-200">
          {statistics.map(stat => (
            <div key={stat.metricName} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">{stat.metricName}</p>
                <p className="text-xs text-gray-500">
                  Min: {stat.minValue.toFixed(1)} | Max: {stat.maxValue.toFixed(1)}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <p className={`text-lg font-semibold ${getStatColor(stat.avgValue)}`}>
                  {stat.avgValue.toFixed(1)}
                </p>
                <p className={`text-sm ${stat.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trend > 0 ? '+' : ''}{stat.trend.toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}