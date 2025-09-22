import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMaintenanceRequest, useUpdateMaintenanceRequest } from "@/hooks/maintenance";
import { useAuth } from "@/components/auth";
import { useStaffRooms } from "@/hooks/staff";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaintenanceStatus } from "@/integration/supabase/types/maintenance";
import { Loader2, AlertTriangle, ArrowLeft, Calendar, MapPin, User, MessageSquare } from "lucide-react";
import { PriorityColorIndicator } from "@/components/maintenance/PriorityColorIndicator";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";

export default function StaffRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [status, setStatus] = useState<MaintenanceStatus | "">("");
  const [notes, setNotes] = useState("");
  
  // Get rooms assigned to the current staff member
  const { rooms, loading: roomsLoading } = useStaffRooms(currentUser?.user?.id || "");
  const staffRoomIds = rooms.map(room => room.roomId);
  
  // Fetch the maintenance request
  const { data: request, isLoading, error } = useMaintenanceRequest(id || "");
  
  // Update request mutation
  const { mutate: updateRequest, isPending: isUpdating } = useUpdateMaintenanceRequest();
  
  // Check if this request belongs to a room assigned to this staff member
  const isAssignedToStaff = request && staffRoomIds.includes(request.roomId || "");
  
  // Handle status update
  const handleUpdateStatus = () => {
    if (!request || !status) return;
    
    updateRequest({
      id: request.id,
      request: {
        status,
        staffNotes: notes ? `${notes}\n\n${request.staffNotes || ""}` : request.staffNotes
      },
      previousStatus: request.status
    }, {
      onSuccess: () => {
        toast({
          title: "Request updated",
          description: "The maintenance request has been successfully updated.",
        });
        setNotes("");
      },
      onError: (error) => {
        toast({
          title: "Update failed",
          description: error.message || "Failed to update the maintenance request.",
          variant: "destructive",
        });
      }
    });
  };
  
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading || roomsLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">Error Loading Request</h2>
        <p className="text-muted-foreground">
          {error?.message || "The requested maintenance request could not be found."}
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/maintenance/staff")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Requests
        </Button>
      </div>
    );
  }
  
  // If the request is not for a room assigned to this staff member, show access denied
  if (!isAssignedToStaff) {
    return (
      <div className="text-center py-12">
        <div className="rounded-full bg-red-100 p-3 w-12 h-12 mx-auto mb-4 flex items-center justify-center">
          <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
        <p className="text-muted-foreground">
          You do not have permission to view this maintenance request as it is not assigned to your rooms.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate("/maintenance/staff")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button 
          variant="outline" 
          onClick={() => navigate("/maintenance/staff")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Requests
        </Button>
        
        <div className="flex items-center gap-2">
          {request.isEmergency && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Emergency
            </Badge>
          )}
          {getStatusBadge(request.status)}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{request.title}</CardTitle>
              <CardDescription>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="mr-1 h-4 w-4" />
                  Reported on {formatDate(request.reportedDate)}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-line">{request.description}</p>
              </div>
              
              {request.images && request.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium mb-2">Images</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {request.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden bg-muted">
                        <img 
                          src={image} 
                          alt={`Issue image ${index + 1}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Staff Notes</CardTitle>
              <CardDescription>
                Add notes and updates about this maintenance request
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Add notes about this maintenance request..."
                className="min-h-[100px]"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              
              {request.staffNotes && (
                <div className="border rounded-md p-4 bg-muted/50">
                  <h4 className="text-sm font-medium mb-2">Previous Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {request.staffNotes}
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex items-center gap-2">
                <Select value={status} onValueChange={(value) => setStatus(value as MaintenanceStatus | "")}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Update status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={handleUpdateStatus}
                disabled={!status && !notes || isUpdating}
              >
                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Update Request
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center text-sm">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{request.propertyName}</p>
                    <p className="text-muted-foreground">{request.roomName}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center text-sm">
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Reported by</p>
                    <p className="text-muted-foreground">{request.tenantName || "Unknown"}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium mb-1">Priority</p>
                <div className="flex items-center">
                  {request.priorityName}
                  {request.priorityColor && (
                    <PriorityColorIndicator 
                      className="ml-2" 
                      color={request.priorityColor}
                    />
                  )}
                </div>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium mb-1">Category</p>
                <p className="text-sm text-muted-foreground">{request.categoryName}</p>
              </div>
              
              {request.comments && request.comments.length > 0 && (
                <>
                  <Separator />
                  
                  <div>
                    <div className="flex items-center text-sm mb-2">
                      <MessageSquare className="mr-2 h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">Comments ({request.comments.length})</p>
                    </div>
                    
                    <div className="space-y-3">
                      {request.comments.map((comment, index) => (
                        <div key={index} className="bg-muted/50 p-3 rounded-md">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-medium">{comment.userName || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(comment.createdAt)}
                            </p>
                          </div>
                          <p className="text-sm">{comment.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {request.timeline && request.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      {index < (request.timeline?.length || 0) - 1 && (
                        <div className="absolute top-3 bottom-0 left-[3px] w-[1px] bg-border" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="text-xs text-muted-foreground">
                        {formatDate(event.date)}
                      </p>
                      <p className="text-sm font-medium">{event.title}</p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {(!request.timeline || request.timeline.length === 0) && (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground">No timeline events available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
