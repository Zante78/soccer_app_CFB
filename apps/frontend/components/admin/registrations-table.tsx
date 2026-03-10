"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/admin/status-badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, FileText, Trash2, CheckCircle, XCircle, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { RegistrationListItem } from "@/app/(protected)/registrations/types";
import { format } from "date-fns";
import { de } from "date-fns/locale";

type SortColumn = "created_at" | "player_name" | "eligibility_date" | "status";

type RegistrationsTableProps = {
  data: RegistrationListItem[] | undefined;
  isLoading: boolean;
  sortBy?: SortColumn;
  sortOrder?: "asc" | "desc";
  onSort?: (column: SortColumn) => void;
};

export function RegistrationsTable({ data, isLoading, sortBy, sortOrder, onSort }: RegistrationsTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Spieler</TableHead>
                <TableHead>Geburtsdatum</TableHead>
                <TableHead>Team</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead>Erstellt</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-32 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-24 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-28 animate-pulse" /></TableCell>
                  <TableCell><div className="h-6 bg-gray-200 rounded-full w-20 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-16 animate-pulse" /></TableCell>
                  <TableCell><div className="h-4 bg-gray-200 rounded w-28 animate-pulse" /></TableCell>
                  <TableCell className="text-right"><div className="h-8 bg-gray-200 rounded w-8 ml-auto animate-pulse" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Keine Registrierungen gefunden
          </h3>
          <p className="text-gray-600">
            Versuche deine Filtereinstellungen anzupassen.
          </p>
        </div>
      </div>
    );
  }

  const SortButton = ({ column, children }: { column: SortColumn; children: React.ReactNode }) => {
    const isActive = sortBy === column;
    const Icon = isActive ? (sortOrder === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;

    return (
      <button
        onClick={() => onSort?.(column)}
        className="flex items-center gap-1 hover:text-gray-900 transition-colors"
      >
        {children}
        <Icon className={`h-4 w-4 ${isActive ? "text-[#0055A4]" : "text-gray-400"}`} />
      </button>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <SortButton column="player_name">Spieler</SortButton>
            </TableHead>
            <TableHead>Geburtsdatum</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>
              <SortButton column="status">Status</SortButton>
            </TableHead>
            <TableHead>Zahlung</TableHead>
            <TableHead>
              <SortButton column="created_at">Erstellt</SortButton>
            </TableHead>
            <TableHead className="text-right">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((registration) => (
            <TableRow key={registration.id} className="hover:bg-gray-50">
              <TableCell className="font-medium">
                <div>
                  <p className="text-gray-900">{registration.player_name}</p>
                  {registration.player_dfb_id && (
                    <p className="text-xs text-gray-500">
                      DFB-ID: {registration.player_dfb_id}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {format(new Date(registration.player_birth_date), "dd.MM.yyyy", {
                  locale: de,
                })}
              </TableCell>
              <TableCell>{registration.team_name || "-"}</TableCell>
              <TableCell>
                <StatusBadge status={registration.status} />
              </TableCell>
              <TableCell>
                {registration.is_paid ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">Bezahlt</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-gray-500">
                    <XCircle className="h-4 w-4" />
                    <span className="text-sm">Offen</span>
                  </div>
                )}
              </TableCell>
              <TableCell>
                {format(new Date(registration.created_at), "dd.MM.yyyy HH:mm", {
                  locale: de,
                })}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/registrations/${registration.id}`}>
                        <Eye className="h-4 w-4 mr-2" />
                        Details ansehen
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
