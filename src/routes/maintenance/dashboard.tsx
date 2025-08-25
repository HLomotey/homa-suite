import { useMaintenanceRequests } from "@/hooks/maintenance";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceStatus } from "@/integration/supabase/types/maintenance";
import { useAuth } from "@/components/auth";
import { Loader2, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";

export default function MaintenanceDashboard() {
  const { user } = useAuth();
  const { data: requests, isLoading } = useMaintenanceRequests({
    assignedTo: user?.id,
  });

  const emergencyRequests = requests?.filter(req => req.isEmergency) || [];
  const newRequests = requests?.filter(req => req.status === 'new') || [];
  const inProgressRequests = requests?.filter(req => req.status === 'in_progress') || [];
  const completedRequests = requests?.filter(req => req.status === 'completed') || [];

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

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : requests?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Maintenance requests
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Emergency Requests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : emergencyRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">
              High priority issues
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : inProgressRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Being addressed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : completedRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Resolved issues
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Requests</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
        </TabsList>
        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Maintenance Requests</CardTitle>
              <CardDescription>
                View and manage recent maintenance requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="space-y-1">
                        <Link 
                          to={`/maintenance/requests/${request.id}`}
                          className="font-medium hover:underline"
                        >
                          {request.title}
                        </Link>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.status)}
                          {request.isEmergency && (
                            <Badge variant="destructive">Emergency</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.propertyName} {request.roomName && `- ${request.roomName}`}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(request.reportedDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No maintenance requests found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Requests</CardTitle>
              <CardDescription>
                High priority maintenance issues requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : emergencyRequests.length > 0 ? (
                <div className="space-y-4">
                  {emergencyRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="space-y-1">
                        <Link 
                          to={`/maintenance/requests/${request.id}`}
                          className="font-medium hover:underline"
                        >
                          {request.title}
                        </Link>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.status)}
                          <Badge variant="destructive">Emergency</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.propertyName} {request.roomName && `- ${request.roomName}`}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(request.reportedDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No emergency requests found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="assigned" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assigned to Me</CardTitle>
              <CardDescription>
                Maintenance requests assigned to you for resolution
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center p-6">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : requests && requests.length > 0 ? (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between border-b pb-4"
                    >
                      <div className="space-y-1">
                        <Link 
                          to={`/maintenance/requests/${request.id}`}
                          className="font-medium hover:underline"
                        >
                          {request.title}
                        </Link>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(request.status)}
                          {request.isEmergency && (
                            <Badge variant="destructive">Emergency</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {request.propertyName} {request.roomName && `- ${request.roomName}`}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(request.reportedDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No requests assigned to you
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
