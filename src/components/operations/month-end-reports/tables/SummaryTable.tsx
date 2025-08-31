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
  SearchableSelect,
  SearchableSelectOption,
} from "@/components/ui/searchable-select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FrontendMonthEndReport } from "@/integration/supabase/types/month-end-reports";
import { SummaryTab } from "../components/summary/SummaryTab";
import { 
  Search, 
  Edit, 
  CheckCircle, 
  Building, 
  Calendar, 
  FileText,
  TrendingUp,
  Plus,
  MessageSquare,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { useProperties } from "@/hooks/property/useProperties";

interface SummaryTableProps {
  reports: FrontendMonthEndReport[];
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const SummaryTable: React.FC<SummaryTableProps> = ({
  reports,
  onSave,
  isLoading = false,
}) => {
  const { properties, isLoading: propertiesLoading } = useProperties();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReport, setSelectedReport] = useState<FrontendMonthEndReport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    property_id: "",
    property_name: "",
    headline: "",
    start_date: "",
    end_date: "",
    narrative: "",
  });

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.headline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditReport = (report: FrontendMonthEndReport) => {
    setSelectedReport(report);
    setFormData({
      property_id: report.property_id || "",
      property_name: report.property_name || "",
      headline: report.headline || "",
      start_date: report.start_date || "",
      end_date: report.end_date || "",
      narrative: report.narrative || "",
    });
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedReport(null);
  };

  const getCompletionStatus = (headline: string, narrative: string) => {
    const headlineComplete = headline && headline.trim().length > 0;
    const narrativeComplete = narrative && narrative.trim().length > 0;
    
    if (headlineComplete && narrativeComplete) {
      return <Badge className="bg-green-100 text-green-800">Complete</Badge>;
    } else if (headlineComplete || narrativeComplete) {
      return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800">Incomplete</Badge>;
    }
  };

  const truncateText = (text: string, maxLength: number = 100) => {
    if (!text) return "No content";
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
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
            <CheckCircle className="h-4 w-4" />
            {filteredReports.length} properties
          </div>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Summary Data
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Property</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="w-[300px]">Headline</TableHead>
              <TableHead className="w-[350px]">Narrative Preview</TableHead>
              <TableHead className="text-center">Completion</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No summaries match your search" : "No summary data available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => {
                const headline = report.headline || "";
                const narrative = report.narrative || "";
                
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
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <FileText className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="font-medium text-sm leading-tight">
                            {headline || "No headline"}
                          </p>
                          {headline && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {headline.length} characters
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-muted-foreground leading-tight">
                            {truncateText(narrative)}
                          </p>
                          {narrative && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {narrative.length} characters
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getCompletionStatus(headline, narrative)}
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
              {selectedReport ? "Edit Summary Data" : "Add Summary Data"}
            </SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            <div className="space-y-4">
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
                      options={properties.map((property): SearchableSelectOption => ({
                        value: property.id,
                        label: `${property.name}${property.address ? ` - ${property.address}` : ""}`,
                        searchText: `${property.name} ${property.address || ""} ${property.city || ""} ${property.state || ""}`,
                      }))}
                      value={formData.property_id}
                      placeholder="Search and select property..."
                      emptyMessage="No properties found."
                      onValueChange={(value) => {
                        const selectedProperty = properties.find((p) => p.id === value);
                        setFormData({
                          ...formData,
                          property_id: value,
                          property_name: selectedProperty?.name || "",
                        });
                      }}
                    />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="headline">Executive Headline</Label>
                <Input 
                  id="headline" 
                  placeholder="Q4 Performance Summary"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="narrative">Executive Summary</Label>
              <Textarea 
                id="narrative" 
                placeholder="Provide a comprehensive summary of the month's performance..."
                value={formData.narrative}
                onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                rows={6}
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

export default SummaryTable;
