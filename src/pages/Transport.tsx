import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, Plus, Car, Truck, Bus, Table as TableIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Vehicle {
  id: string;
  staffId: string;
  model: string;
  plateNumber: string;
  status: 'default' | 'secondary' | 'destructive' | 'outline';
  lastService: string;
}

interface Staff {
  id: string;
  name: string;
  department: string;
}

const mockStaff: Staff[] = [
  { id: "1", name: "John Doe", department: "Engineering" },
  { id: "2", name: "Jane Smith", department: "HR" },
  { id: "3", name: "Mike Johnson", department: "Finance" },
];

const mockVehicles: Vehicle[] = [
  {
    id: '1',
    staffId: '1',
    model: 'Toyota Camry',
    plateNumber: 'ABC123',
    status: 'default',
    lastService: '2024-01-15',
  },
  {
    id: '2',
    staffId: '2',
    model: 'Honda Civic',
    plateNumber: 'XYZ789',
    status: 'secondary',
    lastService: '2024-01-20',
  },
  {
    id: '3',
    staffId: '3',
    model: 'Ford Explorer',
    plateNumber: 'DEF456',
    status: 'outline',
    lastService: '2024-01-10',
  },
];

export default function Transport() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredVehicles = mockVehicles.filter((vehicle) => {
    const staff = mockStaff.find((s) => s.id === vehicle.staffId);
    if (!staff) return false;

    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         vehicle.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsFormOpen(false);
  };

  return (
    <main className="flex-1 p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Transport</h1>
              <p className="text-white/60">Manage staff vehicles and transportation</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    "h-8 px-3",
                    viewMode === 'grid' 
                      ? "bg-white text-black hover:bg-white/90" 
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <Grid3X3 className="h-4 w-4 mr-2" />
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'table' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('table')}
                  className={cn(
                    "h-8 px-3",
                    viewMode === 'table' 
                      ? "bg-white text-black hover:bg-white/90" 
                      : "text-white/70 hover:text-white hover:bg-white/10"
                  )}
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Total Vehicles', value: filteredVehicles.length, icon: Car },
              { label: 'Active', value: filteredVehicles.filter(v => v.status === 'active').length, icon: Truck },
              { label: 'Maintenance', value: filteredVehicles.filter(v => v.status === 'maintenance').length, icon: Bus },
              { label: 'Inactive', value: filteredVehicles.filter(v => v.status === 'inactive').length, icon: Users }
            ].map((stat, index) => (
              <div key={index} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm">{stat.label}</p>
                    <p className="text-white text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-white/40" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Search by staff, model, or plate..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              defaultValue="all"
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Vehicle
          </Button>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVehicles.map((vehicle) => {
              const staff = mockStaff.find((s) => s.id === vehicle.staffId);
              if (!staff) return null;

              const VehicleIcon = {
                car: Car,
                truck: Truck,
                bus: Bus,
              }[vehicle.type];

              return (
                <div
                  key={vehicle.id}
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {vehicle.model}
                      </h3>
                      <p className="text-white/60">{staff.name}</p>
                    </div>
                    <Badge
                      variant={vehicle.status}
                    >
                      {vehicle.status === 'default' ? 'Active' : vehicle.status === 'secondary' ? 'Maintenance' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/80">
                      <VehicleIcon className="h-4 w-4 inline-block mr-2" />
                      {vehicle.plateNumber}
                    </p>
                    <p className="text-white/80">
                      Last Service: {vehicle.lastService}
                    </p>
                    <p className="text-white/80">
                      Next Service: {vehicle.nextService}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-white/5">
                  <TableHead>Model</TableHead>
                  <TableHead>Staff</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Plate Number</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead>Next Service</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVehicles.map((vehicle) => {
                  const staff = mockStaff.find((s) => s.id === vehicle.staffId);
                  if (!staff) return null;

                  return (
                    <TableRow key={vehicle.id} className="hover:bg-white/5">
                      <TableCell className="font-medium">{vehicle.model}</TableCell>
                      <TableCell>{staff.name}</TableCell>
                      <TableCell>{vehicle.type}</TableCell>
                      <TableCell>{vehicle.plateNumber}</TableCell>
                      <TableCell>{vehicle.lastService}</TableCell>
                      <TableCell>{vehicle.nextService}</TableCell>
                      <TableCell>
                        <Badge
                          variant={{
                            active: "default",
                            maintenance: "secondary",
                            inactive: "outline",
                          }[vehicle.status]}
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

        <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>New Vehicle</SheetTitle>
              <SheetDescription>
                Register a new vehicle for staff.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input type="text" id="model" placeholder="Vehicle model" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="truck">Truck</SelectItem>
                    <SelectItem value="bus">Bus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plateNumber">Plate Number</Label>
                <Input type="text" id="plateNumber" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lastService">Last Service</Label>
                  <Input type="date" id="lastService" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nextService">Next Service</Label>
                  <Input type="date" id="nextService" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full">
                Register Vehicle
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </main>
  );
}