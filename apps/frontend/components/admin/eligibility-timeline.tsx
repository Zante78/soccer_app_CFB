import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";
import type { EligibilityResult } from "@packages/shared-types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type EligibilityTimelineProps = {
  result: EligibilityResult;
};

export function EligibilityTimeline({ result }: EligibilityTimelineProps) {
  const isEligible = result.is_eligible;
  const hasBlockingPeriod = result.sperrfrist_days && result.sperrfrist_days > 0;

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Status Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Spielberechtigung
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Berechnung nach {result.calculation_type === "senior" ? "§ 16 SpO (Senior)" : "§ 20 JSpO (Junior)"}
            </p>
          </div>
          {isEligible ? (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Spielberechtigt
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              <XCircle className="h-3 w-3 mr-1" />
              Gesperrt
            </Badge>
          )}
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          {/* Sperrfrist Start */}
          {result.sperrfrist_start && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-gray-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Sperrfrist Beginn
                </p>
                <p className="text-sm text-gray-600">
                  {format(new Date(result.sperrfrist_start), "dd. MMMM yyyy", {
                    locale: de,
                  })}
                </p>
                {result.reason && (
                  <p className="text-xs text-gray-500 mt-1">{result.reason}</p>
                )}
              </div>
            </div>
          )}

          {/* Blocking Period */}
          {hasBlockingPeriod && (
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Gesperrt für
                </p>
                <p className="text-sm text-gray-600">
                  {result.sperrfrist_days} Tage
                  {result.sperrfrist_months && ` (${result.sperrfrist_months} Monate)`}
                </p>
              </div>
            </div>
          )}

          {/* Eligibility Date */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-1">
              <div
                className={`h-8 w-8 rounded-full flex items-center justify-center ${
                  isEligible
                    ? "bg-green-100"
                    : "bg-red-100"
                }`}
              >
                {isEligible ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Spielberechtigt ab
              </p>
              <p className="text-sm text-gray-600">
                {result.eligibility_date
                  ? format(new Date(result.eligibility_date), "dd. MMMM yyyy", {
                      locale: de,
                    })
                  : "Sofort"}
              </p>
              {result.days_until_eligible !== undefined &&
                result.days_until_eligible > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Noch {result.days_until_eligible} Tage bis zur Spielberechtigung
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* Age Class Info (für Junior) */}
        {result.calculation_type === "junior" && result.age_class && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Altersklasse:</span> {result.age_class}
            </p>
          </div>
        )}

        {/* Warnings */}
        {result.warnings && result.warnings.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-900">
                    Hinweise
                  </p>
                  <ul className="text-sm text-yellow-800 mt-1 space-y-1">
                    {result.warnings.map((warning, index) => (
                      <li key={index}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
