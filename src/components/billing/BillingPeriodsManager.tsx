import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Archive,
  Repeat,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useBillingPeriods, useCreateBillingPeriod, useUpdateBillingPeriod, useDeleteBillingPeriod } from "@/hooks/utility/useBillingPeriod";
import { FrontendBillingPeriod } from "@/integration/supabase/types/utility";

interface BillingPeriodFormData {
  mode: 'add' | 'edit';
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  isRecurring: boolean;
  recurrenceType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}

export function BillingPeriodsManager() {
  const { data: billingPeriods = [], isLoading, error } = useBillingPeriods();
  const createBillingPeriod = useCreateBillingPeriod();
  const updateBillingPeriod = useUpdateBillingPeriod();
  const deleteBillingPeriod = useDeleteBillingPeriod();

  // Form states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<FrontendBillingPeriod | null>(null);
  const [formData, setFormData] = useState<BillingPeriodFormData>({
    mode: 'add',
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
    isRecurring: false,
    recurrenceType: 'MONTHLY',
  });

  const resetForm = () => {
    setFormData({
      mode: 'add',
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'ACTIVE',
      isRecurring: false,
      recurrenceType: 'MONTHLY',
    });
  };

  const openAddSheet = () => {
    resetForm();
    setFormData(prev => ({ ...prev, mode: 'add' }));
    setIsSheetOpen(true);
  };

  const openEditSheet = (period: FrontendBillingPeriod) => {
    setSelectedPeriod(period);
    setFormData({
      mode: 'edit',
      name: period.name,
      description: period.description || '',
      startDate: period.startDate,
      endDate: period.endDate,
      status: period.status,
      isRecurring: period.isRecurring,
      recurrenceType: period.recurrenceType || 'MONTHLY',
    });
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (period: FrontendBillingPeriod) => {
    setSelectedPeriod(period);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSavePeriod = async () => {
    try {
      const periodData = {
        name: formData.name,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        isRecurring: formData.isRecurring,
        recurrenceType: formData.isRecurring ? formData.recurrenceType : undefined,
      };

      if (formData.mode === 'add') {
        await createBillingPeriod.mutateAsync(periodData);
      } else {
        if (!selectedPeriod) return;
        await updateBillingPeriod.mutateAsync({
          id: selectedPeriod.id,
          billingPeriodData: periodData,
        });
      }

      setIsSheetOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving billing period:', error);
    }
  };

  const handleDeletePeriod = async () => {
    if (!selectedPeriod) return;

    try {
      console.log('Attempting to delete billing period:', selectedPeriod.id);
      await deleteBillingPeriod.mutateAsync(selectedPeriod.id);
      console.log('Successfully deleted billing period');
      setIsDeleteDialogOpen(false);
      setSelectedPeriod(null);
    } catch (error) {
      console.error('Error deleting billing period:', error);
      // Show user-friendly error message
      alert(`Failed to delete billing period: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const getStatusBadge = (status: string, relativeStatus?: string) => {
    const statusConfig = {
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      CLOSED: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
      ARCHIVED: { color: 'bg-blue-100 text-blue-800', icon: Archive },
    };

    const relativeConfig = {
      CURRENT: { color: 'bg-emerald-100 text-emerald-800', label: 'Current' },
      UPCOMING: { color: 'bg-yellow-100 text-yellow-800', label: 'Upcoming' },
      PAST: { color: 'bg-gray-100 text-gray-800', label: 'Past' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config?.icon || CheckCircle;

    return (
      <div className="flex gap-2">
        <Badge className={config?.color}>
          <Icon className="h-3 w-3 mr-1" />
          {status}
        </Badge>
        {relativeStatus && (
          <Badge className={relativeConfig[relativeStatus as keyof typeof relativeConfig]?.color}>
            {relativeConfig[relativeStatus as keyof typeof relativeConfig]?.label}
          </Badge>
        )}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading billing periods: {error.message}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Billing Periods</h2>
          <p className="text-muted-foreground">
            Manage billing periods for utility and rent calculations
          </p>
        </div>
        <Button onClick={openAddSheet} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Billing Period
        </Button>
      </div>

      {billingPeriods.length === 0 ? (
        <div className="text-center text-muted-foreground p-8 border border-dashed rounded-lg">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No billing periods found</h3>
          <p className="mb-4">Create your first billing period to get started.</p>
          <Button onClick={openAddSheet}>
            <Plus className="h-4 w-4 mr-2" />
            Add Billing Period
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Date Range</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Recurring</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingPeriods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{period.name}</div>
                      {period.description && (
                        <div className="text-sm text-muted-foreground">
                          {period.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatDate(period.startDate)}</div>
                      <div className="text-muted-foreground">
                        to {formatDate(period.endDate)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {period.durationDays} days
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(period.status, period.periodStatusRelative)}
                  </TableCell>
                  <TableCell>
                    {period.periodStatusRelative === 'CURRENT' && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{period.daysElapsed} days elapsed</span>
                          <span>{period.daysRemaining} remaining</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(100, Math.max(0, ((period.daysElapsed || 0) / (period.durationDays || 1)) * 100))}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {period.isRecurring && (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Repeat className="h-3 w-3" />
                        {period.recurrenceType}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditSheet(period)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(period)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Billing Period Form Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {formData.mode === 'add' ? 'Add New Billing Period' : 'Edit Billing Period'}
            </SheetTitle>
            <SheetDescription>
              {formData.mode === 'add'
                ? 'Create a new billing period for utility and rent calculations.'
                : 'Update the billing period details.'}
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Period Name</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Q1 2024, January 2024"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Optional description for this billing period"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  name="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  name="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="ARCHIVED">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isRecurring"
                checked={formData.isRecurring}
                onCheckedChange={(checked) => handleSwitchChange('isRecurring', checked)}
              />
              <Label htmlFor="isRecurring">Recurring Period</Label>
            </div>

            {formData.isRecurring && (
              <div className="space-y-2">
                <Label htmlFor="recurrenceType">Recurrence Type</Label>
                <Select
                  value={formData.recurrenceType}
                  onValueChange={(value) => handleSelectChange('recurrenceType', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select recurrence" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Monthly</SelectItem>
                    <SelectItem value="QUARTERLY">Quarterly</SelectItem>
                    <SelectItem value="YEARLY">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <SheetFooter>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSavePeriod}
                disabled={createBillingPeriod.isPending || updateBillingPeriod.isPending}
              >
                {createBillingPeriod.isPending || updateBillingPeriod.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Billing Period</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this billing period? This action cannot be undone
              and may affect related utility calculations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="font-medium">{selectedPeriod?.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedPeriod?.startDate && selectedPeriod?.endDate && 
                `${formatDate(selectedPeriod.startDate)} - ${formatDate(selectedPeriod.endDate)}`
              }
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePeriod}
              disabled={deleteBillingPeriod.isPending}
            >
              {deleteBillingPeriod.isPending ? 'Deleting...' : 'Delete Period'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
