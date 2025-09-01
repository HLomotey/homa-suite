import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Plus,
  Search,
  Edit,
  Eye,
  Trash2,
  Calendar,
  MapPin
} from "lucide-react";

// Import form component
import { MonthEndReportSheetForm } from "./components/sheet/MonthEndReportSheetForm";

import {
  FrontendMonthEndReport,
  ReportStatus,
  PropertyOption
} from "@/integration/supabase/types/month-end-reports";
import { useMonthEndReports } from "@/hooks/operations/month-end-reports/useMonthEndReports";

export interface MonthEndReportsProps {
  properties?: PropertyOption[];
  staffLocations?: any[];
}

export const MonthEndReports: React.FC<MonthEndReportsProps> = ({
  properties = [],
  staffLocations = []
}) => {
  const { toast } = useToast();
  const {
    reports,
    isLoading,
    createReport,
    updateReport,
    submitReport,
    approveReport,
    deleteReport
  } = useMonthEndReports();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<FrontendMonthEndReport | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit' | 'view'>('create');

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.headline?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.property_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNew = () => {
    setSelectedReport(null);
    setSheetMode('create');
    setIsSheetOpen(true);
  };

  const handleEdit = (report: FrontendMonthEndReport) => {
    setSelectedReport(report);
    setSheetMode('edit');
    setIsSheetOpen(true);
  };

  const handleView = (report: FrontendMonthEndReport) => {
    setSelectedReport(report);
    setSheetMode('view');
    setIsSheetOpen(true);
  };

  const handleDelete = async (reportId: string) => {
    if (window.confirm('Are you sure you want to delete this report?')) {
      try {
        await deleteReport(reportId);
      } catch (error) {
        console.error('Error deleting report:', error);
      }
    }
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
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Month-End Reports</h1>
          <p className="text-muted-foreground">Manage and review monthly operational reports</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="flex-1 overflow-auto p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Period</TableHead>
              <TableHead>Headline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead>Action Items</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  Loading reports...
                </TableCell>
              </TableRow>
            ) : filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  {searchTerm ? 'No reports match your search.' : 'No reports found. Create your first report to get started.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {report.property_name || 'Unknown Property'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        {formatDate(report.start_date)} - {formatDate(report.end_date)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {report.headline || 'No headline'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(report.status)}
                  </TableCell>
                  <TableCell>
                    {report.avg_occupancy_pct ? `${report.avg_occupancy_pct}%` : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {report.groups?.length || 0} groups
                      {report.total_rooms_blocked ? ` (${report.total_rooms_blocked} rooms)` : ''}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="text-green-600">{report.completed_action_items || 0} completed</div>
                      <div className="text-orange-600">{report.open_action_items || 0} open</div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(report.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleView(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {report.status !== 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(report)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(report.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'create' ? 'Create New Report' : 
               sheetMode === 'edit' ? 'Edit Report' : 'View Report'}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === 'create' ? 'Fill out the form below to create a new month-end report.' :
               sheetMode === 'edit' ? 'Update the report details below.' : 
               'Review the report details below.'}
            </SheetDescription>
          </SheetHeader>
          
          <MonthEndReportSheetForm
            report={selectedReport}
            mode={sheetMode}
            properties={properties}
            staffLocations={staffLocations}
            onSave={async (data) => {
              try {
                if (sheetMode === 'create') {
                  await createReport(data);
                  toast({
                    title: "Success",
                    description: "Report created successfully"
                  });
                } else if (sheetMode === 'edit' && selectedReport) {
                  await updateReport(selectedReport.id, data);
                  toast({
                    title: "Success",
                    description: "Report updated successfully"
                  });
                }
                setIsSheetOpen(false);
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to save report",
                  variant: "destructive"
                });
              }
            }}
            onSubmit={async (id) => {
              try {
                await submitReport(id);
                setIsSheetOpen(false);
              } catch (error) {
                console.error('Error submitting report:', error);
              }
            }}
            onApprove={async (id) => {
              try {
                await approveReport(id);
                setIsSheetOpen(false);
              } catch (error) {
                console.error('Error approving report:', error);
              }
            }}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MonthEndReports;
