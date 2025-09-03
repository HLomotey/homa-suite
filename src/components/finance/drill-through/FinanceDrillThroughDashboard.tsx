import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFinanceAnalytics } from "@/hooks/finance/useFinanceAnalytics";
import { InvoiceAgingAnalysis } from "./InvoiceAgingAnalysis";
import { InvoiceDetailsList } from "./InvoiceDetailsList";
import { PaymentTrendsAnalysis } from "./PaymentTrendsAnalysis";
import { ArrowLeft, BarChart3, FileText, TrendingUp, Calendar, AlertTriangle } from "lucide-react";

interface FinanceDrillThroughDashboardProps {
  onBack: () => void;
  year?: number;
  month?: number;
}

interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  line_total: number;
  date_issued: string;
  due_date?: string;
  invoice_status: string;
  tax_1_type?: string;
  description?: string;
}

export const FinanceDrillThroughDashboard: React.FC<FinanceDrillThroughDashboardProps> = ({
  onBack,
  year,
  month
}) => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [activeTab, setActiveTab] = useState('aging');
  
  const { data: financeData, isLoading } = useFinanceAnalytics(year, month);

  // Transform finance data to invoice format for drill-through components
  const invoices: Invoice[] = React.useMemo(() => {
    if (!financeData) return [];
    
    // Since we don't have direct access to individual invoice records from the analytics,
    // we'll need to create a separate hook or modify the existing one to return raw invoice data
    // For now, we'll create mock data based on the aggregated data
    const mockInvoices: Invoice[] = [];
    
    // This would normally come from a separate hook that fetches individual invoice records
    // For demonstration, we'll create representative data
    const statuses = ['paid', 'pending', 'overdue', 'sent'];
    const clients = ['Acme Corp', 'TechStart Inc', 'Global Solutions', 'Innovation Labs', 'Future Systems'];
    
    for (let i = 0; i < Math.min(financeData.totalInvoices, 100); i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomClient = clients[Math.floor(Math.random() * clients.length)];
      const randomAmount = Math.floor(Math.random() * 10000) + 1000;
      const randomDaysAgo = Math.floor(Math.random() * 180);
      const issueDate = new Date();
      issueDate.setDate(issueDate.getDate() - randomDaysAgo);
      
      mockInvoices.push({
        id: `inv-${i + 1}`,
        client_name: randomClient,
        invoice_number: `INV-${(i + 1).toString().padStart(4, '0')}`,
        line_total: randomAmount,
        date_issued: issueDate.toISOString().split('T')[0],
        invoice_status: randomStatus,
        description: `Services for ${randomClient}`
      });
    }
    
    return mockInvoices;
  }, [financeData]);

  const handleInvoiceSelect = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    // Could open a modal or navigate to invoice detail page
    console.log('Selected invoice:', invoice);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 p-4 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-300" />
            Finance Drill-Through Analysis
          </h2>
          <Button variant="secondary" size="sm" onClick={onBack} className="bg-blue-800 hover:bg-blue-700 text-white border-none">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-blue-800/20 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gradient-to-r from-blue-900 to-indigo-900 p-4 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <BarChart3 className="h-6 w-6 mr-2 text-blue-300" />
          Finance Drill-Through Analysis
          {year && month && (
            <span className="ml-2 text-blue-300 text-lg">
              - {new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          )}
        </h2>
        <Button variant="secondary" size="sm" onClick={onBack} className="bg-blue-800 hover:bg-blue-700 text-white border-none">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[#0a101f] border border-blue-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-400 mr-3" />
              <div>
                <p className="text-sm text-blue-300">Total Invoices</p>
                <p className="text-2xl font-bold text-white">
                  {financeData?.totalInvoices || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border border-green-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-400 mr-3" />
              <div>
                <p className="text-sm text-green-300">Paid Invoices</p>
                <p className="text-2xl font-bold text-white">
                  {financeData?.paidInvoices || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border border-yellow-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-yellow-400 mr-3" />
              <div>
                <p className="text-sm text-yellow-300">Pending</p>
                <p className="text-2xl font-bold text-white">
                  {financeData?.pendingInvoices || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0a101f] border border-red-900/30">
          <CardContent className="p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-red-400 mr-3" />
              <div>
                <p className="text-sm text-red-300">Overdue</p>
                <p className="text-2xl font-bold text-white">
                  {financeData?.overdueInvoices || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drill-Through Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-blue-900/20 border border-blue-800/50">
          <TabsTrigger 
            value="aging" 
            className="data-[state=active]:bg-blue-800 data-[state=active]:text-white text-blue-300"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Aging Analysis
          </TabsTrigger>
          <TabsTrigger 
            value="details" 
            className="data-[state=active]:bg-blue-800 data-[state=active]:text-white text-blue-300"
          >
            <FileText className="h-4 w-4 mr-2" />
            Invoice Details
          </TabsTrigger>
          <TabsTrigger 
            value="trends" 
            className="data-[state=active]:bg-blue-800 data-[state=active]:text-white text-blue-300"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Payment Trends
          </TabsTrigger>
        </TabsList>

        <TabsContent value="aging" className="space-y-4">
          <InvoiceAgingAnalysis 
            invoices={invoices} 
            loading={isLoading}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-4">
          <InvoiceDetailsList 
            invoices={invoices} 
            loading={isLoading}
            onInvoiceSelect={handleInvoiceSelect}
          />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <PaymentTrendsAnalysis 
            invoices={invoices} 
            loading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Selected Invoice Modal/Panel would go here */}
      {selectedInvoice && (
        <Card className="bg-[#0a101f] border border-blue-900/30 fixed bottom-4 right-4 w-96 z-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white text-sm">Invoice Selected</CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedInvoice(null)}
                className="text-blue-400 hover:text-blue-300"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 text-sm">
              <div className="text-blue-300">
                <strong>Invoice:</strong> {selectedInvoice.invoice_number}
              </div>
              <div className="text-blue-300">
                <strong>Client:</strong> {selectedInvoice.client_name}
              </div>
              <div className="text-blue-300">
                <strong>Amount:</strong> ${selectedInvoice.line_total.toLocaleString()}
              </div>
              <div className="text-blue-300">
                <strong>Status:</strong> {selectedInvoice.invoice_status}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinanceDrillThroughDashboard;
