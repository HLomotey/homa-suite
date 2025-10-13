import React, { useState } from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Edit2, Save, X, Trash2, AlertTriangle } from 'lucide-react';
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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    console.log('🗑️ User confirmed deletion of billing record:', billingRow.id);
    const success = await deleteBillingRecord(billingRow.id);
    if (success) {
      console.log('✅ Delete successful, calling onDelete callback');
      setShowDeleteDialog(false);
      onDelete();
    } else {
      console.log('❌ Delete failed');
      setShowDeleteDialog(false);
    }
  };

  const handleDeleteCancel = () => {
    console.log('❌ User cancelled deletion');
    setShowDeleteDialog(false);
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
        <Badge 
          variant="outline"
          className={
            billingRow.billingType === "housing" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
            billingRow.billingType === "transportation" ? "bg-green-500/20 text-green-400 border-green-500/30" :
            billingRow.billingType === "security_deposit" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
            billingRow.billingType === "bus_card" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
            "bg-gray-500/20 text-gray-400 border-gray-500/30"
          }
        >
          {billingRow.billingType === "housing" ? "Housing" :
           billingRow.billingType === "transportation" ? "Transportation" :
           billingRow.billingType === "security_deposit" ? "Security Deposit" :
           billingRow.billingType === "bus_card" ? "Bus Card" :
           billingRow.billingType}
        </Badge>
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
      <TableCell>
        <Badge 
          variant="outline"
          className={
            billingRow.assignmentStatus === "Active" ? "bg-green-500/20 text-green-400 border-green-500/30" :
            billingRow.assignmentStatus === "Pending" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
            billingRow.assignmentStatus === "Expired" ? "bg-orange-500/20 text-orange-400 border-orange-500/30" :
            billingRow.assignmentStatus === "Terminated" ? "bg-red-500/20 text-red-400 border-red-500/30" :
            "bg-gray-500/20 text-gray-400 border-gray-500/30"
          }
        >
          {billingRow.assignmentStatus || "Unknown"}
        </Badge>
      </TableCell>
      <TableCell className="text-white/90">
        {billingRow.assignmentEndDate && 
         (billingRow.assignmentStatus === "Expired" || billingRow.assignmentStatus === "Terminated") ? (
          <span className="text-orange-400">
            {format(new Date(billingRow.assignmentEndDate), "MMM dd, yyyy")}
          </span>
        ) : (
          <span className="text-white/40">-</span>
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
                onClick={handleDeleteClick}
                disabled={isDeleting}
                className="h-8 w-8 p-0 text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </TableCell>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              Are you sure you want to delete this billing record? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <div className="bg-gray-800 p-3 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Tenant:</span>
                <span className="text-white font-medium">{billingRow.tenantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Amount:</span>
                <span className="text-white font-medium">${billingRow.rentAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-white font-medium capitalize">{billingRow.billingType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Period:</span>
                <span className="text-white font-medium">
                  {format(new Date(billingRow.periodStart), "MMM dd")} → {format(new Date(billingRow.periodEnd), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleDeleteCancel}
              disabled={isDeleting}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Record
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TableRow>
  );
}
