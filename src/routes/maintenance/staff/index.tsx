import { useState, useMemo } from "react";
import { useMaintenanceRequests } from "@/hooks/maintenance";
import { useAuth } from "@/components/auth";
import { useStaffRooms } from "@/hooks/staff";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceStatus, FrontendMaintenanceRequest } from "@/integration/supabase/types/maintenance";
import { Link } from "react-router-dom";
import { Loader2, Search, AlertTriangle, Filter, Building } from "lucide-react";
import { PriorityColorIndicator } from "@/components/maintenance/PriorityColorIndicator";
import "@/components/maintenance/priority-color-indicator.css";

export default function StaffMaintenanceRequests() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [propertyFilter, setPropertyFilter] = useState<string>("all");
  
  // Get rooms assigned to the current staff member
  const { rooms, propertyIds, loading: roomsLoading } = useStaffRooms(user?.id || "");
  
  // Get all room IDs assigned to this staff member
  const staffRoomIds = useMemo(() => rooms.map(room => room.roomId), [rooms]);
  
  // Get unique properties with their names for the filter dropdown
  const properties = useMemo(() => {
    const uniqueProperties = new Map();
    rooms.forEach(room => {
      if (room.propertyId && !uniqueProperties.has(room.propertyId)) {
        uniqueProperties.set(room.propertyId, room.propertyName);
      }
    });
    return Array.from(uniqueProperties.entries()).map(([id, name]) => ({ id, name }));
  }, [rooms]);
  
  // Fetch maintenance requests
  const { data: allRequests, isLoading: requestsLoading } = useMaintenanceRequests();
  
  // Filter requests to only those for rooms assigned to this staff member
  const staffRequests = useMemo(() => {
    if (!allRequests) return [];
    
    return allRequests.filter(request => {
      // Include requests that match room IDs assigned to this staff
      return staffRoomIds.includes(request.roomId || "");
    });
  }, [allRequests, staffRoomIds]);
  
  // Apply user filters (search, status, property)
  const filteredRequests = useMemo(() => {
    if (!staffRequests) return [];
    
    return staffRequests.filter(request => {
      const matchesSearch = 
        searchQuery === "" || 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.roomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.categoryName?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = 
        statusFilter === "all" || 
        request.status === statusFilter ||
        (statusFilter === "active" && ["new", "assigned", "in_progress"].includes(request.status));
      
      const matchesProperty =
        propertyFilter === "all" ||
        request.propertyId === propertyFilter;
      
      return matchesSearch && matchesStatus && matchesProperty;
    });
  }, [staffRequests, searchQuery, statusFilter, propertyFilter]);
  
  const getStatusBadge = (status: MaintenanceStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge>;
      case 'assigned':
        return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Assigned</Badge>;
      case 'in_progress':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge>;
      case 'on_hold':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">On Hold</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isLoading = roomsLoading || requestsLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1 w-full sm:max-w-md">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search maintenance requests..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <div className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="on_hold">On Hold</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={propertyFilter} onValueChange={setPropertyFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <div className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Filter by property" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Properties</SelectItem>
              {properties.map(property => (
                <SelectItem key={property.id} value={property.id}>
                  {property.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Requests for My Rooms</CardTitle>
          <CardDescription>
            View and manage maintenance requests for rooms assigned to you
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredRequests && filteredRequests.length > 0 ? (
            <div className="rounded-md border">
              <div className="relative w-full overflow-auto">
                <table className="w-full caption-bottom text-sm">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Title
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                        Location
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground hidden md:table-cell">
                        Category
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Priority
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Reported
                      </th>
                      <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRequests.map((request) => (
                      <tr key={request.id} className="border-b transition-colors hover:bg-muted/50">
                        <td className="p-4 align-middle">
                          <div className="flex flex-col">
                            <span className="font-medium">{request.title}</span>
                            {request.isEmergency && (
                              <div className="mt-1">
                                <Badge variant="destructive" className="flex items-center gap-1">
                                  <AlertTriangle className="h-3 w-3" />
                                  Emergency
                                </Badge>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle hidden md:table-cell">
                          {request.propertyName}
                          {request.roomName && <span className="block text-xs text-muted-foreground">{request.roomName}</span>}
                        </td>
                        <td className="p-4 align-middle hidden md:table-cell">
                          {request.categoryName}
                        </td>
                        <td className="p-4 align-middle">
                          <div className="flex items-center">
                            {request.priorityName}
                            {request.priorityColor && (
                              <PriorityColorIndicator 
                                className="ml-2" 
                                color={request.priorityColor}
                              />
                            )}
                          </div>
                        </td>
                        <td className="p-4 align-middle">
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="p-4 align-middle">
                          {formatDate(request.reportedDate)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/maintenance/staff/requests/${request.id}`}>
                                View
                              </Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <Link to={`/maintenance/staff/requests/${request.id}/manage`}>
                                Manage
                              </Link>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border rounded-md">
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="rounded-full bg-muted p-3">
                  <div className="rounded-full bg-background p-2">
                    <Search className="h-6 w-6 text-muted-foreground" />
                  </div>
                </div>
                <h3 className="font-semibold text-lg">No maintenance requests found</h3>
                <p className="text-muted-foreground text-sm max-w-md">
                  {searchQuery || statusFilter !== "all" || propertyFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "There are no maintenance requests for your assigned rooms."}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">New Requests</CardTitle>
            <CardDescription>
              Awaiting attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredRequests?.filter(r => r.status === 'new').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">In Progress</CardTitle>
            <CardDescription>
              Currently being addressed
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredRequests?.filter(r => r.status === 'in_progress').length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Emergency Requests</CardTitle>
            <CardDescription>
              High priority issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">
              {filteredRequests?.filter(r => r.isEmergency && ['new', 'assigned', 'in_progress'].includes(r.status)).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
