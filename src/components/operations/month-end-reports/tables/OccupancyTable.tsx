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
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FrontendMonthEndReport } from "@/integration/supabase/types/month-end-reports";
import { OccupancyTab } from "../components/occupancy/OccupancyTab";
import { 
  Search, 
  Edit, 
  TrendingUp, 
  TrendingDown, 
  Hotel,
  Calendar,
  Building,
  Plus
} from "lucide-react";

interface OccupancyTableProps {
  reports: FrontendMonthEndReport[];
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const OccupancyTable: React.FC<OccupancyTableProps> = ({
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

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) {
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    } else if (current < previous) {
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    }
    return null;
  };

  const getOccupancyBadge = (occupancy: number) => {
    if (occupancy >= 90) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (occupancy >= 75) {
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    } else if (occupancy >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
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
            <Hotel className="h-4 w-4" />
            {filteredReports.length} properties
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Occupancy Data
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Property</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-center">Current Occupancy</TableHead>
              <TableHead className="text-center">Previous Occupancy</TableHead>
              <TableHead className="text-center">Change</TableHead>
              <TableHead className="text-center">Performance</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No properties match your search" : "No occupancy data available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => {
                const currentOccupancy = report.avg_occupancy_pct || 0;
                const previousOccupancy = 0; // Will be calculated from historical data
                const change = currentOccupancy - previousOccupancy;
                
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
                      <div className="font-semibold text-lg">
                        {currentOccupancy.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="text-muted-foreground">
                        {previousOccupancy.toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        {getTrendIcon(currentOccupancy, previousOccupancy)}
                        <span className={change >= 0 ? "text-green-600" : "text-red-600"}>
                          {change >= 0 ? "+" : ""}{change.toFixed(1)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getOccupancyBadge(currentOccupancy)}
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
            <SheetTitle>Edit Occupancy Data</SheetTitle>
          </SheetHeader>
          {selectedReport && (
            <div className="text-center py-8 text-muted-foreground">
              Form integration will be implemented here
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default OccupancyTable;
