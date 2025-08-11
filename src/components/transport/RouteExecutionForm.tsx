import * as React from "react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FrontendRouteAssignment, 
  FrontendRouteExecutionLog 
} from "@/integration/supabase/types/transport-route";
import { Clock, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RouteExecutionFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  assignment: FrontendRouteAssignment;
  executionLog?: FrontendRouteExecutionLog | null;
  mode: 'start' | 'update';
}

export function RouteExecutionForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  assignment,
  executionLog,
  mode
}: RouteExecutionFormProps) {
  const [executionDate, setExecutionDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(format(new Date(), 'HH:mm'));
  const [endTime, setEndTime] = useState('');
  const [status, setStatus] = useState<'completed' | 'delayed' | 'cancelled'>('completed');
  const [notes, setNotes] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when opened or when execution log changes
  useEffect(() => {
    if (open) {
      if (mode === 'start') {
        setExecutionDate(format(new Date(), 'yyyy-MM-dd'));
        setStartTime(format(new Date(), 'HH:mm'));
        setEndTime('');
        setStatus('completed');
        setNotes('');
        setDelayReason('');
      } else if (executionLog) {
        setExecutionDate(executionLog.executionDate);
        setStartTime(executionLog.startTime);
        setEndTime(executionLog.endTime || format(new Date(), 'HH:mm'));
        setStatus(executionLog.status === 'started' ? 'completed' : executionLog.status);
        setNotes(executionLog.notes || '');
        setDelayReason(executionLog.delayReason || '');
      }
    }
  }, [open, executionLog, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (mode === 'start') {
      if (!executionDate || !startTime) {
        toast({
          title: "Validation Error",
          description: "Execution date and start time are required",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!endTime) {
        toast({
          title: "Validation Error",
          description: "End time is required",
          variant: "destructive",
        });
        return;
      }
      
      if (status === 'delayed' && !delayReason) {
        toast({
          title: "Validation Error",
          description: "Please provide a reason for the delay",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would call the API
      // For now, we just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Success",
        description: mode === 'start' 
          ? "Route execution started successfully" 
          : `Route execution ${status} successfully`,
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error submitting route execution:", error);
      toast({
        title: "Error",
        description: mode === 'start' 
          ? "Failed to start route execution" 
          : "Failed to update route execution",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {mode === 'start' ? "Start Route Execution" : "Update Route Execution"}
          </SheetTitle>
        </SheetHeader>
        
        <div className="py-4">
          <div className="bg-muted/50 p-4 rounded-md mb-4">
            <h3 className="font-medium text-lg">{assignment.combinedRouteName}</h3>
            <p className="text-sm text-muted-foreground">
              Vehicle: {assignment.vehicleInfo}
            </p>
            <div className="flex items-center mt-2">
              <Badge variant={
                assignment.status === 'completed' ? 'success' :
                assignment.status === 'in_progress' ? 'warning' :
                assignment.status === 'cancelled' ? 'destructive' :
                'outline'
              }>
                {assignment.status === 'in_progress' ? 'In Progress' :
                 assignment.status === 'scheduled' ? 'Scheduled' :
                 assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
              </Badge>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'start' ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="executionDate">Execution Date</Label>
                  <Input
                    id="executionDate"
                    type="date"
                    value={executionDate}
                    onChange={(e) => setExecutionDate(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="startTime"
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about starting this route"
                  disabled={isSubmitting}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={status}
                  onValueChange={(value: 'completed' | 'delayed' | 'cancelled') => setStatus(value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status" className="flex items-center">
                    {status === 'completed' && <CheckCircle className="h-4 w-4 mr-2 text-green-500" />}
                    {status === 'delayed' && <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />}
                    {status === 'cancelled' && <XCircle className="h-4 w-4 mr-2 text-red-500" />}
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="completed">
                      <div className="flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        <span>Completed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="delayed">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                        <span>Delayed</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="cancelled">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-red-500" />
                        <span>Cancelled</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {status === 'delayed' && (
                <div className="space-y-2">
                  <Label htmlFor="delayReason">Reason for Delay</Label>
                  <Textarea
                    id="delayReason"
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    placeholder="Please explain the reason for the delay"
                    disabled={isSubmitting}
                  />
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any additional notes about this route execution"
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting 
                ? "Saving..." 
                : mode === 'start' 
                  ? "Start Route" 
                  : `Mark as ${status.charAt(0).toUpperCase() + status.slice(1)}`
              }
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
