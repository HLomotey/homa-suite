import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";
import { PropertyOption } from "@/integration/supabase/types/month-end-reports";

interface ReportMetadataProps {
  form: UseFormReturn<MonthEndReportFormData>;
  properties?: PropertyOption[];
  isReadOnly?: boolean;
}

export const ReportMetadata: React.FC<ReportMetadataProps> = ({ 
  form, 
  properties = [],
  isReadOnly = false 
}) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Report Information
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="property_name">Property Name *</Label>
          <Input
            id="property_name"
            {...form.register("property_name")}
            disabled={isReadOnly}
            placeholder="Enter property name"
          />
          {form.formState.errors.property_name && (
            <p className="text-sm text-red-600">{form.formState.errors.property_name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            {...form.register("start_date")}
            disabled={isReadOnly}
          />
          {form.formState.errors.start_date && (
            <p className="text-sm text-red-600">{form.formState.errors.start_date.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="end_date">End Date *</Label>
          <Input
            id="end_date"
            type="date"
            {...form.register("end_date")}
            disabled={isReadOnly}
          />
          {form.formState.errors.end_date && (
            <p className="text-sm text-red-600">{form.formState.errors.end_date.message}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ReportMetadata;
