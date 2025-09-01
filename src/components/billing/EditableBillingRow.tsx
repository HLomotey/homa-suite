import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit2, Save, X, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { BillingRow, PaymentStatus } from '@/types/billing';
import { useBillingMutations } from '@/hooks/billing/useBillingMutations';

interface EditableBillingRowProps {
  billingRow: BillingRow;
  onUpdate: () => void;
  onDelete: () => void;
}

export function EditableBillingRow({ billingRow, onUpdate, onDelete }: EditableBillingRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedAmount, setEditedAmount] = useState(billingRow.rentAmount.toString());
  const [editedStatus, setEditedStatus] = useState(billingRow.paymentStatus);
  
  const { 
    updateBillingRecord, 
    deleteBillingRecord,
    isUpdating, 
    isDeleting 
  } = useBillingMutations();

  const handleSave = async () => {
    const success = await updateBillingRecord(billingRow.id, {
      rentAmount: parseFloat(editedAmount),
      paymentStatus: editedStatus
    });
    
    if (success) {
      setIsEditing(false);
      onUpdate();
    }
  };

  const handleCancel = () => {
    setEditedAmount(billingRow.rentAmount.toString());
    setEditedStatus(billingRow.paymentStatus);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this billing record?')) {
      const success = await deleteBillingRecord(billingRow.id);
      if (success) {
        onDelete();
      }
    }
  };


  return (
    <TableRow className="border-white/10 hover:bg-white/5">
      <TableCell className="text-white/90 font-medium">
        {billingRow.tenantName}
      </TableCell>
      <TableCell className="text-white/90">
        {billingRow.propertyName}
      </TableCell>
      <TableCell className="text-white/90">
        {billingRow.roomName || "-"}
      </TableCell>
      <TableCell className="text-white/90">
        {isEditing ? (
          <Input
            type="number"
            value={editedAmount}
            onChange={(e) => setEditedAmount(e.target.value)}
            className="w-24 h-8"
            step="0.01"
          />
        ) : (
          <span className="font-medium">
            ${billingRow.rentAmount.toFixed(2)}
          </span>
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select value={editedStatus} onValueChange={(value: PaymentStatus) => setEditedStatus(value)}>
            <SelectTrigger className="w-32 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="waived">Waived</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <Badge 
            variant={billingRow.paymentStatus === "paid" ? "default" : "outline"}
            className={
              billingRow.paymentStatus === "paid" ? "bg-green-500 text-white" :
              billingRow.paymentStatus === "partial" ? "bg-yellow-500 text-white" :
              billingRow.paymentStatus === "waived" ? "bg-blue-500 text-white" :
              "bg-red-500 text-white"
            }
          >
            {billingRow.paymentStatus.charAt(0).toUpperCase() + billingRow.paymentStatus.slice(1)}
          </Badge>
        )}
      </TableCell>
      <TableCell className="text-white/90">
        {format(new Date(billingRow.periodStart), "MMM dd")} → {format(new Date(billingRow.periodEnd), "MMM dd, yyyy")}
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSave}
                disabled={isUpdating}
                className="h-8 w-8 p-0 text-green-400 hover:text-green-300"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCancel}
                disabled={isUpdating}
                className="h-8 w-8 p-0 text-white/60 hover:text-white"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}
