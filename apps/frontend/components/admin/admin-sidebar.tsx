"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Bot,
  Settings,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/components/providers/supabase-provider";

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Registrierungen",
    href: "/registrations",
    icon: FileText,
  },
  {
    name: "RPA Traces",
    href: "/rpa-traces",
    icon: Bot,
    roles: ["SUPER_ADMIN", "PASSWART"], // Nur für Admins sichtbar
  },
  {
    name: "Einstellungen",
    href: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN"],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const supabase = useSupabase();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  // Filter nav items basierend auf Rolle
  const visibleNavItems = navItems.filter((item) => {
    if (!item.roles) return true;
    return profile && item.roles.includes(profile.role);
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo/Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-[#0055A4]">CfB Pass-Admin</h2>
        <p className="text-sm text-gray-600 mt-1">Verwaltung</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? "bg-[#0055A4] text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info & Sign Out */}
      {profile && (
        <div className="p-4 border-t border-gray-200 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="h-8 w-8 rounded-full bg-[#0055A4] flex items-center justify-center text-white font-semibold">
              {profile.full_name?.[0] || profile.email[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {profile.full_name || profile.email}
              </p>
              <p className="text-xs text-gray-500">
                {profile.role === "SUPER_ADMIN" ? "Super Admin" :
                 profile.role === "PASSWART" ? "Passwart" :
                 profile.role === "TRAINER" ? "Trainer" : "Benutzer"}
              </p>
            </div>
          </div>

          <Button
            variant="secondary"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Abmelden
          </Button>
        </div>
      )}
    </aside>
  );
}
