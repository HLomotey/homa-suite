// @ts-nocheck - Suppressing TypeScript errors
// J-1 Participant History Component
// Displays the change history for a J-1 participant

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { supabase } from '@/integration/supabase';
import { History, Clock, User, FileText, X } from 'lucide-react';
import { format } from 'date-fns';

interface J1ParticipantHistoryProps {
  participantId: string;
  participantName: string;
  onClose: () => void;
}

interface HistoryRecord {
  id: string;
  original_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  country: string;
  gender: string;
  age: number;
  employer: string;
  business_key: string;
  archived_at: string;
  created_at: string;
  updated_at: string;
}

interface FlowStatusHistoryRecord {
  id: string;
  original_id: string;
  participant_id: string;
  ds2019_start_date: string;
  ds2019_end_date: string;
  embassy_appointment_date: string;
  arrival_date: string;
  onboarding_status: string;
  onboarding_scheduled_date: string;
  onboarding_completed_date: string;
  estimated_start_date: string;
  actual_start_date: string;
  estimated_end_date: string;
  actual_end_date: string;
  move_out_date: string;
  completion_status: string;
  notes: string;
  archived_at: string;
  created_at: string;
  updated_at: string;
}

export function J1ParticipantHistory({ participantId, participantName, onClose }: J1ParticipantHistoryProps) {
  const [participantHistory, setParticipantHistory] = useState<HistoryRecord[]>([]);
  const [flowStatusHistory, setFlowStatusHistory] = useState<FlowStatusHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, [participantId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load participant history
      const { data: participantData, error: participantError } = await supabase
        .from('j1_participants_history')
        .select('*')
        .eq('original_id', participantId)
        .order('archived_at', { ascending: false });

      if (participantError) throw participantError;

      // Load flow status history
      const { data: flowData, error: flowError } = await supabase
        .from('j1_flow_status_history')
        .select('*')
        .eq('participant_id', participantId)
        .order('archived_at', { ascending: false });

      if (flowError) throw flowError;

      setParticipantHistory(participantData || []);
      setFlowStatusHistory(flowData || []);
    } catch (err) {
      console.error('Error loading history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return dateString;
    }
  };

  const formatFieldName = (field: string) => {
    return field
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const compareRecords = (current: any, previous: any) => {
    const changes: { field: string; oldValue: any; newValue: any }[] = [];
    
    const fieldsToCompare = Object.keys(current).filter(
      key => !['id', 'original_id', 'participant_id', 'archived_at', 'created_at', 'updated_at', 'business_key'].includes(key)
    );

    fieldsToCompare.forEach(field => {
      if (current[field] !== previous[field]) {
        changes.push({
          field,
          oldValue: previous[field],
          newValue: current[field]
        });
      }
    });

    return changes;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <Card className="p-6 max-w-4xl w-full mx-4">
          <div className="text-center">Loading history...</div>
        </Card>
      </div>
    );
  }

  const totalChanges = participantHistory.length + flowStatusHistory.length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">Change History</h2>
              <p className="text-gray-600">{participantName}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded mb-4">
              {error}
            </div>
          )}

          {totalChanges === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No History Found</h3>
              <p className="text-gray-600">This participant has no recorded changes yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Total Changes</div>
                  <div className="text-2xl font-bold text-blue-600">{totalChanges}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Personal Info Changes</div>
                  <div className="text-2xl font-bold text-green-600">{participantHistory.length}</div>
                </Card>
                <Card className="p-4">
                  <div className="text-sm text-gray-600">Status Changes</div>
                  <div className="text-2xl font-bold text-purple-600">{flowStatusHistory.length}</div>
                </Card>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Change Timeline
                </h3>

                {/* Participant History */}
                {participantHistory.map((record, index) => {
                  const nextRecord = participantHistory[index + 1];
                  const changes = nextRecord ? compareRecords(record, nextRecord) : [];

                  return (
                    <Card key={record.id} className="p-4 border-l-4 border-l-blue-500">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-blue-600" />
                          <span className="font-medium">Personal Information Updated</span>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(record.archived_at)}
                          </Badge>
                        </div>
                      </div>

                      {changes.length > 0 ? (
                        <div className="space-y-2 ml-6">
                          {changes.map((change, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-700">{formatFieldName(change.field)}:</span>
                              <span className="text-red-600 line-through ml-2">{change.oldValue || 'N/A'}</span>
                              <span className="mx-2">→</span>
                              <span className="text-green-600">{change.newValue || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 ml-6">
                          Record archived (no changes detected)
                        </div>
                      )}
                    </Card>
                  );
                })}

                {/* Flow Status History */}
                {flowStatusHistory.map((record, index) => {
                  const nextRecord = flowStatusHistory[index + 1];
                  const changes = nextRecord ? compareRecords(record, nextRecord) : [];

                  return (
                    <Card key={record.id} className="p-4 border-l-4 border-l-purple-500">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="font-medium">Program Status Updated</span>
                          <Badge variant="outline" className="text-xs">
                            {formatDate(record.archived_at)}
                          </Badge>
                        </div>
                      </div>

                      {changes.length > 0 ? (
                        <div className="space-y-2 ml-6">
                          {changes.map((change, idx) => (
                            <div key={idx} className="text-sm">
                              <span className="font-medium text-gray-700">{formatFieldName(change.field)}:</span>
                              <span className="text-red-600 line-through ml-2">{change.oldValue || 'N/A'}</span>
                              <span className="mx-2">→</span>
                              <span className="text-green-600">{change.newValue || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600 ml-6">
                          Record archived (no changes detected)
                        </div>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </Card>
    </div>
  );
}
