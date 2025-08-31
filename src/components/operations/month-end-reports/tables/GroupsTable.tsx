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
import { SearchableSelect, SearchableSelectOption } from "@/components/ui/searchable-select";
import { Plus, Edit, Trash2, Users, DollarSign, Calendar, Building, Ban, AlertTriangle, MessageSquare, Loader2, Search } from "lucide-react";
import { useProperties } from "@/hooks/property/useProperties";
import { FrontendMonthEndReport } from "@/integration/supabase/types/month-end-reports";
import { GroupsTab } from "../components/groups/GroupsTab";

interface GroupsTableProps {
  reports: FrontendMonthEndReport[];
  onSave: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const GroupsTable: React.FC<GroupsTableProps> = ({
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
    total_rooms_blocked: "",
    start_date: "",
    end_date: "",
    narrative: "",
  });

  // Filter reports based on search term
  const filteredReports = reports.filter(report => 
    report.property_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditReport = (report: FrontendMonthEndReport) => {
    setSelectedReport(report);
    setFormData({
      property_id: report.property_id || "",
      property_name: report.property_name || "",
      total_rooms_blocked: report.total_rooms_blocked?.toString() || "",
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

  const getGroupStatus = (groupCount: number, blockedRooms: number) => {
    if (groupCount === 0) {
      return <Badge variant="outline" className="text-gray-600">No Groups</Badge>;
    } else if (groupCount >= 5) {
      return <Badge className="bg-green-100 text-green-800">High Activity</Badge>;
    } else if (groupCount >= 2) {
      return <Badge className="bg-blue-100 text-blue-800">Moderate Activity</Badge>;
    } else {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Activity</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleAddNew = () => {
    setSelectedReport(null);
    setFormData({
      property_id: "",
      property_name: "",
      total_rooms_blocked: "",
      start_date: "",
      end_date: "",
      narrative: "",
    });
    setIsFormOpen(true);
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
            <Users className="h-4 w-4" />
            {filteredReports.length} properties
          </div>
          <Button onClick={handleAddNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add Group Data
          </Button>
        </div>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Property</TableHead>
              <TableHead>Period</TableHead>
              <TableHead className="text-center">Total Groups</TableHead>
              <TableHead className="text-center">Blocked Rooms</TableHead>
              <TableHead className="text-center">Group Revenue</TableHead>
              <TableHead className="text-center">Activity Level</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "No properties match your search" : "No group data available"}
                </TableCell>
              </TableRow>
            ) : (
              filteredReports.map((report) => {
                // Parse groups data if it exists (using groups field from report)
                const groupsData = report.groups || [];
                const totalGroups = groupsData.length || 0;
                const blockedRooms = groupsData.reduce((sum: number, group: any) => sum + (group.rooms_blocked || 0), 0);
                const groupRevenue = groupsData.reduce((sum: number, group: any) => sum + (group.revenue || 0), 0);
                
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
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{totalGroups}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Ban className="h-4 w-4 text-muted-foreground" />
                        <span className="font-semibold">{blockedRooms}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="font-semibold">
                        ${groupRevenue.toLocaleString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {getGroupStatus(totalGroups, blockedRooms)}
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
              {selectedReport ? "Edit Group Data" : "Add Group Data"}
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
                      options={properties.map(property => ({
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
                <Label htmlFor="total_rooms_blocked">Total Rooms Blocked</Label>
                <Input 
                  id="total_rooms_blocked" 
                  type="number" 
                  placeholder="150"
                  value={formData.total_rooms_blocked}
                  onChange={(e) => setFormData({ ...formData, total_rooms_blocked: e.target.value })}
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
              <Label htmlFor="narrative">Group Notes</Label>
              <Textarea 
                id="narrative" 
                placeholder="Add notes about group bookings, special requirements, etc."
                value={formData.narrative}
                onChange={(e) => setFormData({ ...formData, narrative: e.target.value })}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCloseForm}>
                Cancel
              </Button>
              <Button onClick={() => {
                onSave(formData);
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

export default GroupsTable;
