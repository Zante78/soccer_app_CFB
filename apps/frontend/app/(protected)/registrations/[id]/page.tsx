import { getRegistrationDetails } from "./actions";
import { StatusBadge } from "@/components/admin/status-badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlayerDataDisplay } from "@/components/admin/player-data-display";
import { EligibilityTimeline } from "@/components/admin/eligibility-timeline";
import { AuditLogTimeline } from "@/components/admin/audit-log-timeline";
import { DocumentViewer } from "@/components/admin/document-viewer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileDown } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { PDFExportButton } from "./pdf-export-button";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function RegistrationDetailPage({ params }: PageProps) {
  const { id } = await params;
  const { registration, eligibility, photoUrl, documentUrls } =
    await getRegistrationDetails(id);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/registrations"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Übersicht
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {registration.player_name}
            </h1>
            <p className="text-gray-600 mt-2">
              {registration.team?.name || "Kein Team zugeordnet"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={registration.status} />
            {registration.finance_status?.is_paid ? (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Bezahlt
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                <XCircle className="h-3 w-3 mr-1" />
                Offen
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="eligibility">Sperrfrist</TabsTrigger>
              <TabsTrigger value="documents">Dokumente</TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <PlayerDataDisplay registration={registration} />
            </TabsContent>

            <TabsContent value="eligibility">
              <EligibilityTimeline result={eligibility} />
            </TabsContent>

            <TabsContent value="documents">
              <DocumentViewer
                photoUrl={photoUrl}
                consentFlags={registration.consent_flags}
                documentUrls={documentUrls}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Audit Log */}
          <AuditLogTimeline logs={registration.audit_logs} />

          {/* Actions */}
          <Card className="p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Aktionen
            </h3>
            <div className="space-y-2">
              <PDFExportButton registration={registration} />
              {/* Weitere Actions hier später */}
            </div>
          </Card>

          {/* RPA Traces (falls vorhanden) */}
          {registration.rpa_traces.length > 0 && (
            <Card className="p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">
                Bot Ausführungen
              </h3>
              <div className="space-y-3">
                {registration.rpa_traces.slice(0, 3).map((trace) => (
                  <div
                    key={trace.id}
                    className="text-sm border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {typeof trace.status === 'string'
                          ? trace.status
                          : (trace.status as any)?.status || 'UNKNOWN'}
                      </span>
                      {trace.visual_diff_score !== null && (
                        <span className="text-xs text-gray-500">
                          Diff: {(trace.visual_diff_score * 100).toFixed(2)}%
                        </span>
                      )}
                    </div>
                    {trace.error_message && (
                      <p className="text-xs text-red-600 mt-1">
                        {trace.error_message}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
