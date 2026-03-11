'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Step1WelcomeProps {
  onNext: () => void;
}

export function Step1Welcome({ onNext }: Step1WelcomeProps) {
  return (
    <Card>
      <div className="text-center space-y-6">
        {/* Logo/Icon placeholder */}
        <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Willkommen zur digitalen Passstelle
          </h1>
          <p className="text-lg text-gray-600">
            CfB Ford Niehl e.V.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-4 text-left bg-gray-50 p-6 rounded-xl">
          <p className="text-gray-700">
            Mit diesem digitalen Assistenten können Sie schnell und einfach einen
            Spielerpass-Antrag für den DFBnet einreichen.
          </p>

          <div className="space-y-2">
            <p className="font-medium text-gray-900">Was Sie benötigen:</p>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Spielerdaten (Name, Geburtsdatum)
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Passfoto & Ausweiskopie
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-success mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Ca. 5-10 Minuten Zeit
              </li>
            </ul>
          </div>
        </div>

        {/* Demo Badge */}
        <div className="inline-flex items-center px-4 py-2 bg-warning/10 text-amber-800 rounded-full text-sm font-medium">
          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Demo-Modus
        </div>

        {/* Start Button */}
        <Button onClick={onNext} className="w-full btn-primary text-lg py-4">
          Registrierung starten
        </Button>

        {/* Footer */}
        <p className="text-xs text-gray-600">
          Ihre Daten werden verschlüsselt und DSGVO-konform verarbeitet
        </p>
      </div>
    </Card>
  );
}
