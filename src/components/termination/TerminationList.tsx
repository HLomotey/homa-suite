import { useState } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
// Import types and utilities from the termination hook
import { TerminationRequest } from '../../hooks/useTermination';

// Utility functions and constants
const formatDate = (date: string | Date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};

const getTerminationUrgency = (effectiveDate: string) => {
  const today = new Date();
  const termDate = new Date(effectiveDate);
  const diffTime = termDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'urgent';
  return 'normal';
};

// Label mappings
const TERMINATION_REASON_LABELS: Record<string, string> = {
  voluntary: 'Voluntary',
  involuntary: 'Involuntary',
  layoff: 'Layoff',
  retirement: 'Retirement'
};

const SEPARATION_TYPE_LABELS: Record<string, string> = {
  resignation: 'Resignation',
  termination: 'Termination',
  layoff: 'Layoff',
  retirement: 'Retirement'
};

const REHIRE_ELIGIBILITY_LABELS: Record<string, string> = {
  eligible: 'Eligible',
  not_eligible: 'Not Eligible',
  conditional: 'Conditional'
};

const TERMINATION_STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  pending_manager: 'Pending Manager Approval',
  pending_hr: 'Pending HR Approval',
  approved: 'Approved',
  processing: 'Processing',
  completed: 'Completed',
  rejected: 'Rejected'
};

const TERMINATION_STATUS_COLORS: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-800',
  pending_manager: 'bg-yellow-100 text-yellow-800',
  pending_hr: 'bg-blue-100 text-blue-800',
  approved: 'bg-green-100 text-green-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800'
};
import { useAuth } from '@/components/auth/AuthProvider';

interface TerminationListProps {
  terminations: TerminationRequest[];
  onEdit: (termination: TerminationRequest) => void;
  onApprove: (termination: TerminationRequest, role: 'manager' | 'hr') => void;
  onMarkADPProcessed: (termination: TerminationRequest) => void;
  loading?: boolean;
}

export function TerminationList({ 
  terminations, 
  onEdit, 
  onApprove, 
  onMarkADPProcessed,
  loading = false 
}: TerminationListProps) {
  const { currentUser } = useAuth();
  const [selectedTermination, setSelectedTermination] = useState<string | null>(null);

  const isHRUser = currentUser?.user?.user_metadata?.role === 'admin';
  const isManager = currentUser?.user?.user_metadata?.role === 'employer';

  const canApprove = (termination: TerminationRequest, role: 'manager' | 'hr') => {
    if (role === 'manager') {
      return isManager && 
             !termination.manager_approved_at && 
             (termination.manager_associate_id === currentUser?.user?.id || termination.initiated_by === currentUser?.user?.id);
    }
    if (role === 'hr') {
      return isHRUser && 
             !termination.hr_approved_at && 
             termination.status === 'pending_hr_approval';
    }
    return false;
  };

  const canMarkADPProcessed = (termination: TerminationRequest) => {
    return isHRUser && 
           termination.status === 'approved' && 
           !termination.adp_processed;
  };

  const getUrgencyBadge = (effectiveDate: string) => {
    const urgency = getTerminationUrgency(effectiveDate);
    switch (urgency) {
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'urgent':
        return <Badge variant="secondary">Urgent</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded"></div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (terminations.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="text-gray-500">
          <h3 className="text-lg font-medium mb-2">No termination requests found</h3>
          <p>There are currently no termination requests to display.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {terminations.map((termination) => (
        <Card key={termination.id} className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900">
                  {termination.employee_name}
                </h3>
                <Badge className={TERMINATION_STATUS_COLORS[termination.status]}>
                  {TERMINATION_STATUS_LABELS[termination.status]}
                </Badge>
                {getUrgencyBadge(termination.effective_date)}
              </div>
              <p className="text-sm text-gray-600 mb-1">
                {termination.employee_email}
              </p>
              <p className="text-sm text-gray-500">
                Initiated by: {termination.initiated_by_name}
              </p>
            </div>
            
            <div className="flex space-x-2">
              {/* Manager Approval */}
              {canApprove(termination, 'manager') && (
                <Button
                  size="sm"
                  onClick={() => onApprove(termination, 'manager')}
                >
                  Manager Approve
                </Button>
              )}
              
              {/* HR Approval */}
              {canApprove(termination, 'hr') && (
                <Button
                  size="sm"
                  onClick={() => onApprove(termination, 'hr')}
                >
                  HR Approve
                </Button>
              )}
              
              {/* Mark ADP Processed */}
              {canMarkADPProcessed(termination) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onMarkADPProcessed(termination)}
                >
                  Mark ADP Processed
                </Button>
              )}
              
              {/* Edit Button */}
              {(isHRUser || termination.initiated_by === currentUser?.user?.id) && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(termination)}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>

          {/* Termination Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Effective Date
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(termination.effective_date)}
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Last Day Worked
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {formatDate(termination.last_day_worked)}
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Separation Type
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {SEPARATION_TYPE_LABELS[termination.separation_type]}
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Rehire Eligible
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {REHIRE_ELIGIBILITY_LABELS[termination.rehire_eligible]}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Reason for Leaving
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {TERMINATION_REASON_LABELS[termination.reason_for_leaving]}
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                ADP Status
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {termination.adp_processed ? (
                  <span className="text-green-600">✓ Processed</span>
                ) : (
                  <span className="text-orange-600">Pending</span>
                )}
              </p>
            </div>
          </div>

          {/* Approval Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                Manager Approval
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {termination.manager_approved_at ? (
                  <span className="text-green-600">
                    ✓ Approved on {formatDate(termination.manager_approved_at)}
                  </span>
                ) : (
                  <span className="text-orange-600">Pending</span>
                )}
              </p>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                HR Approval
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {termination.hr_approved_at ? (
                  <span className="text-green-600">
                    ✓ Approved on {formatDate(termination.hr_approved_at)}
                  </span>
                ) : (
                  <span className="text-orange-600">Pending</span>
                )}
              </p>
            </div>
          </div>

          {/* Expandable Details */}
          {selectedTermination === termination.id && (
            <div className="border-t pt-4 mt-4 space-y-4">
              {termination.notes && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Notes
                  </label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {termination.notes}
                  </p>
                </div>
              )}
              
              {termination.manager_comments && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Manager Comments
                  </label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {termination.manager_comments}
                  </p>
                </div>
              )}
              
              {termination.hr_comments && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide">
                    HR Comments
                  </label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {termination.hr_comments}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Toggle Details Button */}
          <div className="border-t pt-4 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedTermination(
                selectedTermination === termination.id ? null : termination.id
              )}
            >
              {selectedTermination === termination.id ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
