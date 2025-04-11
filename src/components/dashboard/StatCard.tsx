import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  onClick,
}) => {
  return (
    <Card 
      className={cn(
        "dashboard-stat-card transition-all",
        onClick ? "hover:shadow-md hover:bg-muted/50 cursor-pointer" : "",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    "text-xs font-medium rounded-full px-1.5 py-0.5",
                    trend.isPositive
                      ? "text-system-green-600 bg-system-green-100"
                      : "text-system-red-500 bg-system-red-100"
                  )}
                >
                  {trend.isPositive ? "+" : "-"}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </div>
          <div className="p-2 rounded-full bg-system-blue-100 dark:bg-system-blue-900/20">
            <Icon className="h-5 w-5 text-system-blue-600 dark:text-system-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
