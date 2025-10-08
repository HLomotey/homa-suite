import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { PriorityIndicator } from "@/components/maintenance/PriorityIndicator";
import { PriorityColorIndicator } from "@/components/maintenance/PriorityColorIndicator";
import "@/components/maintenance/priority-color-indicator.css";
import { useMaintenanceRequest, useUpdateMaintenanceRequest } from "@/hooks/maintenance";
import { useMaintenanceComments, useCreateMaintenanceComment } from "@/hooks/maintenance/useMaintenanceComments";
import { useMaintenanceHistory } from "@/hooks/maintenance/useMaintenanceHistory";
import { useMaintenanceAttachments } from "@/hooks/maintenance/useMaintenanceAttachments";
import { useAuth } from "@/components/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MaintenanceStatus } from "@/integration/supabase/types/maintenance";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { 
  Loader2, 
  AlertTriangle, 
  Calendar, 
  MapPin, 
  Tag, 
  Clock, 
  User, 
  MessageSquare, 
  History, 
  Paperclip, 
  ArrowLeft,
  CheckCircle2
} from "lucide-react";

export default function MaintenanceRequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  
  const { data: request, isLoading: loadingRequest } = useMaintenanceRequest(id!);
  const { data: comments, isLoading: loadingComments } = useMaintenanceComments(id!);
  const { data: history, isLoading: loadingHistory } = useMaintenanceHistory(id!);
  const { data: attachments, isLoading: loadingAttachments } = useMaintenanceAttachments(id!);
  
  const { mutate: createComment } = useCreateMaintenanceComment();
  const { mutate: updateRequest } = useUpdateMaintenanceRequest();
  
  if (!id) {
    return <div>Invalid request ID</div>;
  }
  
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
  
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleSubmitComment = () => {
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    
    createComment({
      requestId: id,
      comment: newComment.trim(),
      isPrivate: isPrivate
    }, {
      onSuccess: () => {
        setNewComment("");
        setIsPrivate(false);
        setSubmittingComment(false);
        toast({
          title: "Comment added",
          description: "Your comment has been added successfully.",
        });
      },
      onError: (error) => {
        setSubmittingComment(false);
        toast({
          title: "Error",
          description: `Failed to add comment: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };
  
  const handleMarkAsResolved = () => {
    if (!request) return;
    
    updateRequest({
      id,
      request: {
        status: 'completed',
        completedDate: new Date().toISOString()
      },
      previousStatus: request.status
    }, {
      onSuccess: () => {
        toast({
          title: "Request resolved",
          description: "The maintenance request has been marked as resolved.",
        });
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
  
  const canMarkAsResolved = request && 
    request.status !== 'completed' && 
    request.status !== 'cancelled' && 
    (user?.id === request.tenantId);
  
  if (loadingRequest) {
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
        <Button className="mt-4" onClick={() => navigate("/maintenance/requests")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Requests
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate("/maintenance/requests")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Requests
        </Button>
        
        {canMarkAsResolved && (
          <Button onClick={handleMarkAsResolved}>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Mark as Resolved
          </Button>
        )}
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{request.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Reported on {formatDate(request.reportedDate)}
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(request.status)}
                  {request.isEmergency && (
                    <Badge variant="destructive" className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Emergency
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p>{request.description}</p>
              </div>
              
              {request.images && request.images.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Images</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {request.images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden">
                        <img 
                          src={image} 
                          alt={`Maintenance issue ${index + 1}`} 
                          className="h-full w-full object-cover"
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
              <CardTitle>Comments & Updates</CardTitle>
              <CardDescription>
                Communication history for this maintenance request
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="comments">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="comments" className="flex items-center">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Comments
                  </TabsTrigger>
                  <TabsTrigger value="history" className="flex items-center">
                    <History className="mr-2 h-4 w-4" />
                    History
                  </TabsTrigger>
                  <TabsTrigger value="attachments" className="flex items-center">
                    <Paperclip className="mr-2 h-4 w-4" />
                    Attachments
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="comments" className="space-y-4 pt-4">
                  {loadingComments ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : comments && comments.length > 0 ? (
                    <div className="space-y-4">
                      {comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4">
                          <Avatar>
                            <AvatarImage src={comment.userAvatar} />
                            <AvatarFallback>
                              {comment.userName?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">{comment.userName || 'User'}</div>
                              <div className="text-xs text-muted-foreground">
                                {formatDate(comment.createdAt)}
                              </div>
                            </div>
                            <div className="text-sm">
                              {comment.comment}
                            </div>
                            {comment.isPrivate && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                Private Comment
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No comments yet
                    </div>
                  )}
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-4">
                    <h3 className="font-medium">Add a Comment</h3>
                    <Textarea
                      placeholder="Type your comment here..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="private-comment"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="private-comment" className="text-sm">
                          Mark as private (only visible to staff)
                        </label>
                      </div>
                      <Button 
                        onClick={handleSubmitComment}
                        disabled={!newComment.trim() || submittingComment}
                      >
                        {submittingComment ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          "Add Comment"
                        )}
                      </Button>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="history" className="pt-4">
                  {loadingHistory ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : history && history.length > 0 ? (
                    <div className="relative pl-6 border-l border-border space-y-6">
                      {history.map((item) => (
                        <div key={item.id} className="relative">
                          <div className="absolute -left-[25px] h-4 w-4 rounded-full bg-primary" />
                          <div className="mb-1 text-sm font-medium">
                            {formatDate(item.createdAt)}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{item.userName || 'User'}</span>{' '}
                            {item.action === 'status_change' && (
                              <>
                                changed status from{' '}
                                <Badge variant="outline">
                                  {item.details?.from || 'None'}
                                </Badge>{' '}
                                to{' '}
                                <Badge variant="outline">
                                  {item.details?.to}
                                </Badge>
                              </>
                            )}
                            {item.action === 'comment_added' && 'added a comment'}
                            {item.action === 'assigned' && (
                              <>
                                assigned this request to{' '}
                                <span className="font-medium">
                                  {item.details?.assignedTo || 'someone'}
                                </span>
                              </>
                            )}
                            {item.action === 'scheduled' && (
                              <>
                                scheduled this request for{' '}
                                <span className="font-medium">
                                  {formatDate(item.details?.scheduledDate)}
                                </span>
                              </>
                            )}
                            {item.action === 'completed' && 'marked this request as completed'}
                            {item.action === 'attachment_added' && (
                              <>
                                added attachment:{' '}
                                <span className="font-medium">
                                  {item.details?.file_name}
                                </span>
                              </>
                            )}
                          </div>
                          {item.details?.note && (
                            <div className="mt-1 text-sm text-muted-foreground">
                              {item.details.note}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No history available
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="attachments" className="pt-4">
                  {loadingAttachments ? (
                    <div className="flex items-center justify-center p-6">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : attachments && attachments.length > 0 ? (
                    <div className="space-y-4">
                      {attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between border rounded-md p-3">
                          <div className="flex items-center space-x-3">
                            <div className="bg-muted rounded-md p-2">
                              <Paperclip className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-medium">{attachment.fileName}</div>
                              <div className="text-xs text-muted-foreground">
                                {(attachment.fileSize / 1024).toFixed(2)} KB • Uploaded by {attachment.uploadedByName || 'User'}
                              </div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm" asChild>
                            <a href={attachment.fileUrl} target="_blank" rel="noopener noreferrer">
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      No attachments available
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <Tag className="mr-2 h-4 w-4" />
                    Category
                  </dt>
                  <dd className="mt-1">{request.categoryName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Priority
                  </dt>
                  <dd className="mt-1 flex items-center">
                    {request.priorityName || 'N/A'}
                    {request.priorityColor && (
                      <PriorityColorIndicator 
                        className="ml-2" 
                        color={request.priorityColor}
                      />
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <MapPin className="mr-2 h-4 w-4" />
                    Location
                  </dt>
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
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Reported By
                  </dt>
                  <dd className="mt-1">{request.tenantName || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <Calendar className="mr-2 h-4 w-4" />
                    Reported Date
                  </dt>
                  <dd className="mt-1">{formatDate(request.reportedDate)}</dd>
                </div>
                {request.assignedTo && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Assigned To
                    </dt>
                    <dd className="mt-1">{request.assignedToName || request.assignedTo}</dd>
                  </div>
                )}
                {request.scheduledDate && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      Scheduled Date
                    </dt>
                    <dd className="mt-1">{formatDate(request.scheduledDate)}</dd>
                  </div>
                )}
                {request.completedDate && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Completed Date
                    </dt>
                    <dd className="mt-1">{formatDate(request.completedDate)}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-sm font-medium text-muted-foreground flex items-center">
                    <Clock className="mr-2 h-4 w-4" />
                    Permission to Enter
                  </dt>
                  <dd className="mt-1">
                    {request.permissionToEnter ? 'Yes' : 'No'}
                  </dd>
                </div>
                {request.tenantAvailableTimes && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      Available Times
                    </dt>
                    <dd className="mt-1">{request.tenantAvailableTimes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="mr-4 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-medium">Reported</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(request.reportedDate)}
                    </div>
                  </div>
                </div>
                
                {request.assignedDate && (
                  <div className="flex items-center">
                    <div className="mr-4 h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-purple-700" />
                    </div>
                    <div>
                      <div className="font-medium">Assigned</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(request.assignedDate)}
                      </div>
                    </div>
                  </div>
                )}
                
                {request.scheduledDate && (
                  <div className="flex items-center">
                    <div className="mr-4 h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-yellow-700" />
                    </div>
                    <div>
                      <div className="font-medium">Scheduled</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(request.scheduledDate)}
                      </div>
                    </div>
                  </div>
                )}
                
                {request.completedDate && (
                  <div className="flex items-center">
                    <div className="mr-4 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-green-700" />
                    </div>
                    <div>
                      <div className="font-medium">Completed</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(request.completedDate)}
                      </div>
                    </div>
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
