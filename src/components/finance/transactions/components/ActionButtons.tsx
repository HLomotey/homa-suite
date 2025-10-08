import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ROUTES } from "@/routes/constants";
import { Trash2, Download, Upload } from "lucide-react";

interface ActionButtonsProps {
  selectedIds: string[];
  onDelete: () => void;
  onExport: () => void;
  isDeleting: boolean;
}

export function ActionButtons({
  selectedIds,
  onDelete,
  onExport,
  isDeleting,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {selectedIds.length > 0 && (
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          disabled={isDeleting}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete {selectedIds.length} item
          {selectedIds.length > 1 ? "s" : ""}
        </Button>
      )}
      <Button onClick={onExport} variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
      <Button asChild variant="default">
        <Link
          to={ROUTES.FINANCE_UPLOAD}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Transactions
        </Link>
      </Button>
    </div>
  );
}
