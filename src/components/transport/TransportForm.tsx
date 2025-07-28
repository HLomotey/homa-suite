import { useState, useEffect } from "react";
import { FrontendVehicle, FrontendTransportStaff } from "@/integration/supabase/types";
import { useCreateVehicle, useUpdateVehicle, useTransportStaff } from "@/hooks/transport";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter,
  SheetClose
} from "@/components/ui/sheet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Car, Truck, Bus } from "lucide-react";

interface TransportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingVehicle?: FrontendVehicle | null;
}

export function TransportForm({ open, onOpenChange, onSuccess, editingVehicle }: TransportFormProps) {
  // Fetch staff using hook
  const { staff, loading: staffLoading, error: staffError } = useTransportStaff();
  
  // Create and update hooks
  const { create, loading: createLoading, error: createError } = useCreateVehicle();
  const { update, loading: updateLoading, error: updateError } = useUpdateVehicle();
  
  const isEditing = !!editingVehicle;
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [staffId, setStaffId] = useState("");
  const [vehicleType, setVehicleType] = useState<FrontendVehicle["type"]>("car");
  const [status, setStatus] = useState<FrontendVehicle["status"]>("active");
  const [lastService, setLastService] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Populate form when editing
  useEffect(() => {
    if (editingVehicle) {
      setModel(editingVehicle.model);
      setPlateNumber(editingVehicle.plateNumber);
      setStaffId(editingVehicle.staffId);
      setVehicleType(editingVehicle.type);
      setStatus(editingVehicle.status);
      setLastService(new Date(editingVehicle.lastService));
    } else {
      resetForm();
    }
  }, [editingVehicle]);
  
  // Handle errors
  useEffect(() => {
    if (createError) {
      console.error("Error creating vehicle:", createError);
      toast({
        title: "Error",
        description: "Failed to create vehicle. Please try again.",
        variant: "destructive",
      });
    }
    
    if (updateError) {
      console.error("Error updating vehicle:", updateError);
      toast({
        title: "Error",
        description: "Failed to update vehicle. Please try again.",
        variant: "destructive",
      });
    }
    
    if (staffError) {
      console.error("Error fetching staff:", staffError);
      toast({
        title: "Error",
        description: "Failed to load staff data.",
        variant: "destructive",
      });
    }
  }, [createError, updateError, staffError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const vehicleData = {
        staffId,
        model,
        plateNumber,
        status,
        lastService: lastService.toISOString().split('T')[0],
        type: vehicleType
      };
      
      if (isEditing && editingVehicle) {
        // Update existing vehicle
        await update(editingVehicle.id, vehicleData);
        toast({
          title: "Success",
          description: "Vehicle updated successfully",
        });
      } else {
        // Create new vehicle
        await create(vehicleData);
        toast({
          title: "Success",
          description: "Vehicle created successfully",
        });
      }
      
      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error submitting vehicle:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setModel("");
    setPlateNumber("");
    setStaffId("");
    setVehicleType("car");
    setStatus("active");
    setLastService(new Date());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="bg-black/90 border-white/10 text-white">
        <SheetHeader>
          <SheetTitle className="text-white">{isEditing ? 'Edit Vehicle' : 'Add New Vehicle'}</SheetTitle>
          <SheetDescription className="text-white/60">
            {isEditing ? 'Update the vehicle details.' : 'Fill in the details to add a new vehicle to the fleet.'}
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label htmlFor="model">Vehicle Model</Label>
            <Input
              id="model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. Toyota Camry"
              className="bg-black/40 border-white/10"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="plateNumber">Plate Number</Label>
            <Input
              id="plateNumber"
              value={plateNumber}
              onChange={(e) => setPlateNumber(e.target.value)}
              placeholder="e.g. ABC123"
              className="bg-black/40 border-white/10"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vehicleType">Vehicle Type</Label>
            <Select value={vehicleType} onValueChange={(value) => setVehicleType(value as FrontendVehicle["type"])}>
              <SelectTrigger className="bg-black/40 border-white/10">
                <SelectValue placeholder="Select vehicle type" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                <SelectItem value="car" className="flex items-center gap-2">
                  <Car className="h-4 w-4" /> Car
                </SelectItem>
                <SelectItem value="truck" className="flex items-center gap-2">
                  <Truck className="h-4 w-4" /> Truck
                </SelectItem>
                <SelectItem value="bus" className="flex items-center gap-2">
                  <Bus className="h-4 w-4" /> Bus
                </SelectItem>
                <SelectItem value="van" className="flex items-center gap-2">
                  <Car className="h-4 w-4" /> Van
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as FrontendVehicle["status"])}>
              <SelectTrigger className="bg-black/40 border-white/10">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="repair">Repair</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="staff">Assigned To</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="bg-black/40 border-white/10" disabled={staffLoading}>
                <SelectValue placeholder={staffLoading ? "Loading staff..." : "Select staff member"} />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                {staff?.map((staffMember) => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>
                    {staffMember.name} ({staffMember.department})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastService">Last Service Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-black/40 border-white/10"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {lastService ? format(lastService, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-black/90 border-white/10">
                <Calendar
                  mode="single"
                  selected={lastService}
                  onSelect={(date) => date && setLastService(date)}
                  initialFocus
                  className="bg-black/90 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <SheetFooter className="pt-4">
            <SheetClose asChild>
              <Button variant="outline" className="border-white/10 text-white" disabled={isSubmitting}>
                Cancel
              </Button>
            </SheetClose>
            <Button 
              type="submit" 
              className="bg-white text-black hover:bg-white/90" 
              disabled={isSubmitting || createLoading || updateLoading}
            >
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-black/60 border-black/10 rounded-full animate-spin mr-2"></div>
                  {isEditing ? 'Updating...' : 'Saving...'}
                </>
              ) : (
                isEditing ? 'Update Vehicle' : 'Save Vehicle'
              )}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
