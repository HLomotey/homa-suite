import { useState, useEffect } from "react";
import { FrontendVehicle, FrontendTransportStaff } from "@/integration/supabase/types";
import { useVehicles, useTransportStaff } from "@/hooks/transport";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Grid3X3,
  Table as TableIcon,
  Plus,
  Car,
  Truck,
  Bus,
} from "lucide-react";

interface TransportListProps {
  onOpenForm: () => void;
  onSelectVehicle: (vehicle: FrontendVehicle) => void;
  activeTab?: string;
  onChangeTab?: (value: string) => void;
}

export function TransportList({
  onOpenForm,
  onSelectVehicle,
  activeTab = "all",
  onChangeTab,
}: TransportListProps) {
  // Fetch vehicles and staff using hooks
  const { vehicles, loading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } = useVehicles();
  const { staff, loading: staffLoading, error: staffError } = useTransportStaff();
  
  // Handle errors
  useEffect(() => {
    if (vehiclesError) {
      console.error("Error fetching vehicles:", vehiclesError);
      toast({
        title: "Error",
        description: "Failed to load vehicles. Please try again.",
        variant: "destructive",
      });
    }
    
    if (staffError) {
      console.error("Error fetching staff:", staffError);
      toast({
        title: "Error",
        description: "Failed to load staff data. Some information may be incomplete.",
        variant: "destructive",
      });
    }
  }, [vehiclesError, staffError]);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");

  // Filter vehicles based on search query
  const filteredVehicles = vehicles?.filter((vehicle) => {
    const staffMember = staff?.find((s) => s.id === vehicle.staffId);
    
    if (searchQuery === "") return true;
    
    return (
      vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      staffMember?.department.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }) || [];

  // Get status badge variant
  const getStatusBadge = (status: FrontendVehicle["status"]) => {
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
  const getVehicleIcon = (type: FrontendVehicle["type"]) => {
    switch (type) {
      case "car":
        return <Car className="h-4 w-4" />;
      case "truck":
        return <Truck className="h-4 w-4" />;
      case "bus":
        return <Bus className="h-4 w-4" />;
      case "van":
        return <Car className="h-4 w-4" />;
      default:
        return <Car className="h-4 w-4" />;
    }
  };

  // Get card background based on status
  const getCardBackground = (status: FrontendVehicle["status"]) => {
    switch (status) {
      case "active":
        return "bg-gradient-to-br from-green-900/40 to-green-950/80";
      case "maintenance":
        return "bg-gradient-to-br from-blue-900/40 to-blue-950/80";
      case "repair":
        return "bg-gradient-to-br from-amber-900/40 to-amber-950/80";
      case "retired":
        return "bg-gradient-to-br from-gray-900/40 to-gray-950/80";
      default:
        return "bg-gradient-to-br from-gray-900/40 to-gray-950/80";
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search vehicles..."
            className="pl-8 bg-black/40 border-white/10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-2"
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="h-8 px-2"
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>
          <Button onClick={onOpenForm} size="sm" className="h-8">
            <Plus className="h-4 w-4 mr-2" /> New Vehicle
          </Button>
        </div>
      </div>

      {vehiclesLoading || staffLoading ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-md border border-white/10 rounded-lg">
          <div className="h-12 w-12 border-2 border-t-white/60 border-white/10 rounded-full animate-spin mb-4"></div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading...
          </h3>
          <p className="text-white/60">
            Fetching transport data
          </p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-black/40 backdrop-blur-md border border-white/10 rounded-lg">
          <Car className="h-12 w-12 text-white/20 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No vehicles found
          </h3>
          <p className="text-white/60 mb-4">
            Try adjusting your search or filters
          </p>
          <Button onClick={onOpenForm} variant="outline">
            <Plus className="h-4 w-4 mr-2" /> Add New Vehicle
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVehicles.map((vehicle) => {
            const staffMember = staff.find((s) => s.id === vehicle.staffId);
            return (
              <div
                key={vehicle.id}
                className={`${getCardBackground(
                  vehicle.status
                )} border border-white/10 rounded-lg p-4 cursor-pointer transition-all hover:scale-[1.02]`}
                onClick={() => onSelectVehicle(vehicle)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    {getVehicleIcon(vehicle.type)}
                    <h3 className="font-semibold text-white">
                      {vehicle.model}
                    </h3>
                  </div>
                  <Badge
                    variant={getStatusBadge(vehicle.status)}
                    className="capitalize"
                  >
                    {vehicle.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Plate Number:</span>
                    <span className="text-white font-medium">
                      {vehicle.plateNumber}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Assigned To:</span>
                    <span className="text-white font-medium">
                      {staffMember?.name || "Unassigned"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Department:</span>
                    <span className="text-white font-medium">
                      {staffMember?.department || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Last Service:</span>
                    <span className="text-white font-medium">
                      {new Date(vehicle.lastService).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          <Table>
            <TableHeader className="bg-black/60">
              <TableRow>
                <TableHead className="text-white">Vehicle</TableHead>
                <TableHead className="text-white">Plate Number</TableHead>
                <TableHead className="text-white">Assigned To</TableHead>
                <TableHead className="text-white">Department</TableHead>
                <TableHead className="text-white">Last Service</TableHead>
                <TableHead className="text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map((vehicle) => {
                const staffMember = staff.find((s) => s.id === vehicle.staffId);
                return (
                  <TableRow
                    key={vehicle.id}
                    className="bg-black/40 hover:bg-black/60 cursor-pointer"
                    onClick={() => onSelectVehicle(vehicle)}
                  >
                    <TableCell className="flex items-center gap-2">
                      {getVehicleIcon(vehicle.type)}
                      <span>{vehicle.model}</span>
                    </TableCell>
                    <TableCell>{vehicle.plateNumber}</TableCell>
                    <TableCell>{staffMember?.name || "Unassigned"}</TableCell>
                    <TableCell>{staffMember?.department || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(vehicle.lastService).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadge(vehicle.status)}
                        className="capitalize"
                      >
                        {vehicle.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
