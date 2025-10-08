import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, FileText, CheckCircle } from 'lucide-react';
import { FinanceOverview } from './FinanceOverview';
import { FinanceAnalyticsTab } from './FinanceAnalyticsTab';
import { FinanceReports } from './FinanceReports';
import { FinanceApprovalPortal } from './FinanceApprovalPortal';

const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finance Management</h1>
          <p className="text-muted-foreground">
            Comprehensive financial oversight and approval workflows
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="approvals" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Approvals
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <FinanceOverview />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <FinanceAnalyticsTab />
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Security Deposit Refund Approvals
              </CardTitle>
              <CardDescription>
                Review and approve security deposit refund decisions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FinanceApprovalPortal />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <FinanceReports />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Finance;
