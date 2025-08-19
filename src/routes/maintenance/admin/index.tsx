import { useState } from "react";
import { useMaintenanceRequests } from "@/hooks/maintenance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PriorityColorIndicator } from "@/components/maintenance/PriorityColorIndicator";
import "@/components/maintenance/priority-color-indicator.css";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceStatus, FrontendMaintenanceRequest } from "@/integration/supabase/types/maintenance";
import { Link } from "react-router-dom";
import { 
  Loader2, 
  Search, 
  AlertTriangle, 
  Filter, 
  SlidersHorizontal, 
  Calendar, 
  User,
  ArrowUpDown
} from "lucide-react";

export default function MaintenanceAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("active");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("reportedDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Get all maintenance requests (no tenant filter for admin view)
  const { data: requests, isLoading } = useMaintenanceRequests();
  
  // Filter requests based on search query, status filter, and priority filter
  const filteredRequests = requests?.filter(request => {
    const matchesSearch = 
      searchQuery === "" || 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.propertyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.roomName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.categoryName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.tenantName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      request.status === statusFilter ||
      (statusFilter === "active" && ["new", "assigned", "in_progress"].includes(request.status));
    
    const matchesPriority =
      priorityFilter === "all" ||
      request.priorityId === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  // Sort the filtered requests
  const sortedRequests = filteredRequests?.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case "reportedDate":
        comparison = new Date(a.reportedDate).getTime() - new Date(b.reportedDate).getTime();
        break;
      case "title":
        comparison = a.title.localeCompare(b.title);
        break;
      case "property":
        comparison = (a.propertyName || "").localeCompare(b.propertyName || "");
        break;
      case "tenant":
        comparison = (a.tenantName || "").localeCompare(b.tenantName || "");
        break;
      case "priority":
        // Assuming lower priority ID means higher priority
        comparison = (a.priorityId || "").localeCompare(b.priorityId || "");
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === "asc" ? comparison : -comparison;
  });
  
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
  
  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };
  
  const getSortIcon = (column: string) => {
    if (sortBy === column) {
      return (
        <ArrowUpDown 
          className={`ml-1 h-4 w-4 ${sortOrder === "asc" ? "transform rotate-180" : ""}`} 
        />
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Admin Dashboard</CardTitle>
          <CardDescription>
            Manage and track all maintenance requests across properties
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search requests, tenants, properties..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center">
                      <Filter className="mr-2 h-4 w-4" />
                      <span>Status</span>
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
                
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <div className="flex items-center">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      <span>Priority</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {/* This would be populated from the priorities data */}
                    <SelectItem value="priority1">High</SelectItem>
                    <SelectItem value="priority2">Medium</SelectItem>
                    <SelectItem value="priority3">Low</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" asChild>
                  <Link to="/maintenance/admin/settings">
                    Settings
                  </Link>
                </Button>
              </div>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : sortedRequests && sortedRequests.length > 0 ? (
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th 
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer"
                          onClick={() => handleSort("title")}
                        >
                          <div className="flex items-center">
                            Title {getSortIcon("title")}
                          </div>
                        </th>
                        <th 
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hidden md:table-cell"
                          onClick={() => handleSort("property")}
                        >
                          <div className="flex items-center">
                            Location {getSortIcon("property")}
                          </div>
                        </th>
                        <th 
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer hidden md:table-cell"
                          onClick={() => handleSort("tenant")}
                        >
                          <div className="flex items-center">
                            Tenant {getSortIcon("tenant")}
                          </div>
                        </th>
                        <th 
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer"
                          onClick={() => handleSort("priority")}
                        >
                          <div className="flex items-center">
                            Priority {getSortIcon("priority")}
                          </div>
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                          Status
                        </th>
                        <th 
                          className="h-12 px-4 text-left align-middle font-medium text-muted-foreground cursor-pointer"
                          onClick={() => handleSort("reportedDate")}
                        >
                          <div className="flex items-center">
                            Reported {getSortIcon("reportedDate")}
                          </div>
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedRequests.map((request) => (
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
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center mr-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <span>{request.tenantName || 'Unknown'}</span>
                            </div>
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
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {formatDate(request.reportedDate)}
                            </div>
                          </td>
                          <td className="p-4 align-middle text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/maintenance/admin/requests/${request.id}`}>
                                  View
                                </Link>
                              </Button>
                              <Button variant="outline" size="sm" asChild>
                                <Link to={`/maintenance/admin/requests/${request.id}/edit`}>
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
                    {searchQuery || statusFilter !== "all" || priorityFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "There are no maintenance requests in the system yet."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">New Requests</CardTitle>
            <CardDescription>
              Requests awaiting assignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {requests?.filter(r => r.status === 'new').length || 0}
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
              {requests?.filter(r => r.status === 'in_progress').length || 0}
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
              {requests?.filter(r => r.isEmergency && ['new', 'assigned', 'in_progress'].includes(r.status)).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
