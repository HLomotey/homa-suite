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

import {
  monthEndReportSchema,
  MonthEndReportFormData,
  GroupFormData,
  ActionItemFormData
} from "../../schemas/monthEndReportSchema";
import {
  FrontendMonthEndReport,
  ReportStatus,
  PropertyOption
} from "@/integration/supabase/types/month-end-reports";

interface MonthEndReportSheetFormProps {
  report?: FrontendMonthEndReport | null;
  mode: 'create' | 'edit' | 'view';
  properties?: PropertyOption[];
  staffLocations?: any[];
  onSave: (data: MonthEndReportFormData) => Promise<void>;
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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const isReadOnly = mode === 'view' || report?.status === 'approved';

  const form = useForm<MonthEndReportFormData>({
    resolver: zodResolver(monthEndReportSchema),
    defaultValues: {
      hotel_site: report?.hotel_site || "",
      property_id: report?.property_id || "",
      start_date: report?.start_date || new Date().toISOString().split("T")[0],
      end_date: report?.end_date || new Date().toISOString().split("T")[0],
      headline: report?.headline || "",
      narrative: report?.narrative || "",
      key_risks: report?.key_risks || [],
      key_wins: report?.key_wins || [],
      occupancy_start_pct: report?.occupancy_start_pct || undefined,
      occupancy_end_pct: report?.occupancy_end_pct || undefined,
      avg_occupancy_pct: report?.avg_occupancy_pct || undefined,
      occupancy_notes: report?.occupancy_notes || "",
      cleanliness_score: report?.cleanliness_score || undefined,
      inspection_count: report?.inspection_count || undefined,
      issues_found: report?.issues_found || undefined,
      cleanliness_comments: report?.cleanliness_comments || "",
      training_updates: report?.training_updates || "",
      absenteeism_notes: report?.absenteeism_notes || "",
      incidents: report?.incidents || "",
      groups: report?.groups?.map(g => ({
        id: g.id,
        group_name: g.group_name,
        arrival_date: g.arrival_date,
        departure_date: g.departure_date,
        rooms_blocked: g.rooms_blocked,
        notes: g.notes
      })) || [],
      action_items: report?.action_items?.map(a => ({
        id: a.id,
        title: a.title,
        owner: a.owner,
        due_date: a.due_date,
        status: a.status
      })) || []
    }
  });

  const { control, watch, setValue } = form;
  const groups = watch("groups") || [];
  const actionItems = watch("action_items") || [];
  const keyRisks = watch("key_risks") || [];
  const keyWins = watch("key_wins") || [];

  // Calculate average occupancy when start/end values change
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "occupancy_start_pct" || name === "occupancy_end_pct") {
        const start = value.occupancy_start_pct;
        const end = value.occupancy_end_pct;
        if (start !== undefined && end !== undefined) {
          const avg = (start + end) / 2;
          form.setValue("avg_occupancy_pct", Number(avg.toFixed(2)));
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

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
                          <Input
                            placeholder="Enter hotel site"
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
                    name="occupancy_start_pct"
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
                    name="occupancy_end_pct"
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
                    name="avg_occupancy_pct"
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
                    name="inspection_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inspection Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={isReadOnly}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="issues_found"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Issues Found</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            disabled={isReadOnly}
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={control}
                  name="cleanliness_comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cleanliness Comments</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about cleanliness issues, maintenance needs, etc."
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
                  name="training_updates"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Training Updates</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about training programs, certifications, skill development, etc."
                          className="min-h-[100px]"
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
                  name="absenteeism_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Absenteeism Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Add notes about attendance patterns, sick leave trends, etc."
                          className="min-h-[100px]"
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
                  name="incidents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Incidents</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Document any incidents, safety issues, or notable events"
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
