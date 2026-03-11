import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { FileText, Download, CheckCircle, XCircle } from "lucide-react";

type DocumentViewerProps = {
  photoUrl: string | null;
  consentFlags: Record<string, any>;
  documentUrls?: string[];
};

const consentLabels: Record<string, string> = {
  data_protection: "Datenschutzerklärung",
  photo_consent: "Fotoerlaubnis",
  medical_consent: "Medizinische Einwilligung",
  terms_accepted: "AGB akzeptiert",
};

export function DocumentViewer({
  photoUrl,
  consentFlags,
  documentUrls = [],
}: DocumentViewerProps) {
  return (
    <div className="space-y-6">
      {/* Spielerfoto */}
      {photoUrl ? (
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Spielerfoto
          </h4>
          <div className="relative w-full max-w-sm mx-auto aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
            <Image
              src={photoUrl}
              alt="Spielerfoto"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 384px"
            />
          </div>
          <div className="mt-4 flex justify-center">
            <a
              href={photoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#0055A4] hover:underline"
            >
              <Download className="h-4 w-4" />
              Foto herunterladen
            </a>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Spielerfoto
          </h4>
          <div className="flex flex-col items-center justify-center py-12 text-gray-600">
            <FileText className="h-12 w-12 mb-2" />
            <p className="text-sm">Kein Foto vorhanden</p>
          </div>
        </Card>
      )}

      {/* Einwilligungen */}
      <Card className="p-6">
        <h4 className="text-sm font-semibold text-gray-900 mb-4">
          Einwilligungen
        </h4>
        <div className="space-y-3">
          {Object.entries(consentLabels).map(([key, label]) => {
            const isGranted = consentFlags[key] === true;
            return (
              <div
                key={key}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-sm text-gray-700">{label}</span>
                {isGranted ? (
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Erteilt
                  </Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200">
                    <XCircle className="h-3 w-3 mr-1" />
                    Nicht erteilt
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Weitere Dokumente */}
      {documentUrls.length > 0 && (
        <Card className="p-6">
          <h4 className="text-sm font-semibold text-gray-900 mb-4">
            Weitere Dokumente
          </h4>
          <div className="space-y-2">
            {documentUrls.map((url, index) => (
              <a
                key={index}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <FileText className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-700 flex-1">
                  Dokument {index + 1}
                </span>
                <Download className="h-4 w-4 text-gray-400" />
              </a>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
