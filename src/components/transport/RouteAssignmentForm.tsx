import * as React from "react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FrontendRouteAssignment, 
  FrontendCombinedRoute 
} from "@/integration/supabase/types/transport-route";
import { Calendar, Car, User } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useCombinedRoute } from "@/hooks/transport/useCombinedRoute";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mock data for vehicles and drivers
const mockVehicles = [
  { id: "1", info: "Toyota Hiace (ABC123)" },
  { id: "2", info: "Ford Transit (DEF456)" },
  { id: "3", info: "Mercedes Sprinter (GHI789)" },
];

const mockDrivers = [
  { id: "driver-1", name: "John Driver" },
  { id: "driver-2", name: "Jane Driver" },
  { id: "driver-3", name: "Sam Driver" },
];

interface RouteAssignmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingAssignment?: FrontendRouteAssignment | null;
}

export function RouteAssignmentForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  editingAssignment 
}: RouteAssignmentFormProps) {
  const { combinedRoutes } = useCombinedRoute();
  
  const [combinedRouteId, setCombinedRouteId] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened or when editing assignment changes
  useEffect(() => {
    if (open) {
      if (editingAssignment) {
        setCombinedRouteId(editingAssignment.combinedRouteId);
        setVehicleId(editingAssignment.vehicleId);
        setDriverId(editingAssignment.driverId);
        setStartDate(editingAssignment.startDate ? new Date(editingAssignment.startDate) : new Date());
        setEndDate(editingAssignment.endDate ? new Date(editingAssignment.endDate) : undefined);
        setNotes(editingAssignment.notes || "");
      } else {
        setCombinedRouteId(combinedRoutes.length > 0 ? combinedRoutes[0].id : "");
        setVehicleId(mockVehicles.length > 0 ? mockVehicles[0].id : "");
        setDriverId(mockDrivers.length > 0 ? mockDrivers[0].id : "");
        setStartDate(new Date());
        setEndDate(undefined);
        setNotes("");
      }
    }
  }, [open, editingAssignment, combinedRoutes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!combinedRouteId) {
      toast({
        title: "Validation Error",
        description: "Please select a combined route",
        variant: "destructive",
      });
      return;
    }

    if (!vehicleId) {
      toast({
        title: "Validation Error",
        description: "Please select a vehicle",
        variant: "destructive",
      });
      return;
    }

    if (!driverId) {
      toast({
        title: "Validation Error",
        description: "Please select a driver",
        variant: "destructive",
      });
      return;
    }

    if (!startDate) {
      toast({
        title: "Validation Error",
        description: "Start date is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would call the API
      // For now, we just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Success",
        description: editingAssignment 
          ? "Route assignment updated successfully" 
          : "Route assignment created successfully",
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error submitting route assignment:", error);
      toast({
        title: "Error",
        description: editingAssignment 
          ? "Failed to update route assignment" 
          : "Failed to create route assignment",
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
          <SheetTitle>
            {editingAssignment ? "Edit Route Assignment" : "Assign Route"}
          </SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label htmlFor="combinedRoute">Combined Route</Label>
            <Select
              value={combinedRouteId}
              onValueChange={setCombinedRouteId}
              disabled={isSubmitting}
            >
              <SelectTrigger id="combinedRoute">
                <SelectValue placeholder="Select a combined route" />
              </SelectTrigger>
              <SelectContent>
                {combinedRoutes.map((route) => (
                  <SelectItem key={route.id} value={route.id}>
                    {route.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle</Label>
            <Select
              value={vehicleId}
              onValueChange={setVehicleId}
              disabled={isSubmitting}
            >
              <SelectTrigger id="vehicle" className="flex items-center">
                <Car className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {mockVehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.info}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="driver">Driver</Label>
            <Select
              value={driverId}
              onValueChange={setDriverId}
              disabled={isSubmitting}
            >
              <SelectTrigger id="driver" className="flex items-center">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Select a driver" />
              </SelectTrigger>
              <SelectContent>
                {mockDrivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    {driver.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="endDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                    disabled={isSubmitting}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => 
                      startDate ? date < startDate : false
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions or notes"
              disabled={isSubmitting}
            />
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
              {isSubmitting 
                ? "Saving..." 
                : editingAssignment 
                  ? "Update Assignment" 
                  : "Create Assignment"
              }
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
