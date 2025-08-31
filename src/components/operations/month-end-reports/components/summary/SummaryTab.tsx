import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";

interface SummaryTabProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const SummaryTab: React.FC<SummaryTabProps> = ({ form, isReadOnly = false }) => {
  const headline = form.watch("headline") || "";
  const narrative = form.watch("narrative") || "";
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Report Summary</h3>
        <p className="text-sm text-muted-foreground">
          Provide a compelling narrative and key highlights for the reporting period
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        {/* Headline Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Executive Summary
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="headline" className="text-sm font-medium">
                Report Headline *
              </Label>
              <Badge variant={headline.length < 10 ? "destructive" : headline.length > 120 ? "destructive" : "secondary"}>
                {headline.length}/120
              </Badge>
            </div>
            <Input
              id="headline"
              {...form.register("headline")}
              disabled={isReadOnly}
              placeholder="Enter a compelling headline that captures the essence of this reporting period..."
              maxLength={120}
              className="h-12 text-base"
            />
            <p className="text-xs text-muted-foreground">
              Create an engaging headline that summarizes the key theme or outcome of this period (10-120 characters)
            </p>
            {form.formState.errors.headline && (
              <p className="text-sm text-destructive">{form.formState.errors.headline.message}</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Narrative Section */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Detailed Narrative
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="narrative" className="text-sm font-medium">
                Report Narrative *
              </Label>
              <Badge variant={narrative.length < 50 ? "destructive" : narrative.length > 3000 ? "destructive" : "secondary"}>
                {narrative.length}/3000
              </Badge>
            </div>
            <Textarea
              id="narrative"
              {...form.register("narrative")}
              disabled={isReadOnly}
              placeholder="Provide a comprehensive narrative covering key events, achievements, challenges, and outcomes during this reporting period. Include specific details about operations, guest feedback, staff performance, and any significant incidents or improvements..."
              rows={8}
              maxLength={3000}
              className="resize-none text-sm leading-relaxed"
            />
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Your narrative should include:</p>
              <ul className="list-disc list-inside ml-2 space-y-0.5">
                <li>Key operational highlights and achievements</li>
                <li>Notable challenges and how they were addressed</li>
                <li>Guest satisfaction and feedback trends</li>
                <li>Staff performance and development activities</li>
                <li>Maintenance, improvements, or significant changes</li>
              </ul>
            </div>
            {form.formState.errors.narrative && (
              <p className="text-sm text-destructive">{form.formState.errors.narrative.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryTab;
