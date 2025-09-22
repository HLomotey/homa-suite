import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Save, Send, CheckCircle } from "lucide-react";
import { ReportStatus } from "@/integration/supabase/types/month-end-reports";

interface FormActionsProps {
  status?: ReportStatus;
  reportId?: string;
  lastSaved: Date | null;
  isLoading: boolean;
  onSave: () => void;
  onSubmit?: (id: string) => Promise<void>;
  onApprove?: (id: string) => Promise<void>;
  onCancel: () => void;
}

export const FormActions: React.FC<FormActionsProps> = ({
  status,
  reportId,
  lastSaved,
  isLoading,
  onSave,
  onSubmit,
  onApprove,
  onCancel
}) => {
  const handleSubmitReport = async () => {
    if (!reportId || !onSubmit) return;
    await onSubmit(reportId);
  };

  const handleApproveReport = async () => {
    if (!reportId || !onApprove) return;
    await onApprove(reportId);
  };

  const getStatusBadge = (status: ReportStatus) => {
    const variants = {
      draft: "secondary",
      submitted: "default",
      approved: "default"
    } as const;

    const colors = {
      draft: "bg-gray-100 text-gray-800",
      submitted: "bg-blue-100 text-blue-800",
      approved: "bg-green-100 text-green-800"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="flex items-center gap-4 mt-2">
          {status && getStatusBadge(status)}
          {lastSaved && (
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <Save className="h-3 w-3" />
              Saved • {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
        {status === "draft" && reportId && onSubmit && (
          <Button onClick={handleSubmitReport} disabled={isLoading}>
            <Send className="h-4 w-4 mr-2" />
            Submit
          </Button>
        )}
        {status === "submitted" && reportId && onApprove && (
          <Button onClick={handleApproveReport} disabled={isLoading}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        )}
      </div>
    </div>
  );
};

export default FormActions;
