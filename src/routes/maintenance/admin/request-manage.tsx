import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  useMaintenanceRequest, 
  useUpdateMaintenanceRequest,
  useMaintenanceCategories,
  useMaintenancePriorities
} from "@/hooks/maintenance";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { MaintenanceStatus } from "@/integration/supabase/types/maintenance";
import { 
  Loader2, 
  Calendar as CalendarIcon, 
  ArrowLeft, 
  Save,
  AlertTriangle
} from "lucide-react";

export default function ManageMaintenanceRequest() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: request, isLoading: loadingRequest } = useMaintenanceRequest(id!);
  const { data: categories, isLoading: loadingCategories } = useMaintenanceCategories();
  const { data: priorities, isLoading: loadingPriorities } = useMaintenancePriorities();
  const { mutate: updateRequest, isPending: isUpdating } = useUpdateMaintenanceRequest();
  
  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [status, setStatus] = useState<MaintenanceStatus>("new");
  const [isEmergency, setIsEmergency] = useState(false);
  const [assignedTo, setAssignedTo] = useState<string | null>(null);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [note, setNote] = useState("");
  
  // Mock staff data - in a real app, this would come from an API
  const staffMembers = [
    { id: "staff1", name: "John Smith" },
    { id: "staff2", name: "Jane Doe" },
    { id: "staff3", name: "Robert Johnson" },
  ];
  
  // Initialize form with request data
  useEffect(() => {
    if (request) {
      setTitle(request.title);
      setDescription(request.description);
      setCategoryId(request.categoryId);
      setPriorityId(request.priorityId);
      setStatus(request.status);
      setIsEmergency(request.isEmergency);
      setAssignedTo(request.assignedTo);
      setScheduledDate(request.scheduledDate ? new Date(request.scheduledDate) : null);
    }
  }, [request]);
  
  const handleSave = () => {
    if (!request) return;
    
    const updatedRequest = {
      title,
      description,
      categoryId,
      priorityId,
      status,
      isEmergency,
      assignedTo,
      scheduledDate: scheduledDate ? scheduledDate.toISOString() : null,
    };
    
    updateRequest({
      id: id!,
      request: updatedRequest,
      previousStatus: request.status,
      note: note.trim() || undefined
    }, {
      onSuccess: () => {
        toast({
          title: "Request updated",
          description: "The maintenance request has been updated successfully.",
        });
        navigate(`/maintenance/admin/requests/${id}`);
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: `Failed to update request: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  if (loadingRequest || loadingCategories || loadingPriorities) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  if (!request) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Maintenance request not found</h2>
        <p className="text-muted-foreground mt-2">
          The requested maintenance issue could not be found
        </p>
        <Button className="mt-4" onClick={() => navigate("/maintenance/admin")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Admin Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate(`/maintenance/admin/requests/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Request Details
        </Button>
        
        <Button onClick={handleSave} disabled={isUpdating}>
          {isUpdating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Edit Maintenance Request</CardTitle>
              <CardDescription>
                Update details for maintenance request #{id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Title
                  </label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Request title"
                  />
                </div>
                
                <div>
                  <label htmlFor="description" className="block text-sm font-medium mb-1">
                    Description
                  </label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed description"
                    rows={5}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <Select value={categoryId} onValueChange={setCategoryId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <Select value={priorityId} onValueChange={setPriorityId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities?.map((priority) => (
                          <SelectItem key={priority.id} value={priority.id}>
                            {priority.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    id="emergency"
                    checked={isEmergency}
                    onCheckedChange={setIsEmergency}
                  />
                  <label htmlFor="emergency" className="text-sm font-medium flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                    Mark as Emergency
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Assignment & Scheduling</CardTitle>
              <CardDescription>
                Assign staff and schedule maintenance work
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <Select value={status} onValueChange={(value) => setStatus(value as MaintenanceStatus)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
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
                
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium mb-1">
                    Assign To
                  </label>
                  <Select 
                    value={assignedTo || ""} 
                    onValueChange={(value) => setAssignedTo(value || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {staffMembers.map((staff) => (
                        <SelectItem key={staff.id} value={staff.id}>
                          {staff.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-medium mb-1">
                    Schedule Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !scheduledDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {scheduledDate ? format(scheduledDate, "PPP") : "Select date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate || undefined}
                        onSelect={setScheduledDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {scheduledDate && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="mt-2" 
                      onClick={() => setScheduledDate(null)}
                    >
                      Clear date
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Add Note</CardTitle>
              <CardDescription>
                Add a note about this update (will be added to history)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add a note about your changes..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Request ID</dt>
                  <dd className="mt-1 font-mono text-sm">{id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Reported By</dt>
                  <dd className="mt-1">{request.tenantName || 'Unknown'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Reported Date</dt>
                  <dd className="mt-1">{format(new Date(request.reportedDate), "PPP")}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                  <dd className="mt-1">
                    {request.propertyName || 'N/A'}
                    {request.roomName && (
                      <span className="block text-sm text-muted-foreground">
                        Room: {request.roomName}
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Permission to Enter</dt>
                  <dd className="mt-1">{request.permissionToEnter ? 'Yes' : 'No'}</dd>
                </div>
                {request.tenantAvailableTimes && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Available Times</dt>
                    <dd className="mt-1">{request.tenantAvailableTimes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Help</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
              <div>
                <h3 className="font-medium">Status Meanings</h3>
                <ul className="mt-2 space-y-2">
                  <li><Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">New</Badge> - Request received, not yet assigned</li>
                  <li><Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Assigned</Badge> - Staff assigned but work not started</li>
                  <li><Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">In Progress</Badge> - Work has started</li>
                  <li><Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">On Hold</Badge> - Temporarily paused</li>
                  <li><Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge> - Work finished</li>
                  <li><Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Cancelled</Badge> - Request cancelled</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium">Tips</h3>
                <ul className="mt-2 list-disc pl-5 space-y-1">
                  <li>Always add a note when changing status</li>
                  <li>Schedule date is required when status is "Assigned"</li>
                  <li>Check tenant availability before scheduling</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
