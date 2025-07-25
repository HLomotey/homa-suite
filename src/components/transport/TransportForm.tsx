import { useState } from "react";
import { Staff, Vehicle } from "./data";
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
  onSubmit: (vehicle: Omit<Vehicle, "id">) => void;
  staff: Staff[];
}

export function TransportForm({ open, onOpenChange, onSubmit, staff }: TransportFormProps) {
  const [model, setModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [staffId, setStaffId] = useState("");
  const [vehicleType, setVehicleType] = useState<Vehicle["type"]>("car");
  const [status, setStatus] = useState<Vehicle["status"]>("active");
  const [lastService, setLastService] = useState<Date>(new Date());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVehicle = {
      staffId,
      model,
      plateNumber,
      status,
      lastService: lastService.toISOString().split('T')[0],
      type: vehicleType
    };
    
    onSubmit(newVehicle);
    resetForm();
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
          <SheetTitle className="text-white">Add New Vehicle</SheetTitle>
          <SheetDescription className="text-white/60">
            Fill in the details to add a new vehicle to the fleet.
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
            <Select value={vehicleType} onValueChange={(value: Vehicle["type"]) => setVehicleType(value)}>
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
            <Select value={status} onValueChange={(value: Vehicle["status"]) => setStatus(value)}>
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
            <Label htmlFor="staffId">Assign to Staff</Label>
            <Select value={staffId} onValueChange={setStaffId}>
              <SelectTrigger className="bg-black/40 border-white/10">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent className="bg-black/90 border-white/10 text-white">
                {staff.map((staffMember) => (
                  <SelectItem key={staffMember.id} value={staffMember.id}>
                    {staffMember.name} - {staffMember.department}
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
              <Button type="button" variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </SheetClose>
            <Button type="submit" className="w-full sm:w-auto">
              Add Vehicle
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
