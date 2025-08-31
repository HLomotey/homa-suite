import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";

interface CleanlinessTabProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const CleanlinessTab: React.FC<CleanlinessTabProps> = ({ form, isReadOnly = false }) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Guest Room Cleanliness</h3>
        <p className="text-sm text-muted-foreground">
          Cleanliness scores and inspection data for the reporting period
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        {/* Metrics Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Cleanliness Metrics
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="cleanliness_score" className="text-sm font-medium">
                Cleanliness Score (0-1.0) *
              </Label>
              <Input
                id="cleanliness_score"
                type="number"
                step="0.001"
                min="0"
                max="1"
                {...form.register("cleanliness_score", { valueAsNumber: true })}
                disabled={isReadOnly}
                placeholder="0.000"
                className="h-10"
              />
              {form.formState.errors.cleanliness_score && (
                <p className="text-sm text-destructive">{form.formState.errors.cleanliness_score.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="inspection_count" className="text-sm font-medium">
                Total Inspections
              </Label>
              <Input
                id="inspection_count"
                type="number"
                min="0"
                {...form.register("inspection_count", { valueAsNumber: true })}
                disabled={isReadOnly}
                placeholder="0"
                className="h-10"
              />
              {form.formState.errors.inspection_count && (
                <p className="text-sm text-destructive">{form.formState.errors.inspection_count.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issues_found" className="text-sm font-medium">
                Issues Found
              </Label>
              <Input
                id="issues_found"
                type="number"
                min="0"
                {...form.register("issues_found", { valueAsNumber: true })}
                disabled={isReadOnly}
                placeholder="0"
                className="h-10"
              />
              {form.formState.errors.issues_found && (
                <p className="text-sm text-destructive">{form.formState.errors.issues_found.message}</p>
              )}
            </div>
          </div>
        </div>

        <Separator />

        {/* Comments Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Additional Comments
          </h4>
          <div className="space-y-2">
            <Label htmlFor="cleanliness_comments" className="text-sm font-medium">
              Cleanliness Comments
            </Label>
            <Textarea
              id="cleanliness_comments"
              {...form.register("cleanliness_comments")}
              disabled={isReadOnly}
              placeholder="Provide details about cleanliness inspections, common issues found, corrective actions taken, or any notable observations..."
              rows={4}
              className="resize-none"
            />
            {form.formState.errors.cleanliness_comments && (
              <p className="text-sm text-destructive">{form.formState.errors.cleanliness_comments.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CleanlinessTab;
