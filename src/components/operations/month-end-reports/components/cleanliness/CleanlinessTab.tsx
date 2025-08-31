import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles } from "lucide-react";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";

interface CleanlinessTabProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const CleanlinessTab: React.FC<CleanlinessTabProps> = ({ form, isReadOnly = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Guest Room Cleanliness
        </CardTitle>
        <CardDescription>Cleanliness scores and inspection data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cleanliness_score">Cleanliness Score (0-1.0)</Label>
            <Input
              id="cleanliness_score"
              type="number"
              step="0.001"
              min="0"
              max="1"
              {...form.register("cleanliness_score", { valueAsNumber: true })}
              disabled={isReadOnly}
              placeholder="0.000"
            />
            {form.formState.errors.cleanliness_score && (
              <p className="text-sm text-red-600">{form.formState.errors.cleanliness_score.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="inspection_count">Inspection Count</Label>
            <Input
              id="inspection_count"
              type="number"
              min="0"
              {...form.register("inspection_count", { valueAsNumber: true })}
              disabled={isReadOnly}
              placeholder="0"
            />
            {form.formState.errors.inspection_count && (
              <p className="text-sm text-red-600">{form.formState.errors.inspection_count.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="issues_found">Issues Found</Label>
            <Input
              id="issues_found"
              type="number"
              min="0"
              {...form.register("issues_found", { valueAsNumber: true })}
              disabled={isReadOnly}
              placeholder="0"
            />
            {form.formState.errors.issues_found && (
              <p className="text-sm text-red-600">{form.formState.errors.issues_found.message}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="cleanliness_comments">Comments</Label>
          <Textarea
            id="cleanliness_comments"
            {...form.register("cleanliness_comments")}
            disabled={isReadOnly}
            placeholder="Comments about cleanliness inspections..."
            rows={3}
          />
          {form.formState.errors.cleanliness_comments && (
            <p className="text-sm text-red-600">{form.formState.errors.cleanliness_comments.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanlinessTab;
