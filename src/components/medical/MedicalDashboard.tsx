import React, { useState, useEffect } from 'react';
import { Injury, MedicalCheckup } from '../../types/core/medical';
import { InjuryForm } from './InjuryForm';
import { InjuryList } from './InjuryList';
import { MedicalCheckupForm } from './MedicalCheckupForm';
import { Plus, Activity, AlertTriangle } from 'lucide-react';
import { DatabaseConnectionError } from '../common/DatabaseConnectionError';
import { Loader } from 'lucide-react';

interface MedicalDashboardProps {
  playerId: string;
}

export function MedicalDashboard({ playerId }: MedicalDashboardProps) {
  const [injuries, setInjuries] = useState<Injury[]>([]);
  const [checkups, setCheckups] = useState<MedicalCheckup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInjuryForm, setShowInjuryForm] = useState(false);
  const [showCheckupForm, setShowCheckupForm] = useState(false);

  useEffect(() => {
    loadMedicalData();
  }, [playerId]);

  const loadMedicalData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: injuriesData, error: injuriesError } = await supabase
        .from('injuries')
        .select('*')
        .eq('player_id', playerId)
        .order('start_date', { ascending: false });

      const { data: checkupsData, error: checkupsError } = await supabase
        .from('medical_checkups')
        .select('*')
        .eq('player_id', playerId)
        .order('date', { ascending: false });

      if (injuriesError) throw injuriesError;
      if (checkupsError) throw checkupsError;

      setInjuries(injuriesData || []);
      setCheckups(checkupsData || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load medical data');
    } finally {
      setLoading(false);
    }
  };

  const handleInjuryStatusChange = async (id: string, status: Injury['status']) => {
    try {
      const { error } = await supabase
        .from('injuries')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      await loadMedicalData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update injury status');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header with action buttons */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Medizinische Übersicht</h2>
        <div className="flex gap-4">
          <button
            onClick={() => setShowInjuryForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
          >
            <AlertTriangle className="w-4 h-4" />
            Verletzung melden
          </button>
          <button
            onClick={() => setShowCheckupForm(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
          >
            <Activity className="w-4 h-4" />
            Untersuchung eintragen
          </button>
        </div>
      </div>

      {/* Medical Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Aktuelle Verletzungen</h3>
          <div className="text-3xl font-bold text-red-600">
            {injuries.filter(i => i.status === 'active').length}
          </div>
          <p className="text-sm text-gray-500 mt-1">Aktive Verletzungen</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Letzte Untersuchung</h3>
          {checkups.length > 0 ? (
            <>
              <div className="text-lg font-medium text-gray-900">
                {new Date(checkups[0].date).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">{checkups[0].type}</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Keine Untersuchungen vorhanden</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Nächste Untersuchung</h3>
          {checkups.length > 0 && checkups[0].nextCheckupDate ? (
            <>
              <div className="text-lg font-medium text-gray-900">
                {new Date(checkups[0].nextCheckupDate).toLocaleDateString()}
              </div>
              <p className="text-sm text-gray-500 mt-1">Geplante Untersuchung</p>
            </>
          ) : (
            <p className="text-sm text-gray-500">Keine Untersuchung geplant</p>
          )}
        </div>
      </div>

      {/* Injury List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Verletzungshistorie</h3>
          <InjuryList
            injuries={injuries}
            onStatusChange={handleInjuryStatusChange}
          />
        </div>
      </div>

      {/* Medical Checkups */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Untersuchungen</h3>
          <div className="space-y-4">
            {checkups.map(checkup => (
              <div key={checkup.id} className="border-b border-gray-200 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">
                      {new Date(checkup.date).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{checkup.type}</p>
                  </div>
                  {checkup.nextCheckupDate && (
                    <div className="text-sm text-gray-500">
                      Nächste Untersuchung: {new Date(checkup.nextCheckupDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {checkup.findings && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">{checkup.findings}</p>
                  </div>
                )}
                {checkup.recommendations && (
                  <div className="mt-2">
                    <p className="text-sm text-blue-600">{checkup.recommendations}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Forms */}
      {showInjuryForm && (
        <InjuryForm
          onSave={async (injury) => {
            try {
              const { error } = await supabase
                .from('injuries')
                .insert([{
                  ...injury,
                  player_id: playerId,
                  medical_staff_id: 'current-user-id' // TODO: Replace with actual user ID
                }]);

              if (error) throw error;
              await loadMedicalData();
              setShowInjuryForm(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to save injury');
            }
          }}
          onCancel={() => setShowInjuryForm(false)}
        />
      )}

      {showCheckupForm && (
        <MedicalCheckupForm
          onSave={async (checkup) => {
            try {
              const { error } = await supabase
                .from('medical_checkups')
                .insert([{
                  ...checkup,
                  player_id: playerId,
                  medical_staff_id: 'current-user-id' // TODO: Replace with actual user ID
                }]);

              if (error) throw error;
              await loadMedicalData();
              setShowCheckupForm(false);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Failed to save checkup');
            }
          }}
          onCancel={() => setShowCheckupForm(false)}
        />
      )}
    </div>
  );
}