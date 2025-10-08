import React from "react";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Calendar, Users } from "lucide-react";
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

  const totalRoomsBlocked = fields.reduce((total, _, index) => {
    const roomsBlocked = form.watch(`groups.${index}.rooms_blocked`) || 0;
    return total + roomsBlocked;
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Groups In-House</h3>
          <p className="text-sm text-muted-foreground">
            Groups staying during the reporting period
          </p>
        </div>
        <div className="flex items-center gap-4">
          {fields.length > 0 && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {fields.length} Groups • {totalRoomsBlocked} Rooms
            </Badge>
          )}
          {!isReadOnly && (
            <Button onClick={addGroup} size="sm" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Group
            </Button>
          )}
        </div>
      </div>
      
      <Separator />

      <div className="space-y-6">
        {fields.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No groups added yet</p>
            {!isReadOnly && (
              <Button onClick={addGroup} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Group
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded-lg p-6 space-y-6 bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {form.watch(`groups.${index}.group_name`) || `Group ${index + 1}`}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {form.watch(`groups.${index}.rooms_blocked`) || 0} rooms blocked
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

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Group Name *</Label>
                    <Input
                      {...form.register(`groups.${index}.group_name`)}
                      disabled={isReadOnly}
                      placeholder="Enter group name"
                      className="h-10"
                    />
                    {form.formState.errors.groups?.[index]?.group_name && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.groups[index]?.group_name?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Arrival Date *
                    </Label>
                    <Input
                      type="date"
                      {...form.register(`groups.${index}.arrival_date`)}
                      disabled={isReadOnly}
                      className="h-10"
                    />
                    {form.formState.errors.groups?.[index]?.arrival_date && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.groups[index]?.arrival_date?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Departure Date *
                    </Label>
                    <Input
                      type="date"
                      {...form.register(`groups.${index}.departure_date`)}
                      disabled={isReadOnly}
                      className="h-10"
                    />
                    {form.formState.errors.groups?.[index]?.departure_date && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.groups[index]?.departure_date?.message}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Rooms Blocked</Label>
                    <Input
                      type="number"
                      min="0"
                      {...form.register(`groups.${index}.rooms_blocked`, { valueAsNumber: true })}
                      disabled={isReadOnly}
                      placeholder="0"
                      className="h-10"
                    />
                    {form.formState.errors.groups?.[index]?.rooms_blocked && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.groups[index]?.rooms_blocked?.message}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Additional Notes</Label>
                  <Textarea
                    {...form.register(`groups.${index}.notes`)}
                    disabled={isReadOnly}
                    placeholder="Add any special requirements, preferences, or important details about this group..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsTab;
