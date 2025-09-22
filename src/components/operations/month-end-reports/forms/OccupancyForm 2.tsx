import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Hotel } from "lucide-react";
import { MonthEndReportFormData } from "../schemas/monthEndReportSchema";

interface OccupancyFormProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const OccupancyForm: React.FC<OccupancyFormProps> = ({ form, isReadOnly = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="h-5 w-5" />
          Hotel Occupancy
        </CardTitle>
        <CardDescription>Occupancy figures and notes for the reporting period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="occupancy_start_pct">Start Occupancy %</Label>
            <Input
              id="occupancy_start_pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...form.register("occupancy_start_pct", { valueAsNumber: true })}
              disabled={isReadOnly}
              placeholder="0.00"
            />
            {form.formState.errors.occupancy_start_pct && (
              <p className="text-sm text-red-600">{form.formState.errors.occupancy_start_pct.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="occupancy_end_pct">End Occupancy %</Label>
            <Input
              id="occupancy_end_pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...form.register("occupancy_end_pct", { valueAsNumber: true })}
              disabled={isReadOnly}
              placeholder="0.00"
            />
            {form.formState.errors.occupancy_end_pct && (
              <p className="text-sm text-red-600">{form.formState.errors.occupancy_end_pct.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="avg_occupancy_pct">Average Occupancy %</Label>
            <Input
              id="avg_occupancy_pct"
              type="number"
              step="0.01"
              min="0"
              max="100"
              {...form.register("avg_occupancy_pct", { valueAsNumber: true })}
              disabled={isReadOnly}
              placeholder="0.00"
            />
            {form.formState.errors.avg_occupancy_pct && (
              <p className="text-sm text-red-600">{form.formState.errors.avg_occupancy_pct.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="occupancy_notes">Notes</Label>
          <Textarea
            id="occupancy_notes"
            {...form.register("occupancy_notes")}
            disabled={isReadOnly}
            placeholder="Additional notes about occupancy..."
            rows={3}
          />
          {form.formState.errors.occupancy_notes && (
            <p className="text-sm text-red-600">{form.formState.errors.occupancy_notes.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OccupancyForm;
