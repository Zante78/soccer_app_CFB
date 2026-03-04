"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getRegistrations, getTeams } from "./actions";
import { FilterBar } from "@/components/admin/filter-bar";
import { RegistrationsTable } from "@/components/admin/registrations-table";
import { PaginationControls } from "@/components/admin/pagination-controls";
import type { RegistrationStatus } from "@packages/shared-types";

export default function RegistrationsPage() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState<RegistrationStatus | null>(null);
  const [teamId, setTeamId] = useState<string | null>(null);

  // Debounce search query
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load Teams for filter
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: getTeams,
  });

  // Load Registrations
  const { data, isLoading, error } = useQuery({
    queryKey: ["registrations", { page, status, teamId, search: debouncedSearch }],
    queryFn: () =>
      getRegistrations({
        page,
        status,
        teamId,
        searchQuery: debouncedSearch,
      }),
  });

  const handleReset = () => {
    setSearchQuery("");
    setStatus(null);
    setTeamId(null);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Registrierungen</h1>
        <p className="text-gray-600 mt-2">Verwalte alle Spielerpass-Anträge</p>
      </header>

      <FilterBar
        searchQuery={searchQuery}
        status={status}
        teamId={teamId}
        teams={teams}
        onSearchChange={setSearchQuery}
        onStatusChange={(newStatus) => {
          setStatus(newStatus);
          setPage(1);
        }}
        onTeamChange={(newTeamId) => {
          setTeamId(newTeamId);
          setPage(1);
        }}
        onReset={handleReset}
      />

      {error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">
            Fehler beim Laden der Registrierungen. Bitte versuche es erneut.
          </p>
        </div>
      ) : (
        <>
          <RegistrationsTable data={data?.registrations} isLoading={isLoading} />

          {data && data.totalCount > 0 && (
            <PaginationControls
              currentPage={data.currentPage}
              totalPages={data.totalPages}
              totalCount={data.totalCount}
              pageSize={data.pageSize}
              onPageChange={setPage}
              isLoading={isLoading}
            />
          )}
        </>
      )}
    </div>
  );
}
