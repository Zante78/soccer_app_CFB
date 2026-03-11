'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// Zod Schema for validation
const playerDataSchema = z.object({
  first_name: z.string().min(2, 'Vorname muss mindestens 2 Zeichen lang sein'),
  last_name: z.string().min(2, 'Nachname muss mindestens 2 Zeichen lang sein'),
  birth_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datumsformat'),
  nationality: z.string().min(2, 'Bitte Nationalität angeben'),
  registration_number: z.string().optional(),
  team_id: z.string().min(1, 'Bitte Mannschaft auswählen'),
  previous_club: z.string().optional(),
  previous_team_deregistration_date: z.string().optional(),
  previous_team_last_game: z.string().optional(),
});

type PlayerDataForm = z.infer<typeof playerDataSchema>;

interface Step3PlayerDataProps {
  onNext: (data: PlayerDataForm) => void;
  onBack: () => void;
  initialData?: Partial<PlayerDataForm>;
}

export function Step3PlayerData({ onNext, onBack, initialData }: Step3PlayerDataProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PlayerDataForm>({
    resolver: zodResolver(playerDataSchema),
    defaultValues: initialData || {
      nationality: 'Deutschland',
    },
  });

  const watchPreviousClub = watch('previous_club');

  const onSubmit = (data: PlayerDataForm) => {
    onNext(data);
  };

  return (
    <Card>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Spielerdaten
          </h2>
          <p className="text-gray-600">
            Bitte geben Sie die persönlichen Daten des Spielers ein
          </p>
        </div>

        {/* Personal Data */}
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* First Name */}
            <div>
              <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                Vorname *
              </label>
              <input
                {...register('first_name')}
                type="text"
                id="first_name"
                className="input"
                placeholder="Max"
                aria-invalid={!!errors.first_name}
                aria-describedby={errors.first_name ? "error-first_name" : undefined}
              />
              {errors.first_name && (
                <p id="error-first_name" role="alert" className="text-sm text-error mt-1">{errors.first_name.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                Nachname *
              </label>
              <input
                {...register('last_name')}
                type="text"
                id="last_name"
                className="input"
                placeholder="Mustermann"
                aria-invalid={!!errors.last_name}
                aria-describedby={errors.last_name ? "error-last_name" : undefined}
              />
              {errors.last_name && (
                <p id="error-last_name" role="alert" className="text-sm text-error mt-1">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          {/* Birth Date */}
          <div>
            <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-1">
              Geburtsdatum *
            </label>
            <input
              {...register('birth_date')}
              type="date"
              id="birth_date"
              className="input"
              aria-invalid={!!errors.birth_date}
              aria-describedby={errors.birth_date ? "error-birth_date" : undefined}
            />
            {errors.birth_date && (
              <p id="error-birth_date" role="alert" className="text-sm text-error mt-1">{errors.birth_date.message}</p>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
              Nationalität *
            </label>
            <input
              {...register('nationality')}
              type="text"
              id="nationality"
              className="input"
              placeholder="Deutschland"
              aria-invalid={!!errors.nationality}
              aria-describedby={errors.nationality ? "error-nationality" : undefined}
            />
            {errors.nationality && (
              <p id="error-nationality" role="alert" className="text-sm text-error mt-1">{errors.nationality.message}</p>
            )}
          </div>

          {/* Registration Number */}
          <div>
            <label htmlFor="registration_number" className="block text-sm font-medium text-gray-700 mb-1">
              DFB-Registrierungsnummer (optional)
            </label>
            <input
              {...register('registration_number')}
              type="text"
              id="registration_number"
              className="input"
              placeholder="z.B. 12345678"
              aria-invalid={!!errors.registration_number}
              aria-describedby={errors.registration_number ? "error-registration_number" : undefined}
            />
            {errors.registration_number && (
              <p id="error-registration_number" role="alert" className="text-sm text-error mt-1">{errors.registration_number.message}</p>
            )}
          </div>

          {/* Team Selection */}
          <div>
            <label htmlFor="team_id" className="block text-sm font-medium text-gray-700 mb-1">
              Mannschaft *
            </label>
            <select
              {...register('team_id')}
              id="team_id"
              className="input"
              aria-invalid={!!errors.team_id}
              aria-describedby={errors.team_id ? "error-team_id" : undefined}
            >
              <option value="">Bitte wählen...</option>
              <option value="team-1-herren">1. Herren</option>
              <option value="team-2-herren">2. Herren</option>
              <option value="team-u19">U19</option>
              <option value="team-u17">U17</option>
              <option value="team-u15">U15</option>
              <option value="team-u13">U13</option>
              <option value="team-u11">U11</option>
              <option value="team-u9">U9</option>
            </select>
            {errors.team_id && (
              <p id="error-team_id" role="alert" className="text-sm text-error mt-1">{errors.team_id.message}</p>
            )}
          </div>
        </div>

        {/* Previous Club Section */}
        <div className="pt-4 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Vorheriger Verein (für Wechsler)
          </h3>

          <div className="space-y-4">
            {/* Previous Club */}
            <div>
              <label htmlFor="previous_club" className="block text-sm font-medium text-gray-700 mb-1">
                Vorheriger Verein (optional)
              </label>
              <input
                {...register('previous_club')}
                type="text"
                id="previous_club"
                className="input"
                placeholder="z.B. FC Köln"
              />
            </div>

            {watchPreviousClub && (
              <>
                {/* Deregistration Date */}
                <div>
                  <label htmlFor="previous_team_deregistration_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Abmeldedatum vom vorherigen Verein
                  </label>
                  <input
                    {...register('previous_team_deregistration_date')}
                    type="date"
                    id="previous_team_deregistration_date"
                    className="input"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Wichtig für die Berechnung der Sperrfrist
                  </p>
                </div>

                {/* Last Game Date */}
                <div>
                  <label htmlFor="previous_team_last_game" className="block text-sm font-medium text-gray-700 mb-1">
                    Datum des letzten Spiels
                  </label>
                  <input
                    {...register('previous_team_last_game')}
                    type="date"
                    id="previous_team_last_game"
                    className="input"
                  />
                  <p className="text-xs text-gray-600 mt-1">
                    Falls später als Abmeldedatum
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={onBack}
            className="flex-1"
          >
            Zurück
          </Button>
          <Button
            type="submit"
            className="flex-1"
          >
            Weiter
          </Button>
        </div>
      </form>
    </Card>
  );
}
