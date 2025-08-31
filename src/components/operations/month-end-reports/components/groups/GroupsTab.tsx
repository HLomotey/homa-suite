import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Plus, Trash2 } from "lucide-react";
import { MonthEndReportFormData } from "../../schemas/monthEndReportSchema";

interface GroupsTabProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const GroupsTab: React.FC<GroupsTabProps> = ({ form, isReadOnly = false }) => {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "groups"
  });

  const addGroup = () => {
    append({
      group_name: "",
      arrival_date: "",
      departure_date: "",
      rooms_blocked: 0,
      notes: ""
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Groups In-House
            </CardTitle>
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
        {fields.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No groups added yet</p>
        ) : (
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Group {index + 1}</h4>
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
                  <div className="space-y-2">
                    <Label>Group Name *</Label>
                    <Input
                      {...form.register(`groups.${index}.group_name`)}
                      disabled={isReadOnly}
                      placeholder="Group name"
                    />
                    {form.formState.errors.groups?.[index]?.group_name && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.groups[index]?.group_name?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Arrival Date *</Label>
                    <Input
                      type="date"
                      {...form.register(`groups.${index}.arrival_date`)}
                      disabled={isReadOnly}
                    />
                    {form.formState.errors.groups?.[index]?.arrival_date && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.groups[index]?.arrival_date?.message}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Departure Date *</Label>
                    <Input
                      type="date"
                      {...form.register(`groups.${index}.departure_date`)}
                      disabled={isReadOnly}
                    />
                    {form.formState.errors.groups?.[index]?.departure_date && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.groups[index]?.departure_date?.message}
                      </p>
                    )}
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
                    {form.formState.errors.groups?.[index]?.rooms_blocked && (
                      <p className="text-sm text-red-600">
                        {form.formState.errors.groups[index]?.rooms_blocked?.message}
                      </p>
                    )}
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
  );
};

export default GroupsTab;
