import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building } from "lucide-react";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";
import { PropertyOption } from "@/integration/supabase/types/month-end-reports";
import { FrontendStaffLocation } from "@/integration/supabase/types/staffLocation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ReportMetadataProps {
  form: UseFormReturn<MonthEndReportFormData>;
  properties?: PropertyOption[];
  staffLocations?: FrontendStaffLocation[];
  isReadOnly?: boolean;
}

export const ReportMetadata: React.FC<ReportMetadataProps> = ({ 
  form, 
  properties = [],
  staffLocations = [],
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
          <Label htmlFor="hotel_site">Hotel Site *</Label>
          <Select
            value={form.watch("property_id") || ""}
            onValueChange={(value) => {
              const selectedLocation = staffLocations.find(loc => loc.id === value);
              form.setValue("property_id", value);
              form.setValue("hotel_site", selectedLocation?.locationDescription || "");
            }}
            disabled={isReadOnly}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select hotel site" />
            </SelectTrigger>
            <SelectContent>
              {staffLocations.map((location) => (
                <SelectItem key={location.id} value={location.id}>
                  {location.locationDescription}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {form.formState.errors.hotel_site && (
            <p className="text-sm text-red-600">{form.formState.errors.hotel_site.message}</p>
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
