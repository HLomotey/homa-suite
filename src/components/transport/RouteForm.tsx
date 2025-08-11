import * as React from "react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FrontendRoute, FrontendRouteSchedule } from "@/integration/supabase/types/transport-route";
import { Trash2, Plus, Clock } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

interface RouteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingRoute?: FrontendRoute | null;
}

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

export function RouteForm({ open, onOpenChange, onSuccess, editingRoute }: RouteFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [schedules, setSchedules] = useState<Array<{
    id?: string;
    day: string;
    startTime: string;
    endTime: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened or when editing route changes
  useEffect(() => {
    if (open) {
      if (editingRoute) {
        setName(editingRoute.name);
        setDescription(editingRoute.description);
        setSchedules(
          editingRoute.schedules.map((schedule) => ({
            id: schedule.id,
            day: schedule.day,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
          }))
        );
      } else {
        setName("");
        setDescription("");
        setSchedules([{ day: "Monday", startTime: "06:00", endTime: "06:30" }]);
      }
    }
  }, [open, editingRoute]);

  const handleAddSchedule = () => {
    setSchedules([...schedules, { day: "Monday", startTime: "06:00", endTime: "06:30" }]);
  };

  const handleRemoveSchedule = (index: number) => {
    const newSchedules = [...schedules];
    newSchedules.splice(index, 1);
    setSchedules(newSchedules);
  };

  const handleScheduleChange = (index: number, field: string, value: string) => {
    const newSchedules = [...schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };
    setSchedules(newSchedules);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Route name is required",
        variant: "destructive",
      });
      return;
    }

    if (schedules.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one schedule is required",
        variant: "destructive",
      });
      return;
    }

    for (const schedule of schedules) {
      if (!schedule.day || !schedule.startTime || !schedule.endTime) {
        toast({
          title: "Validation Error",
          description: "All schedule fields are required",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would call the API
      // For now, we just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Success",
        description: editingRoute 
          ? "Route updated successfully" 
          : "Route created successfully",
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error submitting route:", error);
      toast({
        title: "Error",
        description: editingRoute 
          ? "Failed to update route" 
          : "Failed to create route",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{editingRoute ? "Edit Route" : "Create New Route"}</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name">Route Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 75 Polani"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Route description"
              disabled={isSubmitting}
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Schedules</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddSchedule}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Schedule
              </Button>
            </div>
            
            {schedules.map((schedule, index) => (
              <div key={index} className="space-y-2 p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Schedule {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveSchedule(index)}
                    disabled={isSubmitting || schedules.length === 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`day-${index}`}>Day</Label>
                    <Select
                      value={schedule.day}
                      onValueChange={(value) => handleScheduleChange(index, "day", value)}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger id={`day-${index}`}>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS_OF_WEEK.map((day) => (
                          <SelectItem key={day} value={day}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`startTime-${index}`}>Start Time</Label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id={`startTime-${index}`}
                        type="time"
                        value={schedule.startTime}
                        onChange={(e) => handleScheduleChange(index, "startTime", e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor={`endTime-${index}`}>End Time</Label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id={`endTime-${index}`}
                        type="time"
                        value={schedule.endTime}
                        onChange={(e) => handleScheduleChange(index, "endTime", e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : editingRoute ? "Update Route" : "Create Route"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
