import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

type MetricCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
};

export function MetricCard({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  iconColor = "text-[#0055A4]",
  iconBgColor = "bg-blue-50",
}: MetricCardProps) {
  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {subtitle && (
            <p className="text-sm text-gray-700 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className="flex items-center gap-1 mt-2">
              <span
                className={`text-xs font-medium ${
                  trend.positive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.positive ? "↑" : "↓"} {trend.value}%
              </span>
              <span className="text-xs text-gray-700">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={`${iconBgColor} ${iconColor} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </Card>
  );
}
