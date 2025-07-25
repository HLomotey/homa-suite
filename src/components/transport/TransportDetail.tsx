import { Vehicle, Staff } from "./data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  Car,
  Truck,
  Bus,
  User,
  Building,
  Clock,
} from "lucide-react";

interface TransportDetailProps {
  vehicle: Vehicle;
  staff: Staff;
  onBack: () => void;
}

export function TransportDetail({
  vehicle,
  staff,
  onBack,
}: TransportDetailProps) {
  // Get status badge variant
  const getStatusBadge = (status: Vehicle["status"]) => {
    switch (status) {
      case "active":
        return "default";
      case "maintenance":
        return "secondary";
      case "repair":
        return "destructive";
      case "retired":
        return "outline";
      default:
        return "default";
    }
  };

  // Get vehicle icon
  const getVehicleIcon = (type: Vehicle["type"]) => {
    switch (type) {
      case "car":
        return <Car className="h-5 w-5" />;
      case "truck":
        return <Truck className="h-5 w-5" />;
      case "bus":
        return <Bus className="h-5 w-5" />;
      case "van":
        return <Car className="h-5 w-5" />;
      default:
        return <Car className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-0 h-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Vehicles
        </Button>
        <Badge variant={getStatusBadge(vehicle.status)} className="capitalize">
          {vehicle.status}
        </Badge>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-black/40 backdrop-blur-md border border-white/10 rounded-full">
          {getVehicleIcon(vehicle.type)}
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">{vehicle.model}</h2>
          <p className="text-white/60">Plate Number: {vehicle.plateNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-4 w-4" /> Assigned Staff
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gray-800 flex items-center justify-center">
                <User className="h-6 w-6 text-white/60" />
              </div>
              <div>
                <p className="font-medium text-white">{staff.name}</p>
                <p className="text-sm text-white/60">{staff.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/40 backdrop-blur-md border-white/10">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Building className="h-4 w-4" /> Maintenance History
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-white/60" />
                <span>Last Service Date</span>
              </div>
              <span className="font-medium">
                {new Date(vehicle.lastService).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-white/60" />
                <span>Next Service Due</span>
              </div>
              <span className="font-medium">
                {new Date(
                  new Date(vehicle.lastService).setMonth(
                    new Date(vehicle.lastService).getMonth() + 3
                  )
                ).toLocaleDateString()}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-black/40 backdrop-blur-md border-white/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Car className="h-4 w-4" /> Vehicle Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/60">Vehicle Type</span>
              <span className="font-medium capitalize">{vehicle.type}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/60">Model</span>
              <span className="font-medium">{vehicle.model}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/60">Plate Number</span>
              <span className="font-medium">{vehicle.plateNumber}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/10">
              <span className="text-white/60">Status</span>
              <Badge
                variant={getStatusBadge(vehicle.status)}
                className="capitalize"
              >
                {vehicle.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Schedule Service</Button>
        <Button variant="outline">Update Details</Button>
        <Button variant="destructive">Retire Vehicle</Button>
      </div>
    </div>
  );
}
