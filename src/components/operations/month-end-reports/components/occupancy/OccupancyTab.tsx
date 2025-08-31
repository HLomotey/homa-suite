import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";

interface OccupancyTabProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const OccupancyTab: React.FC<OccupancyTabProps> = ({ form, isReadOnly = false }) => {
  const startOccupancy = form.watch("occupancy_start_pct") || 0;
  const endOccupancy = form.watch("occupancy_end_pct") || 0;
  const avgOccupancy = form.watch("avg_occupancy_pct") || 0;
  
  const occupancyChange = endOccupancy - startOccupancy;
  const getTrendIcon = () => {
    if (occupancyChange > 0) return <TrendingUp className="h-3 w-3 text-green-600" />;
    if (occupancyChange < 0) return <TrendingDown className="h-3 w-3 text-red-600" />;
    return <Minus className="h-3 w-3 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Hotel Occupancy</h3>
        <p className="text-sm text-muted-foreground">
          Track occupancy rates and performance metrics for the reporting period
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        {/* Occupancy Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Occupancy Metrics
            </h4>
            {(startOccupancy > 0 || endOccupancy > 0) && (
              <Badge variant="outline" className="flex items-center gap-1">
                {getTrendIcon()}
                {occupancyChange > 0 ? '+' : ''}{occupancyChange.toFixed(1)}% change
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="occupancy_start_pct" className="text-sm font-medium">
                Start Occupancy % *
              </Label>
              <div className="relative">
                <Input
                  id="occupancy_start_pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...form.register("occupancy_start_pct", { valueAsNumber: true })}
                  disabled={isReadOnly}
                  placeholder="0.00"
                  className="h-10 pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Occupancy rate at the beginning of the period
              </p>
              {form.formState.errors.occupancy_start_pct && (
                <p className="text-sm text-destructive">{form.formState.errors.occupancy_start_pct.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="occupancy_end_pct" className="text-sm font-medium">
                End Occupancy % *
              </Label>
              <div className="relative">
                <Input
                  id="occupancy_end_pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...form.register("occupancy_end_pct", { valueAsNumber: true })}
                  disabled={isReadOnly}
                  placeholder="0.00"
                  className="h-10 pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Occupancy rate at the end of the period
              </p>
              {form.formState.errors.occupancy_end_pct && (
                <p className="text-sm text-destructive">{form.formState.errors.occupancy_end_pct.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avg_occupancy_pct" className="text-sm font-medium">
                Average Occupancy % *
              </Label>
              <div className="relative">
                <Input
                  id="avg_occupancy_pct"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...form.register("avg_occupancy_pct", { valueAsNumber: true })}
                  disabled={isReadOnly}
                  placeholder="0.00"
                  className="h-10 pr-8"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-muted-foreground">
                  %
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Average occupancy throughout the period
              </p>
              {form.formState.errors.avg_occupancy_pct && (
                <p className="text-sm text-destructive">{form.formState.errors.avg_occupancy_pct.message}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Additional Notes */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Occupancy Analysis
          </h4>
          <div className="space-y-2">
            <Label htmlFor="occupancy_notes" className="text-sm font-medium">
              Occupancy Notes & Analysis
            </Label>
            <Textarea
              id="occupancy_notes"
              {...form.register("occupancy_notes")}
              disabled={isReadOnly}
              placeholder="Provide insights about occupancy trends, seasonal factors, market conditions, booking patterns, or any factors that influenced occupancy during this period..."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include details about booking trends, seasonal impacts, competitive factors, or operational changes that affected occupancy
            </p>
            {form.formState.errors.occupancy_notes && (
              <p className="text-sm text-destructive">{form.formState.errors.occupancy_notes.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OccupancyTab;
