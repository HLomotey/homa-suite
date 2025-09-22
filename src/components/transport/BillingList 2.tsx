import { useState, useEffect } from "react";
import { PlusCircle, Search, Filter, ArrowUpDown } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { BillingPeriodForm } from "./BillingPeriodForm";
import { FrontendBillingPeriod, FrontendTransportBilling, TransportBillingStatus } from "@/integration/supabase/types/billing";


// Status badge component
const StatusBadge = ({ status }: { status: TransportBillingStatus }) => {
  const getVariant = () => {
    switch (status) {
      case "Paid":
        return "bg-green-500/20 text-green-500 border-green-500/50";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50";
      case "Overdue":
        return "bg-red-500/20 text-red-500 border-red-500/50";
      case "Draft":
        return "bg-blue-500/20 text-blue-500 border-blue-500/50";
      case "Cancelled":
        return "bg-gray-500/20 text-gray-500 border-gray-500/50";
      default:
        return "bg-gray-500/20 text-gray-500 border-gray-500/50";
    }
  };

  return (
    <Badge className={`${getVariant()} border`}>
      {status}
    </Badge>
  );
};

interface BillingListProps {
  onOpenForm: () => void;
  billingPeriods: FrontendBillingPeriod[];
  billingEntries: FrontendTransportBilling[];
  onEditBilling?: (billing: FrontendTransportBilling) => void;
  onDeleteBilling?: (id: string) => void;
  onPeriodChange?: (periodId: string) => void;
  loading?: boolean;
  periodsLoading?: boolean;
}

export function BillingList({ 
  onOpenForm, 
  billingPeriods = [], 
  billingEntries = [], 
  onEditBilling, 
  onDeleteBilling,
  onPeriodChange,
  loading = false,
  periodsLoading = false
}: BillingListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<string>(""); 
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPeriod, setEditingPeriod] = useState<FrontendBillingPeriod | null>(null);

  // Set default selected period when periods are loaded
  useEffect(() => {
    if (billingPeriods.length > 0 && !selectedPeriod) {
      const activePeriod = billingPeriods.find(p => p.status === "Active");
      const newSelectedPeriod = activePeriod ? activePeriod.id : billingPeriods[0].id;
      setSelectedPeriod(newSelectedPeriod);
      if (onPeriodChange) {
        onPeriodChange(newSelectedPeriod);
      }
    }
  }, [billingPeriods, selectedPeriod, onPeriodChange]);

  // Handle period selection change
  const handlePeriodChange = (periodId: string) => {
    setSelectedPeriod(periodId);
    if (onPeriodChange) {
      onPeriodChange(periodId);
    }
  };

  // Filter billing entries based on search term and status
  const filteredEntries = billingEntries
    .filter((entry) => 
      statusFilter === "all" || entry.status === statusFilter
    )
    .filter((entry) =>
      entry.staffName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.vehicleInfo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.locationName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Handle opening form for new billing period
  const handleNewPeriod = () => {
    setEditingPeriod(null);
    setIsFormOpen(true);
  };

  // Handle form success (create or update)
  const handleFormSuccess = () => {
    // TODO: Implement actual data refresh
    console.log("Billing period form submitted successfully");
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Transport Billing</h2>
        <Button onClick={handleNewPeriod}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Billing Period
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="w-full md:w-1/3">
          <Select 
            value={selectedPeriod} 
            onValueChange={handlePeriodChange}
            disabled={periodsLoading}
          >
            <SelectTrigger className="bg-black/50 border-white/20">
              <SelectValue placeholder="Select billing period" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              {billingPeriods.map((period) => (
                <SelectItem key={period.id} value={period.id}>
                  {period.name} ({period.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-1/3 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/40" />
          <Input
            placeholder="Search staff, vehicle, or location..."
            className="pl-8 bg-black/50 border-white/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-1/3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-black/50 border-white/20">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-black/90 border-white/20">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Paid">Paid</SelectItem>
              <SelectItem value="Overdue">Overdue</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border border-white/10 overflow-hidden">
        <Table>
          <TableHeader className="bg-black/40">
            <TableRow className="hover:bg-black/60 border-white/10">
              <TableHead className="text-white">Staff</TableHead>
              <TableHead className="text-white">Location</TableHead>
              <TableHead className="text-white">Vehicle</TableHead>
              <TableHead className="text-white">
                <div className="flex items-center">
                  Amount
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead className="text-white">Status</TableHead>
              <TableHead className="text-white">Due Date</TableHead>
              <TableHead className="text-white text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Loading billing entries...
                </TableCell>
              </TableRow>
            ) : filteredEntries.length > 0 ? (
              filteredEntries.map((entry) => (
                <TableRow key={entry.id} className="hover:bg-black/60 border-white/10">
                  <TableCell className="font-medium">{entry.staffName}</TableCell>
                  <TableCell>{entry.locationName}</TableCell>
                  <TableCell>{entry.vehicleInfo}</TableCell>
                  <TableCell>${entry.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <StatusBadge status={entry.status} />
                  </TableCell>
                  <TableCell>{new Date(entry.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <Filter className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-black/90 border-white/20">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => onEditBilling && onEditBilling(entry)}
                        >
                          Edit Billing
                        </DropdownMenuItem>
                        {entry.status === "Pending" && (
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => onEditBilling && onEditBilling({
                              ...entry,
                              status: "Paid",
                              paidDate: new Date().toISOString().split('T')[0]
                            })}
                          >
                            Mark as Paid
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-500"
                          onClick={() => onDeleteBilling && onDeleteBilling(entry.id)}
                        >
                          Delete Billing
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No billing entries found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BillingPeriodForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={handleFormSuccess}
        editingPeriod={editingPeriod}
      />
    </div>
  );
}
