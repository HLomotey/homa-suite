import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  FileText,
  Hotel,
  Sparkles,
  Users,
  Target,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { MonthEndReportFormData, GroupFormData, ActionItemFormData } from "../../schemas/monthEndReportSchema";

interface UnifiedReportFormProps {
  form: UseFormReturn<MonthEndReportFormData>;
  isReadOnly?: boolean;
}

export const UnifiedReportForm: React.FC<UnifiedReportFormProps> = ({
  form,
  isReadOnly = false
}) => {
  const { control, watch, setValue, getValues } = form;

  // Watch for dynamic arrays
  const groups = watch("groups") || [];
  const actionItems = watch("action_items") || [];
  const keyRisks = watch("key_risks") || [];
  const keyWins = watch("key_wins") || [];

  // Helper functions for dynamic arrays
  const addGroup = () => {
    const newGroup: GroupFormData = {
      id: `temp-${Date.now()}`,
      group_name: "",
      arrival_date: "",
      departure_date: "",
      rooms_blocked: 0,
      notes: ""
    };
    setValue("groups", [...groups, newGroup]);
  };

  const removeGroup = (index: number) => {
    const updatedGroups = groups.filter((_, i) => i !== index);
    setValue("groups", updatedGroups);
  };

  const addActionItem = () => {
    const newActionItem: ActionItemFormData = {
      id: `temp-${Date.now()}`,
      title: "",
      owner: "",
      due_date: "",
      status: "open"
    };
    setValue("action_items", [...actionItems, newActionItem]);
  };

  const removeActionItem = (index: number) => {
    const updatedItems = actionItems.filter((_, i) => i !== index);
    setValue("action_items", updatedItems);
  };

  const addKeyRisk = () => {
    setValue("key_risks", [...keyRisks, ""]);
  };

  const removeKeyRisk = (index: number) => {
    const updatedRisks = keyRisks.filter((_, i) => i !== index);
    setValue("key_risks", updatedRisks);
  };

  const addKeyWin = () => {
    setValue("key_wins", [...keyWins, ""]);
  };

  const removeKeyWin = (index: number) => {
    const updatedWins = keyWins.filter((_, i) => i !== index);
    setValue("key_wins", updatedWins);
  };

  return (
    <Form {...form}>
      <div className="space-y-6">
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

            {/* Key Risks */}
            <div>
              <Label className="text-sm font-medium">Key Risks</Label>
              <div className="space-y-2 mt-2">
                {keyRisks.map((risk, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={risk}
                      onChange={(e) => {
                        const updatedRisks = [...keyRisks];
                        updatedRisks[index] = e.target.value;
                        setValue("key_risks", updatedRisks);
                      }}
                      placeholder="Enter a key risk"
                      disabled={isReadOnly}
                      className="flex-1"
                    />
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeKeyRisk(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addKeyRisk}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key Risk
                  </Button>
                )}
              </div>
            </div>

            {/* Key Wins */}
            <div>
              <Label className="text-sm font-medium">Key Wins</Label>
              <div className="space-y-2 mt-2">
                {keyWins.map((win, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={win}
                      onChange={(e) => {
                        const updatedWins = [...keyWins];
                        updatedWins[index] = e.target.value;
                        setValue("key_wins", updatedWins);
                      }}
                      placeholder="Enter a key win"
                      disabled={isReadOnly}
                      className="flex-1"
                    />
                    {!isReadOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeKeyWin(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {!isReadOnly && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addKeyWin}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Key Win
                  </Button>
                )}
              </div>
            </div>
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
                        disabled={true} // Always read-only as it's calculated
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

        {/* Groups Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Groups
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {groups.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No groups added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {groups.map((group, index) => (
                  <Card key={group.id || index} className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        <div>
                          <Label>Group Name *</Label>
                          <Input
                            value={group.group_name}
                            onChange={(e) => {
                              const updatedGroups = [...groups];
                              updatedGroups[index] = { ...group, group_name: e.target.value };
                              setValue("groups", updatedGroups);
                            }}
                            placeholder="Enter group name"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Arrival Date *</Label>
                          <Input
                            type="date"
                            value={group.arrival_date}
                            onChange={(e) => {
                              const updatedGroups = [...groups];
                              updatedGroups[index] = { ...group, arrival_date: e.target.value };
                              setValue("groups", updatedGroups);
                            }}
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Departure Date *</Label>
                          <Input
                            type="date"
                            value={group.departure_date}
                            onChange={(e) => {
                              const updatedGroups = [...groups];
                              updatedGroups[index] = { ...group, departure_date: e.target.value };
                              setValue("groups", updatedGroups);
                            }}
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Rooms Blocked *</Label>
                          <Input
                            type="number"
                            min="0"
                            value={group.rooms_blocked}
                            onChange={(e) => {
                              const updatedGroups = [...groups];
                              updatedGroups[index] = { ...group, rooms_blocked: parseInt(e.target.value) || 0 };
                              setValue("groups", updatedGroups);
                            }}
                            placeholder="0"
                            disabled={isReadOnly}
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <Label>Notes</Label>
                        <Textarea
                          value={group.notes || ""}
                          onChange={(e) => {
                            const updatedGroups = [...groups];
                            updatedGroups[index] = { ...group, notes: e.target.value };
                            setValue("groups", updatedGroups);
                          }}
                          placeholder="Add notes about this group"
                          disabled={isReadOnly}
                        />
                      </div>
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeGroup(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Group
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={addGroup}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Group
              </Button>
            )}
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

        {/* Action Items Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Action Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {actionItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No action items added yet.
              </p>
            ) : (
              <div className="space-y-4">
                {actionItems.map((item, index) => (
                  <Card key={item.id || index} className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <Label>Title *</Label>
                          <Input
                            value={item.title}
                            onChange={(e) => {
                              const updatedItems = [...actionItems];
                              updatedItems[index] = { ...item, title: e.target.value };
                              setValue("action_items", updatedItems);
                            }}
                            placeholder="Enter action item title"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Owner</Label>
                          <Input
                            value={item.owner || ""}
                            onChange={(e) => {
                              const updatedItems = [...actionItems];
                              updatedItems[index] = { ...item, owner: e.target.value };
                              setValue("action_items", updatedItems);
                            }}
                            placeholder="Assign to"
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Due Date</Label>
                          <Input
                            type="date"
                            value={item.due_date || ""}
                            onChange={(e) => {
                              const updatedItems = [...actionItems];
                              updatedItems[index] = { ...item, due_date: e.target.value };
                              setValue("action_items", updatedItems);
                            }}
                            disabled={isReadOnly}
                          />
                        </div>
                        <div>
                          <Label>Status</Label>
                          <Select
                            value={item.status}
                            onValueChange={(value: "open" | "in_progress" | "done") => {
                              const updatedItems = [...actionItems];
                              updatedItems[index] = { ...item, status: value };
                              setValue("action_items", updatedItems);
                            }}
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
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeActionItem(index)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove Action Item
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {!isReadOnly && (
              <Button
                type="button"
                variant="outline"
                onClick={addActionItem}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Action Item
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </Form>
  );
};
