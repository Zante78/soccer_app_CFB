"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { generateRegistrationPDF } from "@/lib/pdf-export";
import { toast } from "sonner";
import type { RegistrationDetail } from "./types";

type PDFExportButtonProps = {
  registration: RegistrationDetail;
};

export function PDFExportButton({ registration }: PDFExportButtonProps) {
  const handleExport = () => {
    try {
      generateRegistrationPDF(registration);
      toast.success("PDF erfolgreich heruntergeladen");
    } catch (error) {
      console.error("PDF Export Error:", error);
      toast.error("Fehler beim PDF Export");
    }
  };

  return (
    <Button
      variant="outline"
      className="w-full justify-start"
      onClick={handleExport}
    >
      <FileDown className="h-4 w-4 mr-2" />
      PDF Export
    </Button>
  );
}
