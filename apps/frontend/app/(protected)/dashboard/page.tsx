import { Suspense } from "react";
import { requireRole } from "@/lib/auth-guard";
import { DASHBOARD_ROLES } from "@/lib/auth-types";
import { getDashboardMetrics } from "./actions";
import { MetricCard } from "@/components/admin/metric-card";
import { StatusChart } from "@/components/admin/status-chart";
import { ActivityFeed } from "@/components/admin/activity-feed";
import {
  Users,
  CreditCard,
  Bot,
  Clock,
} from "lucide-react";

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 animate-pulse" />
        <div className="bg-white rounded-lg border border-gray-200 p-6 h-64 animate-pulse" />
      </div>
    </div>
  );
}

async function DashboardContent({ userName }: { userName: string }) {
  const metrics = await getDashboardMetrics();

  return (
    <>
      {/* Metric Cards Grid */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Gesamt Registrierungen"
          value={metrics.totalRegistrations}
          icon={Users}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-50"
        />

        <MetricCard
          title="Zahlungen"
          value={`${metrics.paymentStats.paymentRate}%`}
          subtitle={`${metrics.paymentStats.paid} von ${metrics.paymentStats.total} bezahlt`}
          icon={CreditCard}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
        />

        <MetricCard
          title="Bot Erfolgsrate"
          value={`${metrics.botStats.successRate}%`}
          subtitle={`${metrics.botStats.success} von ${metrics.botStats.total} erfolgreich`}
          icon={Bot}
          iconColor="text-[#0055A4]"
          iconBgColor="bg-blue-50"
        />

        <MetricCard
          title="Bereit für Bot"
          value={metrics.statusBreakdown.READY_FOR_BOT || 0}
          subtitle="Wartend auf Automatisierung"
          icon={Clock}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-50"
        />
      </section>

      {/* Status Chart & Activity Feed */}
      <section className="grid gap-6 lg:grid-cols-2">
        <StatusChart data={metrics.statusBreakdown} />
        <ActivityFeed items={metrics.recentActivity} />
      </section>
    </>
  );
}

export default async function DashboardPage() {
  const user = await requireRole(DASHBOARD_ROLES);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Willkommen zurück, {user.full_name || user.email}!
        </p>
      </header>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent userName={user.full_name || user.email} />
      </Suspense>
    </div>
  );
}
