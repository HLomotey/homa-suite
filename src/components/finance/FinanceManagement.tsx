import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt, CreditCard } from 'lucide-react';
import { UploadComponent } from '@/components/excel-upload/UploadComponent';

export function FinanceManagement() {
  const invoiceConfig = {
    title: "Invoice Data",
    icon: Receipt,
    description: "Upload Excel files to update invoice and revenue data",
    badgeText: "Invoices",
    expectedColumns: [
      "Client Name",
      "Company Account",
      "Invoice #",
      "Date",
      "Invoice Status",
      "Date Paid",
      "Item Description",
      "Rate",
      "Quantity",
      "Discount Percentage",
      "Line Subtotal",
      "Tax 1 Type",
      "Tax 1 Amount",
      "Tax 2 Type",
      "Tax 2 Amount",
      "Line Total",
      "Currency",
    ],
    guidelines: [
      "First row should contain column headers",
      "Date format: MM/DD/YYYY or YYYY-MM-DD",
      "Rate and quantities should be numeric values",
      "Discount percentage should be between 0-100",
      "Invoice Status: pending, paid, overdue, cancelled",
      "Tax types should be GST, VAT, or Sales Tax",
      "Currency should be standard 3-letter code (USD, EUR, GBP)",
      "Maximum file size: 10MB",
    ],
    templateName: "finance_invoice_template.csv",
  };

  const expenseConfig = {
    title: "Expense Data",
    icon: CreditCard,
    description: "Upload Excel files to update expense data",
    badgeText: "Expenses",
    expectedColumns: [
      "Company",
      "Date",
      "Type",
      "Payee",
      "Category",
      "Total",
    ],
    guidelines: [
      "First row should contain column headers",
      "Date format: MM/DD/YYYY or YYYY-MM-DD",
      "Total should be numeric values",
      "Type should be: Expense",
      "Company should match your organization name",
      "Category examples: Office Supplies, Travel, Utilities, etc.",
      "Payee should be the vendor or recipient name",
      "Maximum file size: 10MB",
    ],
    templateName: "finance_expense_template.csv",
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Finance Management</h2>
        <p className="text-gray-600">
          Manage invoices and expenses for comprehensive financial tracking
        </p>
      </div>

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Invoices & Revenue
          </TabsTrigger>
          <TabsTrigger value="expenses" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Expenses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Invoice & Revenue Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadComponent {...invoiceConfig} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Expense Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadComponent {...expenseConfig} dataType="expense" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
