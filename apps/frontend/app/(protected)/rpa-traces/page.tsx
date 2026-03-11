"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getRPATraces,
  acceptNewBaseline,
  retryBotExecution,
  type RPATraceWithUrls,
} from "./actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ReactCompareSlider,
  ReactCompareSliderImage,
} from "react-compare-slider";
import { CheckCircle, XCircle, RefreshCw, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import Link from "next/link";
import { toast } from "sonner";

export default function RPATracesPage() {
  const queryClient = useQueryClient();

  const { data: traces, isLoading } = useQuery({
    queryKey: ["rpa-traces"],
    queryFn: () => getRPATraces(),
    refetchInterval: 60000, // Refresh every 60s
    staleTime: 1000 * 30, // 30s stale for RPA traces (more dynamic)
  });

  const acceptBaselineMutation = useMutation({
    mutationFn: (traceId: string) => acceptNewBaseline(traceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rpa-traces"] });
      toast.success("Baseline akzeptiert");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  const retryBotMutation = useMutation({
    mutationFn: (registrationId: string) => retryBotExecution(registrationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rpa-traces"] });
      toast.success("Bot wird erneut ausgeführt");
    },
    onError: (error) => {
      toast.error(`Fehler: ${error.message}`);
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            RPA Visual Regression
          </h1>
          <p className="text-gray-600 mt-2">
            Screenshot-Vergleich von Bot-Ausführungen
          </p>
        </header>

        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-[600px] w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!traces || traces.length === 0) {
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-3xl font-bold text-gray-900">
            RPA Visual Regression
          </h1>
          <p className="text-gray-600 mt-2">
            Screenshot-Vergleich von Bot-Ausführungen
          </p>
        </header>

        <Card className="p-12">
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Keine Visual Regression Errors
            </h2>
            <p className="text-gray-600">
              Alle Bot-Ausführungen waren erfolgreich! 🎉
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">
          RPA Visual Regression
        </h1>
        <p className="text-gray-600 mt-2">
          {traces.length} Screenshot-Unterschied{traces.length !== 1 ? "e" : ""}{" "}
          gefunden
        </p>
      </header>

      <div className="space-y-6">
        {traces.map((trace) => (
          <TraceCard
            key={trace.id}
            trace={trace}
            onAcceptBaseline={() => acceptBaselineMutation.mutate(trace.id)}
            onRetryBot={() =>
              retryBotMutation.mutate(trace.registration_id)
            }
            isAccepting={acceptBaselineMutation.isPending}
            isRetrying={retryBotMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}

function TraceCard({
  trace,
  onAcceptBaseline,
  onRetryBot,
  isAccepting,
  isRetrying,
}: {
  trace: RPATraceWithUrls;
  onAcceptBaseline: () => void;
  onRetryBot: () => void;
  isAccepting: boolean;
  isRetrying: boolean;
}) {
  const diffPercent = (trace.visual_diff_score || 0) * 100;
  const isHighDiff = diffPercent > 0.2;

  return (
    <Card className="overflow-hidden">
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Link
                href={`/registrations/${trace.registration_id}`}
                className="text-xl font-semibold text-gray-900 hover:text-[#0055A4] transition-colors"
              >
                {trace.registration.player_name}
              </Link>
              <Badge
                variant={isHighDiff ? "destructive" : "secondary"}
                className="flex items-center gap-1"
              >
                {isHighDiff ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : (
                  <CheckCircle className="h-3 w-3" />
                )}
                Diff: {diffPercent.toFixed(2)}%
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>
                DFB-ID: {trace.registration.player_dfb_id || "Keine"}
              </span>
              {trace.registration.team && (
                <span>Team: {trace.registration.team.name}</span>
              )}
              <span>
                Ausgeführt:{" "}
                {trace.started_at
                  ? format(new Date(trace.started_at), "dd.MM.yyyy HH:mm", {
                      locale: de,
                    })
                  : "—"}
              </span>
            </div>
          </div>

          <div className="text-right text-sm text-gray-600">
            <p>Execution ID</p>
            <p className="font-mono text-xs">{trace.execution_id}</p>
          </div>
        </div>

        {/* Error Message (wenn vorhanden) */}
        {trace.error_message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{trace.error_message}</p>
          </div>
        )}

        {/* Image Comparison Slider */}
        {trace.baselineUrl && trace.actualUrl ? (
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <ReactCompareSlider
              itemOne={
                <ReactCompareSliderImage
                  src={trace.baselineUrl}
                  alt="Baseline Screenshot"
                />
              }
              itemTwo={
                <ReactCompareSliderImage
                  src={trace.actualUrl}
                  alt="Actual Screenshot"
                />
              }
              style={{ height: "600px" }}
            />
          </div>
        ) : (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <XCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-600">Screenshots nicht verfügbar</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2 border-t border-gray-200">
          <Button
            onClick={onAcceptBaseline}
            disabled={isAccepting}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isAccepting ? "Wird akzeptiert..." : "Neue Baseline akzeptieren"}
          </Button>
          <Button
            variant="outline"
            onClick={onRetryBot}
            disabled={isRetrying}
            className="flex-1"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {isRetrying ? "Startet..." : "Bot erneut ausführen"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
