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
import { Edit, Trash2, Plus } from "lucide-react";
import { FrontendMaintenanceType } from "@/integration/supabase/types/maintenance-type";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import MaintenanceTypeForm from "./MaintenanceTypeForm";

interface MaintenanceTypeListProps {
  maintenanceTypes: FrontendMaintenanceType[];
  onEdit: (maintenanceType: FrontendMaintenanceType) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSelect: (maintenanceType: FrontendMaintenanceType) => void;
}

export const MaintenanceTypeList: React.FC<MaintenanceTypeListProps> = ({
  maintenanceTypes,
  onEdit,
  onDelete,
  onAdd,
  onSelect,
}) => {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedType, setSelectedType] = React.useState<FrontendMaintenanceType | null>(null);

  const handleEdit = (maintenanceType: FrontendMaintenanceType) => {
    setSelectedType(maintenanceType);
    setIsEditOpen(true);
  };

  const handleSave = (maintenanceType: Omit<FrontendMaintenanceType, "id">) => {
    if (selectedType) {
      onEdit({ ...maintenanceType, id: selectedType.id });
      setIsEditOpen(false);
      setSelectedType(null);
    }
  };

  const handleAdd = () => {
    setIsAddOpen(true);
  };

  const handleAddSave = (maintenanceType: Omit<FrontendMaintenanceType, "id">) => {
    onAdd();
    setIsAddOpen(false);
  };

  const handleCancel = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setSelectedType(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Maintenance Types</h2>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Maintenance Type
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Est. Cost</TableHead>
              <TableHead>Est. Duration</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maintenanceTypes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4">
                  No maintenance types found. Add a maintenance type to get started.
                </TableCell>
              </TableRow>
            ) : (
              maintenanceTypes.map((type) => (
                <TableRow key={type.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => onSelect(type)}>
                    <div>
                      <div className="font-medium">{type.name}</div>
                      <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                        {type.description}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell onClick={() => onSelect(type)}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      type.category === 'Routine' ? 'bg-blue-100 text-blue-800' :
                      type.category === 'Repair' ? 'bg-yellow-100 text-yellow-800' :
                      type.category === 'Emergency' ? 'bg-red-100 text-red-800' :
                      type.category === 'Inspection' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {type.category}
                    </span>
                  </TableCell>
                  <TableCell onClick={() => onSelect(type)}>
                    ${type.estimatedCost.toFixed(2)}
                  </TableCell>
                  <TableCell onClick={() => onSelect(type)}>
                    {type.estimatedDuration} {type.estimatedDuration === 1 ? 'hour' : 'hours'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(type);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(type.id);
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

      {/* Add Maintenance Type Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          <MaintenanceTypeForm onSave={handleAddSave} onCancel={handleCancel} />
        </SheetContent>
      </Sheet>

      {/* Edit Maintenance Type Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          {selectedType && (
            <MaintenanceTypeForm
              maintenanceType={selectedType}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MaintenanceTypeList;
