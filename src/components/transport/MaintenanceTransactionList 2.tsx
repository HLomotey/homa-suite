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
import { Edit, Trash2, Plus, FileText } from "lucide-react";
import { FrontendMaintenanceTransaction } from "@/integration/supabase/types/maintenance-transaction";
import { FrontendVehicle } from "@/integration/supabase/types/vehicle";
import { FrontendMaintenanceType } from "@/integration/supabase/types/maintenance-type";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import MaintenanceTransactionForm from "./MaintenanceTransactionForm";

interface MaintenanceTransactionListProps {
  transactions: FrontendMaintenanceTransaction[];
  vehicles: FrontendVehicle[];
  maintenanceTypes: FrontendMaintenanceType[];
  onEdit: (transaction: FrontendMaintenanceTransaction) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  onSelect: (transaction: FrontendMaintenanceTransaction) => void;
}

export const MaintenanceTransactionList: React.FC<MaintenanceTransactionListProps> = ({
  transactions,
  vehicles,
  maintenanceTypes,
  onEdit,
  onDelete,
  onAdd,
  onSelect,
}) => {
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [selectedTransaction, setSelectedTransaction] = React.useState<FrontendMaintenanceTransaction | null>(null);

  const handleEdit = (transaction: FrontendMaintenanceTransaction) => {
    setSelectedTransaction(transaction);
    setIsEditOpen(true);
  };

  const handleSave = (transaction: Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">) => {
    if (selectedTransaction) {
      onEdit({ 
        ...transaction, 
        id: selectedTransaction.id,
        vehicleInfo: selectedTransaction.vehicleInfo,
        maintenanceTypeName: selectedTransaction.maintenanceTypeName
      });
      setIsEditOpen(false);
      setSelectedTransaction(null);
    }
  };

  const handleAdd = () => {
    setIsAddOpen(true);
  };

  const handleAddSave = (transaction: Omit<FrontendMaintenanceTransaction, "id" | "vehicleInfo" | "maintenanceTypeName">) => {
    onAdd();
    setIsAddOpen(false);
  };

  const handleCancel = () => {
    setIsAddOpen(false);
    setIsEditOpen(false);
    setSelectedTransaction(null);
  };

  // Format date to display in a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Maintenance Records</h2>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Maintenance Record
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Maintenance Type</TableHead>
              <TableHead>Issue</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4">
                  No maintenance records found. Add a maintenance record to get started.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction) => (
                <TableRow key={transaction.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell onClick={() => onSelect(transaction)}>
                    {formatDate(transaction.date)}
                  </TableCell>
                  <TableCell onClick={() => onSelect(transaction)}>
                    {transaction.vehicleInfo}
                  </TableCell>
                  <TableCell onClick={() => onSelect(transaction)}>
                    {transaction.maintenanceTypeName}
                  </TableCell>
                  <TableCell onClick={() => onSelect(transaction)}>
                    {transaction.issue}
                  </TableCell>
                  <TableCell onClick={() => onSelect(transaction)}>
                    ${transaction.amount.toFixed(2)}
                  </TableCell>
                  <TableCell onClick={() => onSelect(transaction)}>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                      transaction.status === 'Scheduled' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {transaction.receiptUrl && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(transaction.receiptUrl as string, '_blank');
                          }}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(transaction);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(transaction.id);
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

      {/* Add Maintenance Transaction Sheet */}
      <Sheet open={isAddOpen} onOpenChange={setIsAddOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          <MaintenanceTransactionForm 
            onSave={handleAddSave} 
            onCancel={handleCancel} 
            vehicles={vehicles}
            maintenanceTypes={maintenanceTypes}
          />
        </SheetContent>
      </Sheet>

      {/* Edit Maintenance Transaction Sheet */}
      <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          {selectedTransaction && (
            <MaintenanceTransactionForm
              transaction={selectedTransaction}
              onSave={handleSave}
              onCancel={handleCancel}
              vehicles={vehicles}
              maintenanceTypes={maintenanceTypes}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MaintenanceTransactionList;
