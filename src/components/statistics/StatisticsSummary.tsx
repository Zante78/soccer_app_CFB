import React from 'react';
import { GameStatistics } from '../../types/statistics';
import { Trophy, Clock, Award } from 'lucide-react';

interface StatisticsSummaryProps {
  statistics: GameStatistics[];
}

export function StatisticsSummary({ statistics }: StatisticsSummaryProps) {
  const totalStats = statistics.reduce(
    (acc, stat) => ({
      games: acc.games + 1,
      minutes: acc.minutes + stat.minutesPlayed,
      goals: acc.goals + stat.goals,
      assists: acc.assists + stat.assists,
    }),
    { games: 0, minutes: 0, goals: 0, assists: 0 }
  );

  const cards = statistics.reduce(
    (acc, stat) => ({
      yellow: acc.yellow + stat.yellowCards,
      red: acc.red + stat.redCards,
    }),
    { yellow: 0, red: 0 }
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <Trophy className="w-5 h-5" />
          <span className="text-sm">Spiele</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{totalStats.games}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <Clock className="w-5 h-5" />
          <span className="text-sm">Spielminuten</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{totalStats.minutes}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <Award className="w-5 h-5" />
          <span className="text-sm">Tore</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{totalStats.goals}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <Award className="w-5 h-5" />
          <span className="text-sm">Assists</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{totalStats.assists}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <span className="w-5 h-5 flex items-center justify-center text-yellow-500">⚠</span>
          <span className="text-sm">Gelbe Karten</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{cards.yellow}</div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2 text-gray-600 mb-1">
          <span className="w-5 h-5 flex items-center justify-center text-red-500">⚠</span>
          <span className="text-sm">Rote Karten</span>
        </div>
        <div className="text-2xl font-bold text-gray-900">{cards.red}</div>
      </div>
    </div>
  );
}