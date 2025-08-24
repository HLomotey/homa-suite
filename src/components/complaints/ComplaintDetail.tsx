/**
 * Complaint detail view component
 */

import React, { useState } from "react";
import { useComplaint, useComplaintComments, useComplaintAttachments, useComplaintHistory } from "@/hooks/complaints";
import { ComplaintStatus, ComplaintPriority } from "@/integration/supabase/types/complaints";
import { useAuth } from "@/components/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Clock, AlertTriangle, CheckCircle, MessageSquare, Paperclip, History, ArrowLeft, MoreVertical } from "lucide-react";
import { format, formatDistance } from "date-fns";
import { toast } from "@/components/ui/use-toast";

// Status badge colors
const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  in_progress: "bg-yellow-500",
  waiting_on_user: "bg-purple-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
  reopened: "bg-red-600",
};

// Priority badge colors
const priorityColors: Record<string, string> = {
  low: "bg-gray-400",
  medium: "bg-blue-400",
  high: "bg-orange-500",
  critical: "bg-red-600",
};

interface ComplaintDetailProps {
  id: string;
  onBack?: () => void;
}

export function ComplaintDetail({ id, onBack }: ComplaintDetailProps) {
  const { user } = useAuth();
  const { complaint, isLoading, updateComplaint } = useComplaint(id);
  const { comments, addComment, isLoading: isLoadingComments } = useComplaintComments(id, true);
  const { attachments, uploadAttachment, isLoading: isLoadingAttachments } = useComplaintAttachments(id, true);
  const { history, isLoading: isLoadingHistory } = useComplaintHistory(id);
  
  const [newComment, setNewComment] = useState("");
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isInternalFile, setIsInternalFile] = useState(false);
  
  // Check if user is assigned to this complaint or is an admin
  const isAssigned = user?.id === complaint?.assignedTo;
  // Assuming admin role check is done via a function or property
  const canManage = isAssigned || (user?.app_metadata?.role === 'admin');
  
  // Handle status change
  const handleStatusChange = (status: ComplaintStatus) => {
    if (!complaint) return;
    
    updateComplaint({ status });
  };
  
  // Handle priority change
  const handlePriorityChange = (priority: ComplaintPriority) => {
    if (!complaint) return;
    
    updateComplaint({ priority });
  };
  
  // Handle assignment change
  const handleAssignmentChange = (userId: string) => {
    if (!complaint) return;
    
    updateComplaint({ assigned_to: userId });
  };
  
  // Handle comment submission
  const handleCommentSubmit = () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Comment cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    addComment({
      content: newComment,
      isInternal: isInternalComment
    });
    
    setNewComment("");
  };
  
  // Handle file upload
  const handleFileUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    uploadAttachment({
      file: selectedFile,
      isInternal: isInternalFile
    });
    
    setSelectedFile(null);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading complaint details...</span>
      </div>
    );
  }
  
  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h3 className="text-lg font-semibold">Complaint Not Found</h3>
        <p className="text-muted-foreground">
          The requested complaint could not be found or you don't have permission to view it.
        </p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Complaints
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{complaint.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>ID: {complaint.id.substring(0, 8)}...</span>
              <span>•</span>
              <span>Created {format(new Date(complaint.createdAt), 'MMM d, yyyy')}</span>
              <span>•</span>
              <span>By {complaint.createdByName}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusColors[complaint.status]}>
            {complaint.status.replace(/_/g, ' ')}
          </Badge>
          <Badge className={priorityColors[complaint.priority]}>
            {complaint.priority}
          </Badge>
          {complaint.slaBreach && (
            <Badge variant="destructive" className="animate-pulse">
              SLA Breach
            </Badge>
          )}
        </div>
      </div>
      
      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Details */}
        <Card className="lg:col-span-2">
          <Tabs defaultValue="details">
            <CardHeader className="pb-0">
              <TabsList>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments {comments?.length ? `(${comments.length})` : ''}
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  Attachments {attachments?.length ? `(${attachments.length})` : ''}
                </TabsTrigger>
                <TabsTrigger value="history">
                  History {history?.length ? `(${history.length})` : ''}
                </TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent className="pt-6">
              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">
                    {complaint.description}
                  </p>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Asset Type</h4>
                    <p>{complaint.assetType}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Asset</h4>
                    <p>{complaint.assetName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Category</h4>
                    <p>{complaint.categoryName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Subcategory</h4>
                    <p>{complaint.subcategoryName || 'N/A'}</p>
                  </div>
                  {complaint.location && (
                    <div>
                      <h4 className="font-medium mb-1">Location</h4>
                      <p>{complaint.location}</p>
                    </div>
                  )}
                  <div>
                    <h4 className="font-medium mb-1">Contact Method</h4>
                    <p>{complaint.contactMethod}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-1">Created By</h4>
                    <p>{complaint.createdByName}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Created At</h4>
                    <p>{format(new Date(complaint.createdAt), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Assigned To</h4>
                    <p>{complaint.assignedToName || 'Unassigned'}</p>
                  </div>
                  {complaint.escalatedTo && (
                    <div>
                      <h4 className="font-medium mb-1">Escalated To</h4>
                      <p>{complaint.escalatedToName}</p>
                    </div>
                  )}
                  {complaint.dueDate && (
                    <div>
                      <h4 className="font-medium mb-1">Due Date</h4>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <p>{format(new Date(complaint.dueDate), 'MMM d, yyyy HH:mm')}</p>
                      </div>
                    </div>
                  )}
                  {complaint.resolvedAt && (
                    <div>
                      <h4 className="font-medium mb-1">Resolved At</h4>
                      <p>{format(new Date(complaint.resolvedAt), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                  )}
                  {complaint.closedAt && (
                    <div>
                      <h4 className="font-medium mb-1">Closed At</h4>
                      <p>{format(new Date(complaint.closedAt), 'MMM d, yyyy HH:mm')}</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              {/* Comments Tab */}
              <TabsContent value="comments" className="space-y-6">
                {isLoadingComments ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading comments...</span>
                  </div>
                ) : comments && comments.length > 0 ? (
                  <div className="space-y-4">
                    {comments.map((comment) => (
                      <div key={comment.id} className={`p-4 rounded-lg ${comment.is_internal ? 'bg-amber-50' : 'bg-slate-50'}`}>
                        <div className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={(comment as any).profiles?.avatar_url || ''} />
                            <AvatarFallback>
                              {(comment as any).profiles?.full_name?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="font-medium">
                                {(comment as any).profiles?.full_name}
                                {comment.is_internal && (
                                  <Badge variant="outline" className="ml-2 text-amber-600 border-amber-300 bg-amber-50">
                                    Internal Note
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {formatDistance(new Date(comment.created_at), new Date(), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="mt-1 whitespace-pre-wrap">{comment.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No comments yet</h3>
                    <p className="text-muted-foreground">
                      Be the first to add a comment to this complaint
                    </p>
                  </div>
                )}
                
                {/* Add comment form */}
                <div className="pt-4 border-t">
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="internal-comment"
                          checked={isInternalComment}
                          onChange={(e) => setIsInternalComment(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="internal-comment">Internal note (only visible to staff)</Label>
                      </div>
                      <Button onClick={handleCommentSubmit}>
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* Attachments Tab */}
              <TabsContent value="attachments" className="space-y-6">
                {isLoadingAttachments ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading attachments...</span>
                  </div>
                ) : attachments && attachments.length > 0 ? (
                  <div className="space-y-2">
                    {attachments.map((attachment) => (
                      <div key={attachment.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center gap-3">
                          <Paperclip className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <span>{attachment.file_name}</span>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <span>{(attachment.file_size / 1024).toFixed(1)} KB</span>
                              <span className="mx-1">•</span>
                              <span>Uploaded by {(attachment as any).profiles?.full_name}</span>
                              <span className="mx-1">•</span>
                              <span>{format(new Date(attachment.created_at), 'MMM d, yyyy')}</span>
                              {attachment.is_internal && (
                                <>
                                  <span className="mx-1">•</span>
                                  <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
                                    Internal
                                  </Badge>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={attachment.file_url} target="_blank" rel="noopener noreferrer">
                            Download
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Paperclip className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No attachments</h3>
                    <p className="text-muted-foreground">
                      No files have been attached to this complaint
                    </p>
                  </div>
                )}
                
                {/* Upload attachment form */}
                <div className="pt-4 border-t">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="file-upload">Upload File</Label>
                      <input
                        id="file-upload"
                        type="file"
                        onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        className="block w-full text-sm text-slate-500 mt-1
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-primary-foreground
                          hover:file:bg-primary/90"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="internal-file"
                          checked={isInternalFile}
                          onChange={(e) => setIsInternalFile(e.target.checked)}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="internal-file">Internal file (only visible to staff)</Label>
                      </div>
                      <Button onClick={handleFileUpload} disabled={!selectedFile}>
                        Upload
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              {/* History Tab */}
              <TabsContent value="history">
                {isLoadingHistory ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading history...</span>
                  </div>
                ) : history && history.length > 0 ? (
                  <div className="relative pl-6 border-l-2 border-muted space-y-4">
                    {history.map((item) => (
                      <div key={item.id} className="relative pb-4">
                        <div className="absolute -left-[25px] bg-background p-1 rounded-full">
                          <History className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1">
                            <div className="font-medium">{(item as any).profiles?.full_name}</div>
                            <span className="text-muted-foreground">
                              {item.action.replace(/_/g, ' ')}
                            </span>
                            {item.new_value && (
                              <span>to <Badge variant="outline">{item.new_value}</Badge></span>
                            )}
                            {item.old_value && item.new_value && (
                              <span>from <Badge variant="outline" className="bg-muted">{item.old_value}</Badge></span>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <History className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">No history</h3>
                    <p className="text-muted-foreground">
                      No history records found for this complaint
                    </p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
        
        {/* Right column - Actions */}
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
              <CardDescription>
                Update the complaint status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Status</Label>
                <div className="mt-1">
                  <Badge className={`${statusColors[complaint.status]} w-full justify-center py-1 text-base`}>
                    {complaint.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              
              {canManage && (
                <div>
                  <Label>Change Status</Label>
                  <Select
                    defaultValue={complaint.status}
                    onValueChange={(value) => handleStatusChange(value as ComplaintStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="waiting_on_user">Waiting on User</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="reopened">Reopened</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Priority Card */}
          <Card>
            <CardHeader>
              <CardTitle>Priority</CardTitle>
              <CardDescription>
                Set complaint priority level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Current Priority</Label>
                <div className="mt-1">
                  <Badge className={`${priorityColors[complaint.priority]} w-full justify-center py-1 text-base`}>
                    {complaint.priority}
                  </Badge>
                </div>
              </div>
              
              {canManage && (
                <div>
                  <Label>Change Priority</Label>
                  <Select
                    defaultValue={complaint.priority}
                    onValueChange={(value) => handlePriorityChange(value as ComplaintPriority)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* SLA Card */}
          {complaint.dueDate && (
            <Card className={complaint.slaBreach ? "border-red-300" : ""}>
              <CardHeader className={complaint.slaBreach ? "bg-red-50" : ""}>
                <CardTitle className="flex items-center">
                  <Clock className="mr-2 h-5 w-5" />
                  SLA Due Date
                </CardTitle>
                <CardDescription>
                  Time remaining to resolve
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-2">
                  {complaint.slaBreach ? (
                    <div className="text-red-600 flex flex-col items-center">
                      <AlertTriangle className="h-8 w-8 mb-2" />
                      <span className="font-bold text-lg">SLA Breached</span>
                      <span className="text-sm">
                        Due {formatDistance(new Date(complaint.dueDate), new Date(), { addSuffix: true })}
                      </span>
                    </div>
                  ) : (
                    <div className="text-amber-600">
                      <span className="font-bold text-lg">
                        {formatDistance(new Date(complaint.dueDate), new Date(), { addSuffix: false })}
                      </span>
                      <p className="text-sm text-muted-foreground mt-1">
                        Due by {format(new Date(complaint.dueDate), 'MMM d, yyyy HH:mm')}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Actions Card */}
          {canManage && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Assign to staff */}
                <div>
                  <Label>Assign To</Label>
                  <Select
                    defaultValue={complaint.assignedTo || ""}
                    onValueChange={handleAssignmentChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Unassigned</SelectItem>
                      {/* This would be populated from a staff list */}
                      <SelectItem value="staff-1">John Doe</SelectItem>
                      <SelectItem value="staff-2">Jane Smith</SelectItem>
                      <SelectItem value="staff-3">Robert Johnson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Delete complaint */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      Delete Complaint
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the
                        complaint and all associated data including comments, attachments,
                        and history.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction className="bg-destructive text-destructive-foreground">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
