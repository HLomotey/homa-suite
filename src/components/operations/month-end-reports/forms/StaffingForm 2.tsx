import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Plus, Trash2 } from "lucide-react";
import { MonthEndReportFormData } from "../schemas/monthEndReportSchema";

interface StaffingFormProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const StaffingForm: React.FC<StaffingFormProps> = ({ form, isReadOnly = false }) => {
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

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Staffing & Notes
          </CardTitle>
          <CardDescription>Training, absenteeism, and incidents</CardDescription>
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
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Action Items
              </CardTitle>
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
          {fields.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No action items added yet</p>
          ) : (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Action Item {index + 1}</h4>
                    {!isReadOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => remove(index)}
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
                      {form.formState.errors.action_items?.[index]?.title && (
                        <p className="text-sm text-red-600">
                          {form.formState.errors.action_items[index]?.title?.message}
                        </p>
                      )}
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
    </>
  );
};

export default StaffingForm;
