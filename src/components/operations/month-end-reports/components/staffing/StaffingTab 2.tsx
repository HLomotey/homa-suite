import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Target, Plus, Trash2, Calendar, User, AlertCircle, BookOpen, UserX, Users } from "lucide-react";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";

interface StaffingTabProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const StaffingTab: React.FC<StaffingTabProps> = ({ form, isReadOnly = false }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "action_items"
  });

  const addActionItem = () => {
    append({
      title: "",
      owner: "",
      due_date: "",
      status: "open"
    });
  };

  const openItems = fields.filter((_, index) => form.watch(`action_items.${index}.status`) === "open").length;
  const inProgressItems = fields.filter((_, index) => form.watch(`action_items.${index}.status`) === "in_progress").length;
  const completedItems = fields.filter((_, index) => form.watch(`action_items.${index}.status`) === "done").length;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Staffing & Operations</h3>
        <p className="text-sm text-muted-foreground">
          Document staff training, attendance issues, incidents, and track action items
        </p>
      </div>
      
      <Separator />
      
      <div className="space-y-6">
        {/* Staffing Information */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Staff Management
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="training_updates" className="text-sm font-medium flex items-center gap-1">
                <BookOpen className="h-3 w-3" />
                Training Updates
              </Label>
              <Textarea
                id="training_updates"
                {...form.register("training_updates")}
                disabled={isReadOnly}
                placeholder="Document training sessions completed, certifications earned, skill development programs, or upcoming training needs..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Include details about staff development, certifications, or training initiatives
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="absenteeism_notes" className="text-sm font-medium flex items-center gap-1">
                <UserX className="h-3 w-3" />
                Absenteeism Notes
              </Label>
              <Textarea
                id="absenteeism_notes"
                {...form.register("absenteeism_notes")}
                disabled={isReadOnly}
                placeholder="Record attendance patterns, staffing challenges, coverage issues, or any notable absences that impacted operations..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Note any staffing shortages, patterns, or coverage challenges
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="incidents" className="text-sm font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Incidents & Issues
              </Label>
              <Textarea
                id="incidents"
                {...form.register("incidents")}
                disabled={isReadOnly}
                placeholder="Document any workplace incidents, safety issues, guest complaints, equipment failures, or operational disruptions..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Record incidents, safety issues, or operational disruptions
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Action Items Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Action Items
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Track follow-up actions and their completion status
              </p>
            </div>
            <div className="flex items-center gap-4">
              {fields.length > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {openItems} Open
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {inProgressItems} In Progress
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {completedItems} Done
                  </Badge>
                </div>
              )}
              {!isReadOnly && (
                <Button onClick={addActionItem} size="sm" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Action Item
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {fields.length === 0 ? (
              <div className="text-center py-12">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No action items added yet</p>
                {!isReadOnly && (
                  <Button onClick={addActionItem} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Action Item
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {fields.map((field, index) => {
                  const status = form.watch(`action_items.${index}.status`);
                  const getStatusColor = () => {
                    switch (status) {
                      case "done": return "bg-green-50 border-green-200";
                      case "in_progress": return "bg-blue-50 border-blue-200";
                      default: return "bg-card border-border";
                    }
                  };

                  return (
                    <div key={field.id} className={`border rounded-lg p-6 space-y-4 ${getStatusColor()}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium">
                              {form.watch(`action_items.${index}.title`) || `Action Item ${index + 1}`}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {form.watch(`action_items.${index}.owner`) && `Assigned to ${form.watch(`action_items.${index}.owner`)}`}
                            </p>
                          </div>
                        </div>
                        {!isReadOnly && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => remove(index)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2 lg:col-span-2">
                          <Label className="text-sm font-medium">Action Item Title *</Label>
                          <Input
                            {...form.register(`action_items.${index}.title`)}
                            disabled={isReadOnly}
                            placeholder="Describe the action that needs to be taken..."
                            className="h-10"
                          />
                          {form.formState.errors.action_items?.[index]?.title && (
                            <p className="text-sm text-destructive">
                              {form.formState.errors.action_items[index]?.title?.message}
                            </p>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Owner
                          </Label>
                          <Input
                            {...form.register(`action_items.${index}.owner`)}
                            disabled={isReadOnly}
                            placeholder="Responsible person"
                            className="h-10"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-sm font-medium flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due Date
                          </Label>
                          <Input
                            type="date"
                            {...form.register(`action_items.${index}.due_date`)}
                            disabled={isReadOnly}
                            className="h-10"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Status</Label>
                        <Select
                          value={form.watch(`action_items.${index}.status`)}
                          onValueChange={(value) => form.setValue(`action_items.${index}.status`, value as any)}
                          disabled={isReadOnly}
                        >
                          <SelectTrigger className="h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">🔴 Open</SelectItem>
                            <SelectItem value="in_progress">🟡 In Progress</SelectItem>
                            <SelectItem value="done">🟢 Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffingTab;
