"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { RegistrationDetail } from "./types";

type PDFExportButtonProps = {
  registration: RegistrationDetail;
};

export function PDFExportButton({ registration }: PDFExportButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      try {
        const { generateRegistrationPDF } = await import("@/lib/pdf-export");
        generateRegistrationPDF(registration);
        toast.success("PDF erfolgreich heruntergeladen");
      } catch (error) {
        console.error("PDF Export Error:", error);
        toast.error("Fehler beim PDF Export");
      }
    });
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleExport}
      disabled={isPending}
    >
      {isPending ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" />
      )}
      {isPending ? "Wird erstellt..." : "PDF Export"}
    </Button>
  );
}
