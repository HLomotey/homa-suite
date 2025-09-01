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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Plus, Edit, Trash2, Loader2, Search, TrendingUp, TrendingDown, Hotel, Calendar, Building } from "lucide-react";
import { useProperties } from "@/hooks/property/useProperties";
import { FrontendMonthEndReport } from "@/integration/supabase/types/month-end-reports";
import { OccupancyTab } from "../components/occupancy/OccupancyTab";

interface OccupancyTableProps {
  reports: FrontendMonthEndReport[];
  onEdit: (data: any) => Promise<void>;
  onDelete: (data: any) => Promise<void>;
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const OccupancyTable: React.FC<OccupancyTableProps> = ({
  reports,
  onEdit,
  onDelete,
  onSave,
  isLoading = false,
}) => {
  const { properties, isLoading: propertiesLoading } = useProperties();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<FrontendMonthEndReport | null>(null);
  const [formData, setFormData] = useState({
    property_id: "",
    property_name: "",
    avg_occupancy_pct: "",
    start_date: "",
    end_date: "",
    occupancy_notes: "",
  });

  const handleEdit = (report: FrontendMonthEndReport) => {
    setEditingReport(report);
    setFormData({
      property_id: report.property_id || "",
      property_name: report.property_name || "",
      avg_occupancy_pct: report.avg_occupancy_pct?.toString() || "",
      start_date: report.start_date || "",
      end_date: report.end_date || "",
      occupancy_notes: report.occupancy_notes || "",
    });
    setIsSheetOpen(true);
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

  const handleAddNew = () => {
    setEditingReport(null);
    setFormData({
      property_id: "",
      property_name: "",
      avg_occupancy_pct: "",
      start_date: "",
      end_date: "",
      occupancy_notes: "",
    });
    setIsSheetOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-72">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by property..."
            className="pl-8"
            value={""}
            onChange={(e) => {}}
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hotel className="h-4 w-4" />
            {reports.length} properties
          </div>
          <Button onClick={handleAddNew}>
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
            {reports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No occupancy data available
                </TableCell>
              </TableRow>
            ) : (
              reports.map((report) => {
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
                        onClick={() => handleEdit(report)}
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
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>
              {editingReport ? "Edit Occupancy Data" : "Add Occupancy Data"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_id">Property</Label>
                {propertiesLoading ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading properties...</span>
                  </div>
                ) : (
                  <div className="mt-2">
                    <SearchableSelect
                      options={properties.map((property) => ({
                        value: property.id,
                        label: `${property.title} - ${property.address || (property.location?.city) || (property.location?.state) || 'No address'}`,
                      }))}
                      value={formData.property_id}
                      placeholder="Search and select property..."
                      emptyMessage="No properties found."
                      onValueChange={(value) => {
                        const selectedProperty = properties.find((p) => p.id === value);
                        setFormData({
                          ...formData,
                          property_id: value,
                          property_name: selectedProperty?.title || "",
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="occupancy">Average Occupancy %</Label>
                <Input 
                  id="occupancy" 
                  type="number" 
                  placeholder="85.5"
                  value={formData.avg_occupancy_pct}
                  onChange={(e) => setFormData({ ...formData, avg_occupancy_pct: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date</Label>
                <Input 
                  id="start_date" 
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date</Label>
                <Input 
                  id="end_date" 
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="occupancy_notes">Occupancy Notes</Label>
              <Textarea 
                id="occupancy_notes" 
                placeholder="Add notes about occupancy trends, seasonal factors, etc."
                value={formData.occupancy_notes}
                onChange={(e) => setFormData({ ...formData, occupancy_notes: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsSheetOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle save logic here
                onSave(formData);
                setIsSheetOpen(false);
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

export default OccupancyTable;
