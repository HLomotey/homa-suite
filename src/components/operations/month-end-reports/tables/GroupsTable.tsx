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
import { GroupsTab } from "../components/groups/GroupsTab";
import { 
  Search, 
  Edit, 
  Users, 
  Building, 
  Calendar, 
  MapPin,
  Bed,
  Plus,
  Ban
} from "lucide-react";

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
          <Button onClick={() => setIsFormOpen(true)}>
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
                <Label htmlFor="total-groups">Total Groups</Label>
                <Input 
                  id="total-groups" 
                  type="number" 
                  placeholder="5"
                  defaultValue={selectedReport?.groups?.length || ""}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rooms-blocked">Rooms Blocked</Label>
                <Input 
                  id="rooms-blocked" 
                  type="number"
                  placeholder="25"
                  defaultValue={selectedReport?.total_rooms_blocked || ""}
                />
              </div>
              <div>
                <Label htmlFor="group-revenue">Group Revenue</Label>
                <Input 
                  id="group-revenue" 
                  type="number"
                  step="0.01"
                  placeholder="15000.00"
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
              <Label htmlFor="group-notes">Group Booking Notes</Label>
              <Textarea 
                id="group-notes" 
                placeholder="Add notes about group bookings, special requirements, events, etc."
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

export default GroupsTable;
