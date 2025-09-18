import React, { useState, useEffect, useCallback } from "react";
import useStaffLocation from "@/hooks/transport/useStaffLocation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { 
  FileText,
  Hotel,
  Sparkles,
  Users,
  Target,
  Plus,
  Trash2,
  MapPin,
  Save,
  Send,
  CheckCircle
} from "lucide-react";

import { OpsCallFormData, FrontendOpsCall } from "@/integration/supabase/types/operations-call";
import { 
  monthEndReportSchema,
  MonthEndReportFormData,
  GroupFormData,
  ActionItemFormData
} from "../../schemas/monthEndReportSchema";
import {
  ReportStatus,
  PropertyOption
} from "@/integration/supabase/types/month-end-reports";

interface MonthEndReportSheetFormProps {
  report?: FrontendOpsCall | null;
  mode: 'create' | 'edit' | 'view';
  properties?: PropertyOption[];
  staffLocations?: any[];
  onSave: (data: OpsCallFormData) => Promise<void>;
  onSubmit?: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onCancel: () => void;
}

export const MonthEndReportSheetForm: React.FC<MonthEndReportSheetFormProps> = ({
  report,
  mode,
  properties = [],
  staffLocations = [],
  onSave,
  onSubmit,
  onApprove,
  onCancel
}) => {
  const { toast } = useToast();
  const { staffLocations: hookStaffLocations, loading: staffLocationsLoading } = useStaffLocation();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isReadOnly = mode === 'view' || report?.status === 'approved';

  const form = useForm<OpsCallFormData>({
    defaultValues: {
      hotel_site: report?.hotel_site || "",
      start_date: report?.start_date || new Date().toISOString().split("T")[0],
      end_date: report?.end_date || new Date().toISOString().split("T")[0],
      headline: report?.headline || "",
      narrative: report?.narrative || "",
      start_occupancy_pct: report?.start_occupancy_pct || undefined,
      end_occupancy_pct: report?.end_occupancy_pct || undefined,
      average_occupancy_pct: report?.average_occupancy_pct || undefined,
      occupancy_notes: report?.occupancy_notes || "",
      cleanliness_score: report?.cleanliness_score || undefined,
      cleanliness_notes: report?.cleanliness_notes || "",
      groups_notes: report?.groups_notes || "",
      staffing_notes: report?.staffing_notes || ""
    }
  });

  const { control, watch, setValue } = form;

  // Calculate average occupancy when start/end values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "start_occupancy_pct" || name === "end_occupancy_pct") {
        const startPct = value.start_occupancy_pct;
        const endPct = value.end_occupancy_pct;
        if (startPct !== undefined && endPct !== undefined) {
          const avgPct = (startPct + endPct) / 2;
          setValue("average_occupancy_pct", Number(avgPct.toFixed(1)));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form, setValue]);

  const handleSave = async () => {
    try {
      const formData = form.getValues();
      await onSave(formData);
      setLastSaved(new Date());
      toast({
        title: "Saved",
        description: "Report saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save report",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: ReportStatus) => {
    const variants = {
      draft: "secondary",
      submitted: "default",
      approved: "default"
    } as const;

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Action Buttons */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          {report?.status && getStatusBadge(report.status)}
          {lastSaved && (
            <span className="text-sm text-muted-foreground">
              Last saved: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isReadOnly && (
            <Button variant="outline" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          )}
          {report?.status === 'draft' && onSubmit && (
            <Button onClick={() => onSubmit(report.id)}>
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
          )}
          {report?.status === 'submitted' && onApprove && (
            <Button onClick={() => onApprove(report.id)}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>

      {/* Form Content */}
      <ScrollArea className="flex-1 p-4">
        <Form {...form}>
          <div className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={control}
                    name="hotel_site"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hotel Site *</FormLabel>
                        <FormControl>
                          <SearchableSelect
                            options={hookStaffLocations.map((location) => ({
                              value: location.id,
                              label: location.locationDescription,
                            }))}
                            value={hookStaffLocations.find(loc => loc.locationDescription === field.value)?.id || ""}
                            placeholder={staffLocationsLoading ? "Loading locations..." : "Search and select hotel site..."}
                            emptyMessage="No hotel sites found."
                            onValueChange={(value) => {
                              const selectedLocation = hookStaffLocations.find(loc => loc.id === value);
                              field.onChange(selectedLocation?.locationDescription || "");
                            }}
                            disabled={isReadOnly || staffLocationsLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            disabled={isReadOnly}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Date *</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            disabled={isReadOnly}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Summary Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Headline *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter a compelling headline (10-120 characters)"
                          disabled={isReadOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={control}
                  name="narrative"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Narrative *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed narrative of the month's performance (50-3000 characters)"
                          className="min-h-[120px]"
                          disabled={isReadOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Occupancy Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hotel className="h-5 w-5" />
                  Occupancy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="start_occupancy_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Start Occupancy %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isReadOnly}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="end_occupancy_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>End Occupancy %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isReadOnly}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="average_occupancy_pct"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Average Occupancy %</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            placeholder="0.00"
                            disabled={true}
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="occupancy_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupancy Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about occupancy trends, seasonal factors, etc."
                          className="min-h-[100px]"
                          disabled={isReadOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Cleanliness Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Cleanliness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="cleanliness_score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cleanliness Score (0-1)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            placeholder="0.00"
                            disabled={isReadOnly}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="cleanliness_notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cleanliness Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Add notes about cleanliness standards, issues, improvements..."
                            className="min-h-[100px]"
                            disabled={isReadOnly}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

              </CardContent>
            </Card>

            {/* Groups Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Groups & Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name="groups_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Groups Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about group bookings, events, special arrangements, etc."
                          className="min-h-[100px]"
                          disabled={isReadOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Staffing Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Staffing & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name="staffing_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Staffing Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about staffing levels, training, attendance patterns, etc."
                          className="min-h-[100px]"
                          disabled={isReadOnly}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />


              </CardContent>
            </Card>
          </div>
        </Form>
      </ScrollArea>
    </div>
  );
};
