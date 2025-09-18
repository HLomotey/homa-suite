import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePayroll, type PayrollFilters } from '@/hooks/usePayroll';
import { FrontendPayroll } from '@/integration/supabase/types/billing';
import { PayrollForm, type PayrollFormData } from './PayrollForm';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  DollarSign, 
  Clock, 
  Users,
  TrendingUp,
  FileText
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface PayrollManagementProps {
  className?: string;
}

export const PayrollManagement: React.FC<PayrollManagementProps> = ({ className }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<PayrollFilters>({});
  const [selectedRecord, setSelectedRecord] = useState<FrontendPayroll | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<FrontendPayroll | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { 
    payrollData, 
    loading, 
    error, 
    stats, 
    refreshData, 
    createPayrollRecord,
    updatePayrollRecord,
    deletePayrollRecord 
  } = usePayroll(filters);

  // Filter payroll data based on search term
  const filteredPayrollData = payrollData.filter((record) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      record.staffName?.toLowerCase().includes(searchLower) ||
      record.employeeId?.toLowerCase().includes(searchLower) ||
      record.payPeriod.toLowerCase().includes(searchLower) ||
      format(new Date(record.payDate), 'MMM dd, yyyy').toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteRecord = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        await deletePayrollRecord(id);
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const handleAddRecord = () => {
    setEditingRecord(null);
    setIsFormOpen(true);
  };

  const handleEditRecord = (record: FrontendPayroll) => {
    setEditingRecord(record);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: PayrollFormData) => {
    setIsSubmitting(true);
    try {
      if (editingRecord) {
        // Update existing record
        await updatePayrollRecord(editingRecord.id, {
          staff_id: formData.staffId,
          regular_hours: formData.regularHours || null,
          overtime_hours: formData.overtimeHours || null,
          rent: formData.rent || null,
          transport: formData.transport || null,
          penalties: formData.penalties || null,
          pay_date: formData.payDate,
          pay_period: formData.payPeriod,
        });
      } else {
        // Create new record
        await createPayrollRecord({
          staff_id: formData.staffId,
          regular_hours: formData.regularHours || null,
          overtime_hours: formData.overtimeHours || null,
          rent: formData.rent || null,
          transport: formData.transport || null,
          penalties: formData.penalties || null,
          pay_date: formData.payDate,
          pay_period: formData.payPeriod,
        });
      }
      setIsFormOpen(false);
      setEditingRecord(null);
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingRecord(null);
    setIsSubmitting(false);
  };

  const handleApplyFilters = (newFilters: PayrollFilters) => {
    setFilters(newFilters);
    setIsFilterSheetOpen(false);
  };

  const clearFilters = () => {
    setFilters({});
    setIsFilterSheetOpen(false);
  };

  const exportToCSV = () => {
    if (filteredPayrollData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const headers = [
      'Staff Name',
      'Employee ID',
      'Pay Period',
      'Pay Date',
      'Regular Hours',
      'Overtime Hours',
      'Rent',
      'Transport',
      'Penalties'
    ];

    const csvData = filteredPayrollData.map(record => [
      record.staffName || '',
      record.employeeId || '',
      record.payPeriod,
      format(new Date(record.payDate), 'yyyy-MM-dd'),
      record.regularHours?.toString() || '',
      record.overtimeHours?.toString() || '',
      record.rent?.toString() || '',
      record.transport?.toString() || '',
      record.penalties?.toString() || ''
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payroll-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    toast.success('Payroll data exported successfully');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading payroll data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading payroll data: {error}</p>
          <Button onClick={refreshData} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRecords}</div>
            <p className="text-xs text-muted-foreground">
              Payroll entries
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalRegularHours + stats.totalOvertimeHours).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Regular: {stats.totalRegularHours.toFixed(1)} | OT: {stats.totalOvertimeHours.toFixed(1)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deductions</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(stats.totalRent + stats.totalPenalties).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Rent + Penalties
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transport Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalTransport.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              Transport allowances
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Payroll Management
              </CardTitle>
              <CardDescription>
                Manage payroll records, hours, deductions, and payments for all staff members
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleAddRecord} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Record
              </Button>
              <Button onClick={exportToCSV} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                    {Object.keys(filters).length > 0 && (
                      <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                        {Object.keys(filters).length}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Payroll Data</SheetTitle>
                    <SheetDescription>
                      Apply filters to narrow down the payroll records
                    </SheetDescription>
                  </SheetHeader>
                  <PayrollFilters
                    currentFilters={filters}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={clearFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by staff name, employee ID, pay period, or date..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Payroll Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Name</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Pay Period</TableHead>
                  <TableHead>Pay Date</TableHead>
                  <TableHead className="text-right">Regular Hours</TableHead>
                  <TableHead className="text-right">Overtime Hours</TableHead>
                  <TableHead className="text-right">Rent</TableHead>
                  <TableHead className="text-right">Transport</TableHead>
                  <TableHead className="text-right">Penalties</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayrollData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      {searchTerm || Object.keys(filters).length > 0 
                        ? 'No payroll records match your search criteria'
                        : 'No payroll records found. Upload payroll data to get started.'
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayrollData.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">
                        {record.staffName || 'Unknown Staff'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {record.employeeId || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{record.payPeriod}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          {format(new Date(record.payDate), 'MMM dd, yyyy')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {record.regularHours ? `${record.regularHours.toFixed(1)}h` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.overtimeHours ? `${record.overtimeHours.toFixed(1)}h` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.rent ? `$${record.rent.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.transport ? `$${record.transport.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {record.penalties ? `$${record.penalties.toFixed(2)}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRecord(record)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteRecord(record.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Form */}
      <PayrollForm
        isOpen={isFormOpen}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editingRecord={editingRecord}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

// Filters component for the sheet
interface PayrollFiltersProps {
  currentFilters: PayrollFilters;
  onApplyFilters: (filters: PayrollFilters) => void;
  onClearFilters: () => void;
}

const PayrollFilters: React.FC<PayrollFiltersProps> = ({
  currentFilters,
  onApplyFilters,
  onClearFilters,
}) => {
  const [localFilters, setLocalFilters] = useState<PayrollFilters>(currentFilters);

  const handleApply = () => {
    onApplyFilters(localFilters);
  };

  return (
    <div className="space-y-4 pt-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Pay Period</label>
        <Input
          placeholder="e.g., January 2024"
          value={localFilters.payPeriod || ''}
          onChange={(e) => setLocalFilters({ ...localFilters, payPeriod: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Start Date</label>
        <Input
          type="date"
          value={localFilters.startDate || ''}
          onChange={(e) => setLocalFilters({ ...localFilters, startDate: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">End Date</label>
        <Input
          type="date"
          value={localFilters.endDate || ''}
          onChange={(e) => setLocalFilters({ ...localFilters, endDate: e.target.value })}
        />
      </div>

      <div className="flex gap-2 pt-4">
        <Button onClick={handleApply} className="flex-1">
          Apply Filters
        </Button>
        <Button onClick={onClearFilters} variant="outline">
          Clear
        </Button>
      </div>
    </div>
  );
};
