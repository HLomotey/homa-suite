import React, { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Save, 
  Send, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Clock,
  Building,
  FileText,
  Hotel,
  Sparkles,
  Users,
  Calendar,
  Target
} from "lucide-react";
import {
  monthEndReportSchema,
  MonthEndReportFormData,
  GroupFormData,
  ActionItemFormData
} from "./schemas/monthEndReportSchema";
import {
  FrontendMonthEndReport,
  ReportStatus,
  PropertyOption
} from "@/integration/supabase/types/month-end-reports";

export interface MonthEndReportFormProps {
  report?: FrontendMonthEndReport;
  onSave: (data: MonthEndReportFormData) => Promise<void>;
  onSubmit?: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onCancel: () => void;
  properties?: PropertyOption[];
  isLoading?: boolean;
}

export const MonthEndReportForm: React.FC<MonthEndReportFormProps> = ({
  report,
  onSave,
  onSubmit,
  onApprove,
  onCancel,
  properties = [],
  isLoading = false
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("summary");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState<NodeJS.Timeout | null>(null);

  const form = useForm<MonthEndReportFormData>({
    resolver: zodResolver(monthEndReportSchema),
    defaultValues: {
      property_name: report?.property_name || "",
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

  const { fields: groupFields, append: appendGroup, remove: removeGroup } = useFieldArray({
    control: form.control,
    name: "groups"
  });

  const { fields: actionItemFields, append: appendActionItem, remove: removeActionItem } = useFieldArray({
    control: form.control,
    name: "action_items"
  });

  // Auto-save functionality
  const triggerAutoSave = useCallback(async () => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    const timeout = setTimeout(async () => {
      try {
        const formData = form.getValues();
        await onSave(formData);
        setLastSaved(new Date());
        toast({
          title: "Auto-saved",
          description: `Saved at ${new Date().toLocaleTimeString()}`,
          duration: 2000
        });
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    }, 3000);

    setAutoSaveTimeout(timeout);
  }, [form, onSave, autoSaveTimeout, toast]);

  // Watch for form changes to trigger auto-save
  useEffect(() => {
    const subscription = form.watch(() => {
      triggerAutoSave();
    });
    return () => subscription.unsubscribe();
  }, [form, triggerAutoSave]);

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

  const handleManualSave = async () => {
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

  const handleSubmitReport = async () => {
    if (!report?.id || !onSubmit) return;
    
    try {
      await onSubmit(report.id);
      toast({
        title: "Submitted",
        description: "Report submitted for approval"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report",
        variant: "destructive"
      });
    }
  };

  const handleApproveReport = async () => {
    if (!report?.id || !onApprove) return;
    
    try {
      await onApprove(report.id);
      toast({
        title: "Approved",
        description: "Report approved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve report",
        variant: "destructive"
      });
    }
  };

  const addGroup = () => {
    appendGroup({
      group_name: "",
      arrival_date: "",
      departure_date: "",
      rooms_blocked: 0,
      notes: ""
    });
  };

  const addActionItem = () => {
    appendActionItem({
      title: "",
      owner: "",
      due_date: "",
      status: "open"
    });
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

  const isReadOnly = report?.status === "approved";

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">
            {report ? "Edit Month-End Report" : "New Month-End Report"}
          </h1>
          <div className="flex items-center gap-4 mt-2">
            {report?.status && getStatusBadge(report.status)}
            {lastSaved && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Save className="h-3 w-3" />
                Saved • {lastSaved.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleManualSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save
          </Button>
          {report?.status === "draft" && onSubmit && (
            <Button onClick={handleSubmitReport} disabled={isLoading}>
              <Send className="h-4 w-4 mr-2" />
              Submit
            </Button>
          )}
          {report?.status === "submitted" && onApprove && (
            <Button onClick={handleApproveReport} disabled={isLoading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Summary
            </TabsTrigger>
            <TabsTrigger value="occupancy" className="flex items-center gap-2">
              <Hotel className="h-4 w-4" />
              Occupancy
            </TabsTrigger>
            <TabsTrigger value="cleanliness" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Cleanliness
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Groups
            </TabsTrigger>
            <TabsTrigger value="staffing" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Staffing
            </TabsTrigger>
          </TabsList>

          {/* Meta Information Card */}
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

          {/* Tab Contents */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
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
          </TabsContent>

          <TabsContent value="occupancy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Hotel Occupancy</CardTitle>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cleanliness" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Guest Room Cleanliness</CardTitle>
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
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="groups" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Groups In-House</CardTitle>
                    <CardDescription>Groups staying during the reporting period</CardDescription>
                  </div>
                  {!isReadOnly && (
                    <Button onClick={addGroup} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Group
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {groupFields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No groups added yet</p>
                ) : (
                  <div className="space-y-4">
                    {groupFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Group {index + 1}</h4>
                          {!isReadOnly && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeGroup(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2">
                            <Label>Group Name *</Label>
                            <Input
                              {...form.register(`groups.${index}.group_name`)}
                              disabled={isReadOnly}
                              placeholder="Group name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Arrival Date *</Label>
                            <Input
                              type="date"
                              {...form.register(`groups.${index}.arrival_date`)}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Departure Date *</Label>
                            <Input
                              type="date"
                              {...form.register(`groups.${index}.departure_date`)}
                              disabled={isReadOnly}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rooms Blocked</Label>
                            <Input
                              type="number"
                              min="0"
                              {...form.register(`groups.${index}.rooms_blocked`, { valueAsNumber: true })}
                              disabled={isReadOnly}
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Notes</Label>
                          <Textarea
                            {...form.register(`groups.${index}.notes`)}
                            disabled={isReadOnly}
                            placeholder="Additional notes about this group..."
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staffing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Staffing & Notes</CardTitle>
                <CardDescription>Training, absenteeism, incidents, and action items</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="training_updates">Training Updates</Label>
                  <Textarea
                    id="training_updates"
                    {...form.register("training_updates")}
                    disabled={isReadOnly}
                    placeholder="Training updates and progress..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="absenteeism_notes">Absenteeism Notes</Label>
                  <Textarea
                    id="absenteeism_notes"
                    {...form.register("absenteeism_notes")}
                    disabled={isReadOnly}
                    placeholder="Notes about staff absenteeism..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incidents">Incidents</Label>
                  <Textarea
                    id="incidents"
                    {...form.register("incidents")}
                    disabled={isReadOnly}
                    placeholder="Any incidents that occurred..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Action Items</CardTitle>
                    <CardDescription>Track action items and their progress</CardDescription>
                  </div>
                  {!isReadOnly && (
                    <Button onClick={addActionItem} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Action Item
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {actionItemFields.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No action items added yet</p>
                ) : (
                  <div className="space-y-4">
                    {actionItemFields.map((field, index) => (
                      <div key={field.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">Action Item {index + 1}</h4>
                          {!isReadOnly && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeActionItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="space-y-2 lg:col-span-2">
                            <Label>Title *</Label>
                            <Input
                              {...form.register(`action_items.${index}.title`)}
                              disabled={isReadOnly}
                              placeholder="Action item description"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Owner</Label>
                            <Input
                              {...form.register(`action_items.${index}.owner`)}
                              disabled={isReadOnly}
                              placeholder="Responsible person"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                              type="date"
                              {...form.register(`action_items.${index}.due_date`)}
                              disabled={isReadOnly}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Status</Label>
                          <Select
                            value={form.watch(`action_items.${index}.status`)}
                            onValueChange={(value) => form.setValue(`action_items.${index}.status`, value as any)}
                            disabled={isReadOnly}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Open</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MonthEndReportForm;
