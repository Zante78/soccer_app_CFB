'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Step7PaymentProps {
  onNext: (data: { payment_method: 'PAYPAL' | 'CASH'; payment_id?: string }) => void;
  onBack: () => void;
  registrationId: string;
}

export function Step7Payment({ onNext, onBack, registrationId }: Step7PaymentProps) {
  const [selectedMethod, setSelectedMethod] = useState<'PAYPAL' | 'CASH' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalPayment = async () => {
    setIsProcessing(true);

    // TODO: Integrate real PayPal SDK
    // For now, simulate payment
    setTimeout(() => {
      setIsProcessing(false);
      onNext({ payment_method: 'PAYPAL', payment_id: 'DEMO_PAYPAL_' + Date.now() });
    }, 2000);
  };

  const handleCashPayment = () => {
    onNext({ payment_method: 'CASH' });
  };

  // Generate QR code data for cash payment
  const qrCodeData = JSON.stringify({
    registration_id: registrationId,
    payment_method: 'CASH',
    amount: 25.0,
    timestamp: Date.now(),
  });

  return (
    <Card>
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Zahlung
          </h2>
          <p className="text-gray-600">
            Wählen Sie Ihre bevorzugte Zahlungsmethode
          </p>
        </div>

        {/* Price Info */}
        <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Bearbeitungsgebühr</p>
          <p className="text-4xl font-bold text-primary">25,00 €</p>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4" role="radiogroup" aria-label="Zahlungsmethode">
          {/* PayPal Option */}
          <button
            role="radio"
            aria-checked={selectedMethod === 'PAYPAL'}
            onClick={() => setSelectedMethod('PAYPAL')}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
              selectedMethod === 'PAYPAL'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Radio Button */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                    selectedMethod === 'PAYPAL'
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedMethod === 'PAYPAL' && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    PayPal
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sofortige Zahlung per PayPal
                  </p>
                </div>
              </div>

              {/* PayPal Logo */}
              <div className="text-4xl">💳</div>
            </div>

            {selectedMethod === 'PAYPAL' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={handlePayPalPayment}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Verarbeite Zahlung...
                    </div>
                  ) : (
                    'Jetzt mit PayPal bezahlen'
                  )}
                </Button>
                <p className="text-xs text-gray-600 text-center mt-2">
                  Sie werden zu PayPal weitergeleitet
                </p>
              </div>
            )}
          </button>

          {/* Cash Payment Option */}
          <button
            role="radio"
            aria-checked={selectedMethod === 'CASH'}
            onClick={() => setSelectedMethod('CASH')}
            className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
              selectedMethod === 'CASH'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {/* Radio Button */}
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 ${
                    selectedMethod === 'CASH'
                      ? 'border-primary bg-primary'
                      : 'border-gray-300'
                  }`}
                >
                  {selectedMethod === 'CASH' && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Barzahlung
                  </h3>
                  <p className="text-sm text-gray-600">
                    Zahlung beim Trainer mit QR-Code
                  </p>
                </div>
              </div>

              {/* Cash Icon */}
              <div className="text-4xl">💵</div>
            </div>

            {selectedMethod === 'CASH' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="bg-white p-4 rounded-lg text-center">
                  <p className="text-sm text-gray-700 mb-4">
                    Zeigen Sie diesen QR-Code Ihrem Trainer nach der Zahlung:
                  </p>
                  <div className="inline-block p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <QRCodeSVG value={qrCodeData} size={200} level="H" />
                  </div>
                  <p className="text-xs text-gray-600 mt-4">
                    Der Trainer scannt den Code zur Bestätigung der Barzahlung
                  </p>
                </div>

                <Button
                  onClick={handleCashPayment}
                  className="w-full mt-4"
                >
                  Weiter mit Barzahlung
                </Button>
              </div>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Hinweis zur Zahlung</p>
              <p>
                Die Bearbeitungsgebühr von 25,00 € deckt die administrativen Kosten
                für die Passbeantragung beim DFBnet. Nach erfolgreicher Zahlung wird
                Ihr Antrag automatisch verarbeitet.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-4 pt-4">
          <Button
            variant="secondary"
            onClick={onBack}
            className="flex-1"
            disabled={isProcessing}
          >
            Zurück
          </Button>
        </div>
      </div>
    </Card>
  );
}
