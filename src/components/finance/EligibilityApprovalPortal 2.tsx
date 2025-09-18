/**
 * Finance Manager Portal for Eligibility Assessment Approvals
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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Users, 
  FileText, 
  AlertTriangle,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { 
  getEligibilityApprovalQueue, 
  getEligibilityApprovalStats, 
  financeApproveEligibilityAssessment 
} from '@/integration/supabase/api/eligibility';
import { EligibilityAssessmentQueueItem, EligibilityApprovalStats } from '@/integration/supabase/api/eligibility';
import { AssessmentDetailsDisplay } from './AssessmentDetailsDisplay';

type EligibilityStatus = 'pending_finance_approval' | 'approved' | 'rejected';

export const EligibilityApprovalPortal: React.FC = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [approvalQueue, setApprovalQueue] = useState<EligibilityAssessmentQueueItem[]>([]);
  const [stats, setStats] = useState<EligibilityApprovalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<EligibilityStatus | 'all'>('pending_finance_approval');
  const [selectedAssessment, setSelectedAssessment] = useState<EligibilityAssessmentQueueItem | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // Load data on component mount and when status changes
  useEffect(() => {
    loadData();
  }, [selectedStatus]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [queueData, statsData] = await Promise.all([
        getEligibilityApprovalQueue(selectedStatus),
        getEligibilityApprovalStats()
      ]);
      
      setApprovalQueue(queueData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading approval data:', error);
      toast({
        title: "Loading Failed",
        description: "Failed to load approval queue data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (assessmentId: string, isApproved: boolean) => {
    if (!currentUser?.user?.id) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to approve assessments.",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const result = await financeApproveEligibilityAssessment(
        {
          assessment_id: assessmentId,
          approval_notes: approvalNotes,
          is_approved: isApproved
        },
        currentUser.user.id
      );

      if (result.success) {
        toast({
          title: isApproved ? "Assessment Approved" : "Assessment Rejected",
          description: isApproved 
            ? "Eligibility assessment approved. Refund decision has been created and PDF will be available."
            : "Eligibility assessment has been rejected.",
        });
        
        setSelectedAssessment(null);
        setApprovalNotes('');
        await loadData(); // Refresh the data
      } else {
        toast({
          title: "Approval Failed",
          description: result.error || "Failed to process approval.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      toast({
        title: "Approval Error",
        description: "An unexpected error occurred while processing the approval.",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: EligibilityStatus) => {
    switch (status) {
      case 'pending_finance_approval':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case 'approved':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const filteredQueue = approvalQueue.filter(item => 
    selectedStatus === 'all' || item.status === selectedStatus
  );

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending_finance_approval}</div>
              <p className="text-xs text-muted-foreground">
                ${stats.pending_refund_amount.toLocaleString()} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Assessments</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All eligibility assessments
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
      <Tabs value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as EligibilityStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="pending_finance_approval">Pending Approval</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedStatus} className="space-y-4">
          {/* Approval Queue Table */}
          <Card>
            <CardHeader>
              <CardTitle>Eligibility Assessment Queue</CardTitle>
              <CardDescription>
                Review and approve eligibility assessments for security deposit refunds
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading assessments...</div>
              ) : filteredQueue.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No assessments found for the selected status.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tenant</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Refund Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assessed By</TableHead>
                      <TableHead>Assessment Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQueue.map((assessment) => (
                      <TableRow key={assessment.id}>
                        <TableCell className="font-medium">{assessment.tenant_name}</TableCell>
                        <TableCell>{assessment.property_name} - {assessment.room_name}</TableCell>
                        <TableCell className="font-bold text-green-600">
                          ${parseFloat(assessment.calculated_result?.refundAmount || 0).toFixed(2)}
                        </TableCell>
                        <TableCell>{getStatusBadge(assessment.status)}</TableCell>
                        <TableCell>{assessment.assessed_by_name}</TableCell>
                        <TableCell>{format(new Date(assessment.assessed_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setSelectedAssessment(assessment)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Review
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Assessment Review - {assessment.tenant_name}</DialogTitle>
                                <DialogDescription>
                                  Review eligibility assessment details and approve or reject the security deposit refund request.
                                </DialogDescription>
                              </DialogHeader>
                              
                              {selectedAssessment && (
                                <div className="space-y-6">
                                  {/* Assessment Summary */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Assessment Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>Tenant</Label>
                                          <div className="font-medium">{selectedAssessment.tenant_name}</div>
                                        </div>
                                        <div>
                                          <Label>Property</Label>
                                          <div className="font-medium">
                                            {selectedAssessment.property_name} - {selectedAssessment.room_name}
                                          </div>
                                        </div>
                                        <div>
                                          <Label>Status</Label>
                                          <div>{getStatusBadge(selectedAssessment.status)}</div>
                                        </div>
                                        <div>
                                          <Label>Refund Amount</Label>
                                          <div className="text-2xl font-bold text-green-600">
                                            ${parseFloat(selectedAssessment.calculated_result?.refundAmount || 0).toFixed(2)}
                                          </div>
                                        </div>
                                      </div>
                                    </CardContent>
                                  </Card>

                                  {/* Assessment Details */}
                                  <Card>
                                    <CardHeader>
                                      <CardTitle>Assessment Details</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                      <AssessmentDetailsDisplay assessmentData={selectedAssessment.assessment_data} />
                                    </CardContent>
                                  </Card>

                                  {/* Finance Approval Section */}
                                  {selectedAssessment.status === 'pending_finance_approval' && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle>Finance Approval</CardTitle>
                                      </CardHeader>
                                      <CardContent className="space-y-4">
                                        <div>
                                          <Label htmlFor="approval-notes">Approval Notes</Label>
                                          <Textarea
                                            id="approval-notes"
                                            placeholder="Add notes about your approval decision..."
                                            value={approvalNotes}
                                            onChange={(e) => setApprovalNotes(e.target.value)}
                                          />
                                        </div>
                                        
                                        <div className="flex gap-4">
                                          <Button
                                            onClick={() => handleApproval(selectedAssessment.id, true)}
                                            disabled={processing}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            <ThumbsUp className="h-4 w-4 mr-2" />
                                            Approve Assessment
                                          </Button>
                                          <Button
                                            onClick={() => handleApproval(selectedAssessment.id, false)}
                                            disabled={processing}
                                            variant="destructive"
                                          >
                                            <ThumbsDown className="h-4 w-4 mr-2" />
                                            Reject Assessment
                                          </Button>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )}

                                  {/* Previous Approval Info */}
                                  {selectedAssessment.status !== 'pending_finance_approval' && (
                                    <Card>
                                      <CardHeader>
                                        <CardTitle>Approval Information</CardTitle>
                                      </CardHeader>
                                      <CardContent>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <Label>Approved By</Label>
                                            <div className="font-medium">{selectedAssessment.finance_approved_by_name}</div>
                                          </div>
                                          <div>
                                            <Label>Approval Date</Label>
                                            <div className="font-medium">
                                              {selectedAssessment.finance_approved_at 
                                                ? format(new Date(selectedAssessment.finance_approved_at), 'MMM dd, yyyy HH:mm')
                                                : 'N/A'
                                              }
                                            </div>
                                          </div>
                                        </div>
                                        {selectedAssessment.finance_approval_notes && (
                                          <div className="mt-4">
                                            <Label>Approval Notes</Label>
                                            <div className="mt-2 p-3 bg-muted rounded-md">
                                              {selectedAssessment.finance_approval_notes}
                                            </div>
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
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

export default EligibilityApprovalPortal;
