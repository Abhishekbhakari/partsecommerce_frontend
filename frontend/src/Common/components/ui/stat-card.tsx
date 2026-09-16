import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./card";
import { cn } from "@/Common/lib/utils";

export interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  trendPositive?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, trendPositive }: StatCardProps) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between p-4 pt-4 sm:p-5 sm:pt-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-foreground">{value}</p>
          {trend && (
            <p className={cn("mt-1 text-xs font-medium", trendPositive ? "text-success" : "text-destructive")}>{trend}</p>
          )}
        </div>
        <div className="rounded-md bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
