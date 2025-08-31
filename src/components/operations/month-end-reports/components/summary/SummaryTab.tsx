import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileText } from "lucide-react";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";

interface SummaryTabProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ form, isReadOnly = false }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Summary
        </CardTitle>
        <CardDescription>Provide a narrative and highlights for the reporting period</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="headline">Headline * (10-120 characters)</Label>
          <Input
            id="headline"
            {...form.register("headline")}
            disabled={isReadOnly}
            placeholder="Brief summary of the period"
            maxLength={120}
          />
          {form.formState.errors.headline && (
            <p className="text-sm text-red-600">{form.formState.errors.headline.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="narrative">Narrative * (50-3000 characters)</Label>
          <Textarea
            id="narrative"
            {...form.register("narrative")}
            disabled={isReadOnly}
            placeholder="Detailed narrative of the reporting period..."
            rows={6}
            maxLength={3000}
          />
          {form.formState.errors.narrative && (
            <p className="text-sm text-red-600">{form.formState.errors.narrative.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryTab;
