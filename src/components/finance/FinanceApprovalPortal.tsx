/**
 * Finance Manager Portal for Security Deposit Refund Approvals
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  FileText, 
  Download, 
  Eye, 
  AlertTriangle,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  getRefundApprovalQueue, 
  getApprovalStats, 
  financeApproveRefund, 
  downloadRefundReport 
} from '@/integration/supabase/api/approval';
import { RefundApprovalQueueItem, ApprovalStats, ApprovalStatus } from '@/integration/supabase/types/approval';
import { AssessmentDetailsDisplay } from './AssessmentDetailsDisplay';

export const FinanceApprovalPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [approvalQueue, setApprovalQueue] = useState<RefundApprovalQueueItem[]>([]);
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus | 'all'>('requires_finance_approval');
  const [selectedDecision, setSelectedDecision] = useState<RefundApprovalQueueItem | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processingApproval, setProcessingApproval] = useState(false);

  // Load approval queue and stats
  useEffect(() => {
    loadApprovalData();
  }, [selectedStatus]);

  const loadApprovalData = async () => {
    setLoading(true);
    try {
      // Load approval queue
      const statusFilter = selectedStatus === 'all' ? undefined : selectedStatus;
      const { data: queueData, error: queueError } = await getRefundApprovalQueue(statusFilter);
      
      if (queueError) {
        toast({
          title: "Error Loading Queue",
          description: queueError,
          variant: "destructive"
        });
      } else {
        setApprovalQueue(queueData || []);
      }

      // Load stats
      const { data: statsData, error: statsError } = await getApprovalStats();
      
      if (statsError) {
        toast({
          title: "Error Loading Stats",
          description: statsError,
          variant: "destructive"
        });
      } else {
        setStats(statsData);
      }
    } catch (error) {
      console.error('Error loading approval data:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load approval data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (decision: RefundApprovalQueueItem, isApproved: boolean) => {
    if (!currentUser?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "User not authenticated",
        variant: "destructive"
      });
      return;
    }

    setProcessingApproval(true);
    try {
      const { success, error } = await financeApproveRefund(
        {
          refund_decision_id: decision.id,
          approval_notes: approvalNotes,
          is_approved: isApproved
        },
        currentUser.user.id
      );

      if (success) {
        toast({
          title: isApproved ? "Refund Approved" : "Refund Rejected",
          description: `Decision for ${decision.tenant_name} has been ${isApproved ? 'approved' : 'rejected'}`,
        });
        
        setSelectedDecision(null);
        setApprovalNotes('');
        await loadApprovalData();
      } else {
        toast({
          title: "Approval Failed",
          description: error || "Failed to process approval",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: "Processing Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setProcessingApproval(false);
    }
  };

  const handleDownloadReport = async (decision: RefundApprovalQueueItem) => {
    const { success, error } = await downloadRefundReport(decision.id);
    
    if (!success) {
      toast({
        title: "Download Failed",
        description: error || "Failed to download PDF report",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: ApprovalStatus) => {
    const variants = {
      pending: { variant: 'secondary' as const, icon: Clock, text: 'Pending' },
      requires_finance_approval: { variant: 'default' as const, icon: AlertTriangle, text: 'Finance Review' },
      approved: { variant: 'default' as const, icon: CheckCircle, text: 'Approved' },
      rejected: { variant: 'destructive' as const, icon: XCircle, text: 'Rejected' }
    };
    
    const config = variants[status];
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Finance Approval Portal</h1>
          <p className="text-muted-foreground">Review and approve security deposit refund decisions</p>
        </div>
        <Button onClick={loadApprovalData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.requires_finance_approval}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.pending_refund_amount.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All refund decisions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">
                Successfully approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Refunds</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.total_refund_amount.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total refund amount
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as ApprovalStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="requires_finance_approval">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Decisions</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4">
          {/* Approval Queue Table */}
          <Card>
            <CardHeader>
              <CardTitle>Refund Decisions</CardTitle>
              <CardDescription>
                {selectedStatus === 'requires_finance_approval' 
                  ? 'Decisions requiring your approval' 
                  : `${selectedStatus === 'all' ? 'All' : selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} refund decisions`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : approvalQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No decisions found for the selected filter
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Decision Type</TableHead>
                      <TableHead>Refund Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvalQueue.map((decision) => (
                      <TableRow key={decision.id}>
                        <TableCell className="font-medium">
                          {decision.tenant_name || 'Unknown'}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{decision.property_name}</div>
                            <div className="text-sm text-muted-foreground">{decision.room_name}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            decision.decision_type === 'Approved' ? 'default' :
                            decision.decision_type === 'Denied' ? 'destructive' : 'secondary'
                          }>
                            {decision.decision_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono">
                          ${decision.refund_amount.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(decision.approval_status)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(decision.created_at), 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground">
                              by {decision.approved_by_name || 'System'}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedDecision(decision)}
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  Review
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Refund Decision Review</DialogTitle>
                                </DialogHeader>
                                {selectedDecision && (
                                  <div className="space-y-6">
                                    {/* Decision Summary */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle>Decision Summary</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Tenant</Label>
                                            <div className="font-medium">{selectedDecision.tenant_name}</div>
                                          </div>
                                          <div>
                                            <Label>Property</Label>
                                            <div className="font-medium">
                                              {selectedDecision.property_name} - {selectedDecision.room_name}
                                            </div>
                                          </div>
                                          <div>
                                            <Label>Decision Type</Label>
                                            <div>{getStatusBadge(selectedDecision.approval_status)}</div>
                                          </div>
                                          <div>
                                            <Label>Refund Amount</Label>
                                            <div className="text-2xl font-bold text-green-600">
                                              ${selectedDecision.refund_amount.toFixed(2)}
                                            </div>
                                          </div>
                                        </div>
                                        
                                        {selectedDecision.total_deductions > 0 && (
                                          <Alert>
                                            <AlertTriangle className="h-4 w-4" />
                                            <AlertDescription>
                                              Total deductions: ${selectedDecision.total_deductions.toFixed(2)}
                                            </AlertDescription>
                                          </Alert>
                                        )}
                                      </CardContent>
                                    </Card>

                                    {/* Assessment Data */}
                                    <Card>
                                      <CardHeader>
                                        <CardTitle>Assessment Details</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <AssessmentDetailsDisplay assessmentData={selectedDecision.assessment_data} />
                                      </CardContent>
                                    </Card>

                                    {/* Finance Approval Section */}
                                    {selectedDecision.approval_status === 'requires_finance_approval' && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle>Finance Approval</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                          <div>
                                            <Label htmlFor="approval-notes">Approval Notes</Label>
                                            <Textarea
                                              id="approval-notes"
                                              placeholder="Add notes about your decision..."
                                              value={approvalNotes}
                                              onChange={(e) => setApprovalNotes(e.target.value)}
                                            />
                                          </div>
                                          
                                          <div className="flex gap-4">
                                            <Button
                                              onClick={() => handleApproval(selectedDecision, true)}
                                              disabled={processingApproval}
                                              className="flex-1"
                                            >
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Approve Refund
                                            </Button>
                                            <Button
                                              onClick={() => handleApproval(selectedDecision, false)}
                                              disabled={processingApproval}
                                              variant="destructive"
                                              className="flex-1"
                                            >
                                              <XCircle className="h-4 w-4 mr-2" />
                                              Reject Refund
                                            </Button>
                                          </div>
                                        </CardContent>
                                      </Card>
                                    )}

                                    {/* Previous Approvals */}
                                    {(selectedDecision.finance_approved_by_name || selectedDecision.hr_reviewed_by_name) && (
                                      <Card>
                                        <CardHeader>
                                          <CardTitle>Approval History</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                          {selectedDecision.finance_approved_by_name && (
                                            <div className="flex justify-between items-center">
                                              <span>Finance Approved by:</span>
                                              <span className="font-medium">
                                                {selectedDecision.finance_approved_by_name} on{' '}
                                                {format(new Date(selectedDecision.finance_approved_at!), 'MMM dd, yyyy HH:mm')}
                                              </span>
                                            </div>
                                          )}
                                          {selectedDecision.hr_reviewed_by_name && (
                                            <div className="flex justify-between items-center">
                                              <span>HR Reviewed by:</span>
                                              <span className="font-medium">
                                                {selectedDecision.hr_reviewed_by_name} on{' '}
                                                {format(new Date(selectedDecision.hr_reviewed_at!), 'MMM dd, yyyy HH:mm')}
                                              </span>
                                            </div>
                                          )}
                                        </CardContent>
                                      </Card>
                                    )}
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>

                            {decision.pdf_report_generated && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadReport(decision)}
                              >
                                <Download className="h-4 w-4 mr-1" />
                                PDF
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
