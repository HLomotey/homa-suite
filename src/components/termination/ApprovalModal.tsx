import { useState } from 'react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
// Import types and utilities from the termination hook
import { TerminationRequest } from '../../hooks/useTermination';

// Utility function for date formatting
const formatDate = (date: string | Date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
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

interface ApprovalModalProps {
  termination: TerminationRequest;
  role: 'manager' | 'hr';
  onApprove: (comments?: string) => Promise<void>;
  onReject: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ApprovalModal({ 
  termination, 
  role, 
  onApprove, 
  onReject, 
  onClose, 
  loading = false 
}: ApprovalModalProps) {
  const [comments, setComments] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(comments);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {role === 'manager' ? 'Manager' : 'HR'} Approval Required
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading}
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Employee Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Employee Information</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Name</label>
                  <p className="text-sm text-gray-900">
                    {termination.employee_name}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm text-gray-900">{termination.employee_email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Termination Details */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Termination Details</h3>
            <div className="bg-gray-50 p-4 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Effective Date</label>
                  <p className="text-sm text-gray-900">{formatDate(termination.effective_date)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Day Worked</label>
                  <p className="text-sm text-gray-900">{formatDate(termination.last_day_worked)}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Separation Type</label>
                  <p className="text-sm text-gray-900">
                    {SEPARATION_TYPE_LABELS[termination.separation_type]}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rehire Eligible</label>
                  <p className="text-sm text-gray-900">
                    {REHIRE_ELIGIBILITY_LABELS[termination.rehire_eligible]}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500">Reason for Leaving</label>
                <p className="text-sm text-gray-900">
                  {TERMINATION_REASON_LABELS[termination.reason_for_leaving]}
                </p>
              </div>

              {termination.notes && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Notes</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">{termination.notes}</p>
                </div>
              )}

              {termination.manager_comments && role === 'hr' && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Manager Comments</label>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {termination.manager_comments}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Approval Comments */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {role === 'manager' ? 'Manager' : 'HR'} Comments
            </label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={`Add your ${role} comments for this termination...`}
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading || isApproving}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              onClick={onReject}
              disabled={loading || isApproving}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={loading || isApproving}
            >
              Approve
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
