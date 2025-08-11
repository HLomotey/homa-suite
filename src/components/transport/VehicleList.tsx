import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Car, Plus } from "lucide-react";
import { FrontendVehicle } from "@/integration/supabase/types/vehicle";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import VehicleForm from "./VehicleForm";

interface VehicleListProps {
  vehicles: FrontendVehicle[];
  onEdit: (vehicle: FrontendVehicle) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSelect: (vehicle: FrontendVehicle) => void;
}

export const VehicleList: React.FC<VehicleListProps> = ({
  vehicles,
  onEdit,
  onDelete,
  onAdd,
  onSelect,
}) => {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedVehicle, setSelectedVehicle] = React.useState<FrontendVehicle | null>(null);

  const handleEdit = (vehicle: FrontendVehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditOpen(true);
  };

  const handleSave = (vehicle: Omit<FrontendVehicle, "id">) => {
    if (selectedVehicle) {
      onEdit({ ...vehicle, id: selectedVehicle.id });
      setIsEditOpen(false);
      setSelectedVehicle(null);
    }
  };

  const handleAdd = () => {
    setIsAddOpen(true);
  };

  const handleAddSave = (vehicle: Omit<FrontendVehicle, "id">) => {
    onAdd();
    setIsAddOpen(false);
  };

  const handleCancel = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Vehicles</h2>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Vehicle
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>State</TableHead>
              <TableHead>Address</TableHead>
              <TableHead>Make</TableHead>
              <TableHead>Model</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicles.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No vehicles found. Add a vehicle to get started.
                </TableCell>
              </TableRow>
            ) : (
              vehicles.map((vehicle) => (
                <TableRow key={vehicle.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => onSelect(vehicle)}>{vehicle.state}</TableCell>
                  <TableCell onClick={() => onSelect(vehicle)}>{vehicle.address}</TableCell>
                  <TableCell onClick={() => onSelect(vehicle)}>{vehicle.make}</TableCell>
                  <TableCell onClick={() => onSelect(vehicle)}>{vehicle.model}</TableCell>
                  <TableCell onClick={() => onSelect(vehicle)}>{vehicle.vin}</TableCell>
                  <TableCell onClick={() => onSelect(vehicle)}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      vehicle.status === 'Active' ? 'bg-green-100 text-green-800' :
                      vehicle.status === 'Maintenance' ? 'bg-yellow-100 text-yellow-800' :
                      vehicle.status === 'Inactive' ? 'bg-gray-100 text-gray-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {vehicle.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(vehicle);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(vehicle.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Vehicle Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          <VehicleForm onSave={handleAddSave} onCancel={handleCancel} />
        </SheetContent>
      </Sheet>

      {/* Edit Vehicle Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          {selectedVehicle && (
            <VehicleForm
              vehicle={selectedVehicle}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default VehicleList;
