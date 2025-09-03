import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  X, 
  Search, 
  Filter, 
  Download, 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  DollarSign,
  FileText,
  Calendar,
  User,
  Phone,
  Mail,
  TrendingUp,
  TrendingDown
} from "lucide-react";

interface FinanceDrillDownModalProps {
  isOpen: boolean;
  view: string;
  onClose: () => void;
  financeData?: any;
}

export function FinanceDrillDownModal({ isOpen, view, onClose, financeData }: FinanceDrillDownModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Use real financial data from financeData prop
  const invoices = financeData?.invoices || [];
  const payments = financeData?.recentPayments || [];
  const clients = financeData?.topClients || [];

  const getStatusBadge = (status: string, daysOverdue: number) => {
    switch (status) {
      case "overdue":
        return (
          <Badge className="bg-red-900/40 text-red-300 border-red-800/50">
            <AlertCircle className="h-3 w-3 mr-1" />
            {daysOverdue} days overdue
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-yellow-900/40 text-yellow-300 border-yellow-800/50">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "paid":
        return (
          <Badge className="bg-green-900/40 text-green-300 border-green-800/50">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        );
      default:
        return null;
    }
  };

  const renderOverdueInvoices = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Overdue Invoices</h3>
          <p className="text-sm text-muted-foreground">Invoices requiring immediate attention</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            Send Reminders
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {invoices
          .filter(invoice => 
            (filterStatus === "all" || invoice.status === filterStatus) &&
            (searchTerm === "" || 
             invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
             invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
          .map((invoice) => (
            <Card key={invoice.id} className="bg-slate-900/50 border-slate-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-white">{invoice.id}</h4>
                      {getStatusBadge(invoice.status, invoice.daysOverdue)}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <User className="h-4 w-4" />
                        {invoice.client}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        ${invoice.amount.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Due: {invoice.dueDate}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {invoice.contact}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Phone className="h-4 w-4 mr-2" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <Mail className="h-4 w-4 mr-2" />
                      Email
                    </Button>
                    <Button size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  );

  const renderRevenueBreakdown = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Revenue Breakdown</h3>
          <p className="text-sm text-muted-foreground">Detailed revenue analysis by source</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Revenue by Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Staffing Services</span>
              <span className="font-medium text-white">$485,200</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Consulting</span>
              <span className="font-medium text-white">$156,800</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Training</span>
              <span className="font-medium text-white">$89,300</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Clients</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Acme Corporation</span>
              <span className="font-medium text-white">$125,400</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Global Solutions</span>
              <span className="font-medium text-white">$98,700</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">TechStart Inc</span>
              <span className="font-medium text-white">$87,200</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderCollectionTrends = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Collection Trends</h3>
          <p className="text-sm text-muted-foreground">Payment collection performance over time</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">30-Day Collection Rate</p>
                <p className="text-2xl font-bold text-white">87.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">+2.3% from last month</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Days to Payment</p>
                <p className="text-2xl font-bold text-white">28.4</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">-1.2 days improvement</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Bad Debt Rate</p>
                <p className="text-2xl font-bold text-white">1.2%</p>
              </div>
              <TrendingDown className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-green-500 mt-1">-0.3% reduction</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const getViewTitle = () => {
    switch (view) {
      case "overdue-invoices":
        return "Overdue Invoices - Action Required";
      case "revenue-breakdown":
        return "Revenue Analysis";
      case "collection-trends":
        return "Collection Performance";
      case "invoice-list":
        return "All Invoices";
      case "paid-invoices":
        return "Payment History";
      case "pending-invoices":
        return "Pending Payments";
      case "outstanding-invoices":
        return "Outstanding Invoices - Aging Report";
      default:
        return "Financial Details";
    }
  };

  const renderContent = () => {
    switch (view) {
      case "overdue-invoices":
        return renderOverdueInvoices();
      case "revenue-breakdown":
        return renderRevenueBreakdown();
      case "collection-trends":
        return renderCollectionTrends();
      default:
        return renderOverdueInvoices(); // Default fallback
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-950 border border-slate-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-semibold text-white">{getViewTitle()}</h2>
            <p className="text-sm text-muted-foreground">Detailed financial analysis and actionable insights</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
