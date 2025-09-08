import { useState } from "react";
import { useMaintenanceRequests } from "@/hooks/maintenance";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceStatus, FrontendMaintenanceRequest } from "@/integration/supabase/types/maintenance";
import { Link } from "react-router-dom";
import { Loader2, Plus, Search, AlertTriangle, Filter } from "lucide-react";
import { MaintenanceRequestSheet } from "@/components/maintenance/MaintenanceRequestSheet";

export default function MaintenanceRequests() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const { data: requests, isLoading } = useMaintenanceRequests({
    tenantId: currentUser?.user?.id, // Filter by current user as tenant
  });
  
  // Filter requests based on search query and status filter
  const filteredRequests = requests?.filter(request => {
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
    
    return matchesSearch && matchesStatus;
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
            <SelectTrigger className="w-full sm:w-[180px]">
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
          
          <Button onClick={() => setIsSheetOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>My Maintenance Requests</CardTitle>
          <CardDescription>
            View and track the status of your maintenance requests
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
                          {getStatusBadge(request.status)}
                        </td>
                        <td className="p-4 align-middle">
                          {formatDate(request.reportedDate)}
                        </td>
                        <td className="p-4 align-middle text-right">
                          <Button variant="outline" size="sm" asChild>
                            <Link to={`/maintenance/requests/${request.id}`}>
                              View Details
                            </Link>
                          </Button>
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
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filter criteria."
                    : "You haven't submitted any maintenance requests yet."}
                </p>
                <Button onClick={() => setIsSheetOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Report New Issue
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      <MaintenanceRequestSheet 
        open={isSheetOpen} 
        onOpenChange={setIsSheetOpen} 
      />
    </div>
  );
}
