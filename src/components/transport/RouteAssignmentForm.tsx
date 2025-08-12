import * as React from "react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FrontendRouteAssignment, 
  FrontendCombinedRoute,
  FrontendRoute
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
import { useRoute } from "@/hooks/transport/useRoute";
import { useRouteAssignment } from "@/hooks/transport/useRouteAssignment";
import { useVehicle } from "@/hooks/transport/useVehicle";
import { useDrivers } from "@/hooks/billing/useStaff";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Type for route selection
type RouteType = "regular" | "combined";

interface RouteOption {
  id: string;
  name: string;
  type: RouteType;
}

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
  // Load both regular routes and combined routes
  const { combinedRoutes, loading: loadingCombinedRoutes } = useCombinedRoute(false); // false to use real data
  const { routes, loading: loadingRoutes } = useRoute(false); // false to use real data
  const { addAssignment, editAssignment } = useRouteAssignment(false); // false to use real data
  const { vehicles, loading: loadingVehicles, getVehicles } = useVehicle();
  const { drivers, loading: loadingDrivers } = useDrivers();
  
  // State for route selection
  const [routeType, setRouteType] = useState<RouteType>("combined");
  const [routeId, setRouteId] = useState("");
  const [routeOptions, setRouteOptions] = useState<RouteOption[]>([]);
  
  // Other form state
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch vehicles when component mounts
  useEffect(() => {
    if (open) {
      getVehicles();
    }
  }, [open, getVehicles]);

  // Combine routes into options when routes or combined routes change
  useEffect(() => {
    const options: RouteOption[] = [];
    
    // Add regular routes
    if (routes && routes.length > 0) {
      routes.forEach(route => {
        options.push({
          id: route.id,
          name: route.name,
          type: "regular"
        });
      });
    }
    
    // Add combined routes
    if (combinedRoutes && combinedRoutes.length > 0) {
      combinedRoutes.forEach(combinedRoute => {
        options.push({
          id: combinedRoute.id,
          name: combinedRoute.name,
          type: "combined"
        });
      });
    }
    
    setRouteOptions(options);
    
    // Set default route if available
    if (options.length > 0 && !routeId) {
      setRouteId(options[0].id);
      setRouteType(options[0].type);
    }
  }, [routes, combinedRoutes, routeId]);
  
  // Reset form when opened or when editing assignment changes
  useEffect(() => {
    if (open) {
      if (editingAssignment) {
        // For editing, we need to determine if it's a regular or combined route
        if (editingAssignment.combinedRouteId) {
          setRouteType("combined");
          setRouteId(editingAssignment.combinedRouteId);
        } else if (editingAssignment.routeId) {
          setRouteType("regular");
          setRouteId(editingAssignment.routeId);
        }
        
        setVehicleId(editingAssignment.vehicleId);
        setDriverId(editingAssignment.driverId);
        setStartDate(editingAssignment.startDate ? new Date(editingAssignment.startDate) : new Date());
        setEndDate(editingAssignment.endDate ? new Date(editingAssignment.endDate) : undefined);
        setNotes(editingAssignment.notes || "");
      } else {
        // For new assignments, use the first available route option
        if (routeOptions.length > 0) {
          setRouteId(routeOptions[0].id);
          setRouteType(routeOptions[0].type);
        } else {
          setRouteId("");
          setRouteType("combined");
        }
        
        setVehicleId(vehicles.length > 0 ? vehicles[0].id : "");
        setDriverId(drivers.length > 0 ? drivers[0].id : "");
        setStartDate(new Date());
        setEndDate(undefined);
        setNotes("");
      }
    }
  }, [open, editingAssignment, routeOptions, vehicles, drivers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!routeId) {
      toast({
        title: "Validation Error",
        description: "Please select a route",
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
      // Prepare assignment data based on route type
      const assignmentData: Omit<FrontendRouteAssignment, 'id' | 'executionLogs'> = {
        vehicleId,
        driverId,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : null,
        status: 'scheduled' as const,
        notes: notes || '',
      };
      
      // Add the appropriate route ID and name based on type
      if (routeType === 'combined') {
        const selectedRoute = combinedRoutes.find(r => r.id === routeId);
        assignmentData.combinedRouteId = routeId;
        assignmentData.combinedRouteName = selectedRoute?.name || '';
      } else {
        const selectedRoute = routes.find(r => r.id === routeId);
        assignmentData.routeId = routeId;
        assignmentData.routeName = selectedRoute?.name || '';
      }
      
      // Save to database
      if (editingAssignment) {
        await editAssignment(editingAssignment.id, assignmentData);
      } else {
        await addAssignment(assignmentData);
      }
      
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
      <SheetContent className="w-full sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {editingAssignment ? "Edit Route Assignment" : "New Route Assignment"}
          </SheetTitle>
          <SheetDescription>
            {editingAssignment 
              ? "Modify the details of this route assignment including route, vehicle, driver, and schedule." 
              : "Create a new route assignment by selecting a route, vehicle, driver, and setting the schedule."
            }
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="routeType">Route Type</Label>
            <Select 
              value={routeType} 
              onValueChange={(value: RouteType) => setRouteType(value)}
            >
              <SelectTrigger id="routeType" aria-label="Route Type">
                <SelectValue placeholder="Select route type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="regular">Regular Route</SelectItem>
                <SelectItem value="combined">Combined Route</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="routeId">Route</Label>
            <Select 
              value={routeId} 
              onValueChange={setRouteId}
            >
              <SelectTrigger id="routeId" aria-label="Route Selection">
                <SelectValue placeholder="Select a route" />
              </SelectTrigger>
              <SelectContent>
                {routeOptions
                  .filter(route => route.type === routeType)
                  .map((route) => (
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
              <SelectTrigger id="vehicle" disabled={loadingVehicles} aria-label="Vehicle Selection">
                <SelectValue placeholder={loadingVehicles ? "Loading vehicles..." : "Select a vehicle"} />
              </SelectTrigger>
              <SelectContent>
                {loadingVehicles ? (
                  <div className="flex items-center justify-center p-2" role="status" aria-live="polite">
                    <div className="animate-spin mr-2">
                      <Car size={16} />
                    </div>
                    Loading vehicles...
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground" role="status">No vehicles available</div>
                ) : (
                  vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.make} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="driver">Driver</Label>
            <Select
              value={driverId}
              onValueChange={setDriverId}
              disabled={isSubmitting || loadingDrivers}
            >
              <SelectTrigger id="driver" className="flex items-center" aria-label="Driver Selection">
                <User className="h-4 w-4 mr-2" />
                <SelectValue placeholder={loadingDrivers ? "Loading drivers..." : "Select a driver"} />
              </SelectTrigger>
              <SelectContent>
                {loadingDrivers ? (
                  <div className="flex items-center justify-center p-2" role="status" aria-live="polite">
                    <div className="animate-spin mr-2">
                      <User size={16} />
                    </div>
                    Loading drivers...
                  </div>
                ) : drivers.length === 0 ? (
                  <div className="p-2 text-center text-muted-foreground" role="status">No drivers available</div>
                ) : (
                  drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.legalName || driver.preferredName || `Driver ${driver.id.slice(0, 8)}`}
                    </SelectItem>
                  ))
                )}
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
                    aria-label="Select start date"
                    aria-haspopup="dialog"
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
                    aria-label="Select end date"
                    aria-haspopup="dialog"
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
              aria-label="Assignment notes"
              aria-describedby="notes-description"
            />
            <div id="notes-description" className="sr-only">Enter any special instructions or notes for this route assignment</div>
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
