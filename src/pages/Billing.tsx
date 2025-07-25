import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, Plus, DollarSign, Receipt, CreditCard, Table as TableIcon, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface Bill {
  id: string;
  staffId: string;
  amount: number;
  type: string;
  status: 'paid' | 'pending' | 'overdue' | 'default' | 'secondary' | 'destructive' | 'outline';
  dueDate: string;
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

const mockBills: Bill[] = [
  {
    id: '1',
    staffId: '1',
    amount: 1200,
    type: 'Rent',
    status: 'default',
    dueDate: '2024-02-15',
  },
  {
    id: '2',
    staffId: '2',
    amount: 800,
    type: 'Utilities',
    status: 'secondary',
    dueDate: '2024-02-20',
  },
  {
    id: '3',
    staffId: '3',
    amount: 1500,
    type: 'Maintenance',
    status: 'destructive',
    dueDate: '2024-02-10',
  },
];

export default function Billing() {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBills = mockBills.filter((bill) => {
    const staff = mockStaff.find((s) => s.id === bill.staffId);
    if (!staff) return false;

    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || bill.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsFormOpen(false);
  };

  return (
    <main className="flex-1 h-full p-4 md:p-6">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Billing</h1>
              <p className="text-white/60">Manage staff billing and payments</p>
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
              { label: 'Total Bills', value: filteredBills.length, icon: Receipt },
              { label: 'Paid', value: filteredBills.filter(b => b.status === 'paid').length, icon: CreditCard },
              { label: 'Pending', value: filteredBills.filter(b => b.status === 'pending').length, icon: DollarSign },
              { label: 'Overdue', value: filteredBills.filter(b => b.status === 'overdue').length, icon: Users }
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
              placeholder="Search by staff name..."
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
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Bill
          </Button>
        </div>

        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBills.map((bill) => {
              const staff = mockStaff.find((s) => s.id === bill.staffId);
              if (!staff) return null;

              return (
                <div
                  key={bill.id}
                  className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {staff.name}
                      </h3>
                      <p className="text-white/60">{staff.department}</p>
                    </div>
                    <Badge
                      variant={bill.status === 'paid' ? 'default' : bill.status === 'pending' ? 'secondary' : 'destructive'}
                    >
                      {bill.status === 'paid' ? 'Paid' : bill.status === 'pending' ? 'Pending' : 'Overdue'}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/80">
                      <DollarSign className="h-4 w-4 inline-block mr-2" />
                      ${bill.amount}
                    </p>
                    <p className="text-white/80">
                      <Receipt className="h-4 w-4 inline-block mr-2" />
                      {bill.type}
                    </p>
                    <p className="text-white/80">
                      <CreditCard className="h-4 w-4 inline-block mr-2" />
                      Due: {bill.dueDate}
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
                  <TableHead>Staff</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBills.map((bill) => {
                  const staff = mockStaff.find((s) => s.id === bill.staffId);
                  if (!staff) return null;

                  return (
                    <TableRow key={bill.id} className="hover:bg-white/5">
                      <TableCell className="font-medium">{staff.name}</TableCell>
                      <TableCell>{staff.department}</TableCell>
                      <TableCell>${bill.amount}</TableCell>
                      <TableCell>{bill.type}</TableCell>
                      <TableCell>{bill.dueDate}</TableCell>
                      <TableCell>
                        <Badge
                          variant={bill.status === 'paid' ? 'default' : bill.status === 'pending' ? 'secondary' : 'destructive'}
                        >
                          {bill.status === 'paid' ? 'Paid' : bill.status === 'pending' ? 'Pending' : 'Overdue'}
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
              <SheetTitle>New Bill</SheetTitle>
              <SheetDescription>
                Create a new bill for staff.
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
                <Label htmlFor="amount">Amount</Label>
                <Input type="number" id="amount" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="utilities">Utilities</SelectItem>
                    <SelectItem value="transport">Transport</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input type="date" id="dueDate" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input type="text" id="description" />
              </div>
              <Button type="submit" className="w-full">
                Create Bill
              </Button>
            </form>
          </SheetContent>
        </Sheet>
      </div>
    </main>
  );
}