"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RegistrationStatus } from "@packages/shared-types";

type FilterBarProps = {
  searchQuery: string;
  status: RegistrationStatus | null;
  teamId: string | null;
  teams: Array<{ id: string; name: string }>;
  onSearchChange: (query: string) => void;
  onStatusChange: (status: RegistrationStatus | null) => void;
  onTeamChange: (teamId: string | null) => void;
  onReset: () => void;
};

const statusOptions: Array<{ value: RegistrationStatus; label: string }> = [
  { value: "DRAFT", label: "Entwurf" },
  { value: "SUBMITTED", label: "Eingereicht" },
  { value: "VALIDATION_PENDING", label: "Validierung" },
  { value: "READY_FOR_BOT", label: "Bereit für Bot" },
  { value: "BOT_IN_PROGRESS", label: "Bot läuft" },
  { value: "COMPLETED", label: "Abgeschlossen" },
  { value: "ERROR", label: "Fehler" },
  { value: "MANUALLY_PROCESSED", label: "Manuell" },
  { value: "VISUAL_REGRESSION_ERROR", label: "Visual Regression" },
];

export function FilterBar({
  searchQuery,
  status,
  teamId,
  teams,
  onSearchChange,
  onStatusChange,
  onTeamChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = searchQuery || status || teamId;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="grid gap-4 md:grid-cols-4">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Spielername oder DFB-ID suchen..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={status || "all"}
          onValueChange={(value) =>
            onStatusChange(value === "all" ? null : (value as RegistrationStatus))
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Alle Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Status</SelectItem>
            {statusOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Team Filter */}
        <Select
          value={teamId || "all"}
          onValueChange={(value) => onTeamChange(value === "all" ? null : value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Alle Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Teams</SelectItem>
            {teams.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="mt-3 flex items-center justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-gray-600 hover:text-gray-900"
          >
            <X className="h-4 w-4 mr-1" />
            Filter zurücksetzen
          </Button>
        </div>
      )}
    </div>
  );
}
