import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FrontendMonthEndReport } from "@/integration/supabase/types/month-end-reports";
import { StaffingTab } from "../components/staffing/StaffingTab";
import { 
  Search, 
  Edit, 
  Target, 
  Building, 
  Calendar, 
  CheckCircle,
  Clock,
  Users,
  Plus,
  AlertTriangle
} from "lucide-react";

interface StaffingTableProps {
  reports: FrontendMonthEndReport[];
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const StaffingTable: React.FC<StaffingTableProps> = ({
  reports,
  onSave,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<FrontendMonthEndReport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.property_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditReport = (report: FrontendMonthEndReport) => {
    setSelectedReport(report);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedReport(null);
  };

  const getStaffingStatus = (trainingHours: number, absenteeismRate: number, incidents: number) => {
    if (incidents > 3 || absenteeismRate > 15) {
      return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
    } else if (incidents > 1 || absenteeismRate > 10) {
      return <Badge className="bg-yellow-100 text-yellow-800">Needs Attention</Badge>;
    } else if (trainingHours >= 8 && absenteeismRate < 5) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    } else {
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    }
  };

  const getActionItemsStatus = (actionItems: any[]) => {
    if (!actionItems || actionItems.length === 0) {
      return <Badge variant="outline" className="text-gray-600">No Items</Badge>;
    }

    const completedItems = actionItems.filter(item => item.status === "completed").length;
    const pendingItems = actionItems.filter(item => item.status === "pending").length;
    const inProgressItems = actionItems.filter(item => item.status === "in_progress").length;

    if (pendingItems === 0 && inProgressItems === 0) {
      return (
        <div className="flex items-center gap-1">
          <CheckCircle className="h-3 w-3 text-green-600" />
          <Badge className="bg-green-100 text-green-800">All Complete</Badge>
        </div>
      );
    } else if (pendingItems > inProgressItems) {
      return (
        <div className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3 text-yellow-600" />
          <Badge className="bg-yellow-100 text-yellow-800">{pendingItems} Pending</Badge>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3 text-blue-600" />
          <Badge className="bg-blue-100 text-blue-800">{inProgressItems} In Progress</Badge>
        </div>
      );
    }
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
            placeholder="Search by property..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Target className="h-4 w-4" />
            {filteredReports.length} properties
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Staffing Data
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Property</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-center">Training Hours</TableHead>
              <TableHead className="text-center">Absenteeism %</TableHead>
              <TableHead className="text-center">Incidents</TableHead>
              <TableHead className="text-center">Action Items</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No properties match your search" : "No staffing data available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => {
                const trainingHours = 0; // Will be derived from training notes
                const absenteeismRate = 0; // Will be calculated from absenteeism_notes
                const incidents = Number(report.incidents) || 0;
                
                // Use action items directly from report
                const actionItems = report.action_items || [];
                
                return (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                        {report.property_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        {formatDate(report.start_date)} - {formatDate(report.end_date)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold">
                        {trainingHours}h
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`font-semibold ${absenteeismRate > 10 ? 'text-red-600' : absenteeismRate > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {absenteeismRate.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={`font-semibold ${incidents > 2 ? 'text-red-600' : incidents > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
                        {incidents}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getActionItemsStatus(actionItems)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStaffingStatus(trainingHours, absenteeismRate, incidents)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleEditReport(report)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Sheet for form */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {selectedReport ? "Edit Staffing Data" : "Add Staffing Data"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property">Property</Label>
                <Select defaultValue={selectedReport?.property_name || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select property..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grand-hotel-downtown">Grand Hotel Downtown</SelectItem>
                    <SelectItem value="seaside-resort">Seaside Resort & Spa</SelectItem>
                    <SelectItem value="mountain-lodge">Mountain View Lodge</SelectItem>
                    <SelectItem value="city-center-inn">City Center Inn</SelectItem>
                    <SelectItem value="airport-hotel">Airport Business Hotel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="training-hours">Training Hours</Label>
                <Input 
                  id="training-hours" 
                  type="number" 
                  placeholder="40"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="open-actions">Open Action Items</Label>
                <Input 
                  id="open-actions" 
                  type="number"
                  placeholder="3"
                  defaultValue={selectedReport?.open_action_items || ""}
                />
              </div>
              <div>
                <Label htmlFor="completed-actions">Completed Action Items</Label>
                <Input 
                  id="completed-actions" 
                  type="number"
                  placeholder="7"
                  defaultValue={selectedReport?.completed_action_items || ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start-date">Start Date</Label>
                <Input 
                  id="start-date" 
                  type="date"
                  defaultValue={selectedReport?.start_date || ""}
                />
              </div>
              <div>
                <Label htmlFor="end-date">End Date</Label>
                <Input 
                  id="end-date" 
                  type="date"
                  defaultValue={selectedReport?.end_date || ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="staffing-notes">Staffing & Training Notes</Label>
              <Textarea 
                id="staffing-notes" 
                placeholder="Add notes about staffing levels, training programs, action items, performance metrics, etc."
                defaultValue={selectedReport?.narrative || ""}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button onClick={() => {
                onSave({});
                handleCloseForm();
              }}>
                Save Changes
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default StaffingTable;
