import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Grid3X3,
  Plus,
  DollarSign,
  Receipt,
  CreditCard,
  Table as TableIcon,
  Search,
  Filter,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { BillingRow, PaymentStatus } from "@/types/billing";

interface BillingListProps {
  bills: BillingRow[];
  onOpenForm: () => void;
  onSelectBill?: (bill: BillingRow) => void;
  activeTab?: string;
  onChangeTab?: (tab: string) => void;
}

export function BillingList({
  bills,
  onOpenForm,
  onSelectBill,
  activeTab = "all",
  onChangeTab,
}: BillingListProps) {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredBills = bills.filter((bill) => {
    const matchesSearch = (bill.tenantName || "")
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || bill.paymentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Map status to variant
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "paid":
        return "default";
      case "unpaid":
        return "destructive";
      case "partial":
        return "secondary";
      case "waived":
        return "outline";
      default:
        return "outline";
    }
  };

  // Map status to display text
  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex flex-col h-full">
      <Tabs
        defaultValue={activeTab}
        onValueChange={onChangeTab}
        className="w-full mb-6"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="bg-black/40 backdrop-blur-md border border-white/10">
            <TabsTrigger value="all">All Bills</TabsTrigger>
            <TabsTrigger value="paid">Paid</TabsTrigger>
            <TabsTrigger value="unpaid">Unpaid</TabsTrigger>
            <TabsTrigger value="partial">Partial</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by tenant name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-8 px-3",
                  viewMode === "grid"
                    ? "bg-white text-black hover:bg-white/90"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                Grid
              </Button>
              <Button
                variant={viewMode === "table" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={cn(
                  "h-8 px-3",
                  viewMode === "table"
                    ? "bg-white text-black hover:bg-white/90"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
            <Button onClick={onOpenForm}>
              <Plus className="h-4 w-4 mr-2" />
              New Bill
            </Button>
          </div>
        </div>
      </Tabs>

      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => {
            // Get color based on status
            const getCardColor = (status: string) => {
              switch (status) {
                case "paid":
                  return "bg-gradient-to-br from-green-900/40 to-green-800/20";
                case "unpaid":
                  return "bg-gradient-to-br from-red-900/40 to-red-800/20";
                case "partial":
                  return "bg-gradient-to-br from-yellow-900/40 to-yellow-800/20";
                case "waived":
                  return "bg-gradient-to-br from-blue-900/40 to-blue-800/20";
                default:
                  return "bg-gradient-to-br from-gray-900/40 to-gray-800/20";
              }
            };

            return (
              <Card
                key={bill.id}
                className={`${getCardColor(
                  bill.paymentStatus
                )} border-white/10 cursor-pointer hover:border-white/20 transition-all`}
                onClick={() => onSelectBill && onSelectBill(bill)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {bill.tenantName || "Unknown Tenant"}
                      </h3>
                      <p className="text-white/60">{bill.propertyName}</p>
                    </div>
                    <Badge
                      variant={getStatusVariant(bill.paymentStatus)}
                      className={
                        bill.paymentStatus === "paid"
                          ? "bg-green-600 hover:bg-green-700"
                          : ""
                      }
                    >
                      {getStatusText(bill.paymentStatus)}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-white/80">
                      <DollarSign className="h-4 w-4 inline-block mr-2" />$
                      {bill.rentAmount}
                    </p>
                    <p className="text-white/80">
                      <Receipt className="h-4 w-4 inline-block mr-2" />
                      {bill.roomName}
                    </p>
                    <p className="text-white/80">
                      <CreditCard className="h-4 w-4 inline-block mr-2" />
                      Period: {bill.periodStart} - {bill.periodEnd}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filteredBills.length === 0 && (
            <div className="col-span-full text-center py-8 text-white/60">
              No bills found matching your search.
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-white/10 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-white/5">
                <TableHead>Tenant Name</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBills.map((bill) => {
                return (
                  <TableRow
                    key={bill.id}
                    className="hover:bg-white/5 cursor-pointer"
                    onClick={() => onSelectBill && onSelectBill(bill)}
                  >
                    <TableCell className="font-medium">
                      {bill.tenantName || "Unknown Tenant"}
                    </TableCell>
                    <TableCell>{bill.propertyName}</TableCell>
                    <TableCell>{bill.roomName}</TableCell>
                    <TableCell>${bill.rentAmount}</TableCell>
                    <TableCell>{bill.periodStart} - {bill.periodEnd}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(bill.paymentStatus)}>
                        {getStatusText(bill.paymentStatus)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredBills.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-4 text-white/60"
                  >
                    No bills found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
