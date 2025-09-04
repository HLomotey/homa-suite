import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FrontendMonthEndReport, ReportStatus } from "@/integration/supabase/types/month-end-reports";
import MonthEndReports from "./MonthEndReportForm";
import { MonthEndReportFormData } from "./schemas/monthEndReportSchema";
import { 
  MoreHorizontal, 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Send, 
  CheckCircle,
  Search,
  Calendar,
  Building
} from "lucide-react";

interface MonthEndReportTableProps {
  reports: FrontendMonthEndReport[];
  properties: { id: string; name: string }[];
  onSave: (data: MonthEndReportFormData) => Promise<void>;
  onSubmit: (id: string) => Promise<void>;
  onApprove: (id: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isLoading?: boolean;
}

export const MonthEndReportTable: React.FC<MonthEndReportTableProps> = ({
  reports,
  properties,
  onSave,
  onSubmit,
  onApprove,
  onDelete,
  isLoading = false,
}) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<FrontendMonthEndReport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.hotel_site.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.headline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateReport = () => {
    setIsCreateMode(true);
    setSelectedReport(null);
    setIsFormOpen(true);
  };

  const handleEditReport = (report: FrontendMonthEndReport) => {
    setIsCreateMode(false);
    setSelectedReport(report);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedReport(null);
  };

  const handleSaveReport = async (data: MonthEndReportFormData) => {
    await onSave(data);
    // Don't close the form on save to allow for continued editing
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reports..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={handleCreateReport}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Hotel Site</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="w-[300px]">Headline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No reports match your search" : "No reports found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                      {report.hotel_site}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                      {formatDate(report.start_date)} - {formatDate(report.end_date)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="truncate">{report.headline}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEditReport(report)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        {report.status === "draft" && (
                          <DropdownMenuItem onClick={() => onSubmit(report.id)}>
                            <Send className="h-4 w-4 mr-2" />
                            Submit
                          </DropdownMenuItem>
                        )}
                        {report.status === "submitted" && (
                          <DropdownMenuItem onClick={() => onApprove(report.id)}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem 
                          onClick={() => onDelete(report.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet for form */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-3xl md:max-w-4xl lg:max-w-6xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>{isCreateMode ? "Create Report" : "Edit Report"}</SheetTitle>
          </SheetHeader>
          <MonthEndReports
            report={selectedReport || undefined}
            onSave={handleSaveReport}
            onSubmit={onSubmit}
            onApprove={onApprove}
            onCancel={handleCloseForm}
            properties={properties.map(p => ({ id: p.id, name: p.name }))}
            isLoading={isLoading}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MonthEndReportTable;
