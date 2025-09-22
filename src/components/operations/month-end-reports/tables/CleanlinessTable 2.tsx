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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";
import { Plus, Edit, Trash2, Star, AlertTriangle, CheckCircle, Loader2, Search, Building, Calendar, Shield, Sparkles } from "lucide-react";
import { useProperties } from "@/hooks/property/useProperties";
import useStaffLocation from "@/hooks/transport/useStaffLocation";
import { FrontendMonthEndReport } from "@/integration/supabase/types/month-end-reports";
import { CleanlinessTab } from "../components/cleanliness/CleanlinessTab";

interface CleanlinessTableProps {
  reports: FrontendMonthEndReport[];
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const CleanlinessTable: React.FC<CleanlinessTableProps> = ({
  reports,
  onSave,
  isLoading = false,
}) => {
  const { properties, isLoading: propertiesLoading } = useProperties();
  const { staffLocations, loading: staffLocationsLoading } = useStaffLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<FrontendMonthEndReport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    property_id: "",
    hotel_site: "",
    cleanliness_score: "",
    start_date: "",
    end_date: "",
    cleanliness_comments: "",
  });

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.hotel_site.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditReport = (report: FrontendMonthEndReport) => {
    setSelectedReport(report);
    setFormData({
      property_id: report.property_id || "",
      hotel_site: report.hotel_site || "",
      cleanliness_score: report.cleanliness_score?.toString() || "",
      start_date: report.start_date || "",
      end_date: report.end_date || "",
      cleanliness_comments: report.cleanliness_comments || "",
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedReport(null);
  };

  const getCleanlinessRating = (score: number) => {
    const stars = Math.round(score);
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= stars 
                ? "text-yellow-400 fill-yellow-400" 
                : "text-gray-300"
            }`}
          />
        ))}
        <span className="ml-2 text-sm font-medium">{score.toFixed(3)}</span>
      </div>
    );
  };

  const getCleanlinessStatus = (score: number) => {
    if (score >= 4.5) {
      return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    } else if (score >= 4.0) {
      return <Badge className="bg-blue-100 text-blue-800">Good</Badge>;
    } else if (score >= 3.5) {
      return <Badge className="bg-yellow-100 text-yellow-800">Fair</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
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
            <Sparkles className="h-4 w-4" />
            {filteredReports.length} properties
          </div>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Hotel Site</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-center">Cleanliness Score</TableHead>
              <TableHead className="text-center">Rating</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Issues Reported</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No properties match your search" : "No cleanliness data available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => {
                const cleanlinessScore = report.cleanliness_score || 0;
                const issuesCount = 0; // Will be derived from cleanliness notes or separate field
                
                return (
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
                    <TableCell className="text-center">
                      <div className="font-semibold text-lg">
                        {cleanlinessScore.toFixed(3)}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getCleanlinessRating(cleanlinessScore)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getCleanlinessStatus(cleanlinessScore)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {issuesCount > 0 ? (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {issuesCount} issues
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            No issues
                          </Badge>
                        )}
                      </div>
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
              {selectedReport ? "Edit Cleanliness Data" : "Add Cleanliness Data"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="property_id">Hotel Site</Label>
                {staffLocationsLoading ? (
                  <div className="flex items-center space-x-2 mt-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading hotel sites...</span>
                  </div>
                ) : (
                  <div className="mt-2">
                    <SearchableSelect
                      options={staffLocations.map((location) => ({
                        value: location.id,
                        label: location.locationDescription,
                      }))}
                      value={formData.property_id}
                      placeholder="Search and select hotel site..."
                      emptyMessage="No hotel sites found."
                      onValueChange={(value) => {
                        const selectedLocation = staffLocations.find((loc) => loc.id === value);
                        setFormData({
                          ...formData,
                          property_id: value,
                          hotel_site: selectedLocation?.locationDescription || "",
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="cleanliness_score">Cleanliness Score (1-10)</Label>
                <Input 
                  id="cleanliness_score" 
                  type="number" 
                  min="1" 
                  max="10" 
                  placeholder="8.5"
                  value={formData.cleanliness_score}
                  onChange={(e) => setFormData({ ...formData, cleanliness_score: e.target.value })}
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
              <Label htmlFor="cleanliness_comments">Cleanliness Comments</Label>
              <Textarea 
                id="cleanliness_comments" 
                placeholder="Add notes about cleanliness issues, maintenance needs, etc."
                value={formData.cleanliness_comments}
                onChange={(e) => setFormData({ ...formData, cleanliness_comments: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button onClick={() => {
                onSave(formData);
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

export default CleanlinessTable;
