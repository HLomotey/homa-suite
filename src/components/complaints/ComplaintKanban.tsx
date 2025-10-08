/**
 * Complaint Kanban board component for managing complaints through different stages
 */

import React, { useState } from "react";
import { useComplaints } from "@/hooks/complaints";
import { FrontendComplaint, ComplaintStatus } from "@/integration/supabase/types/complaints";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Loader2, Plus, AlertTriangle, Clock } from "lucide-react";
import { format, formatDistance, isAfter } from "date-fns";
import { useNavigate } from "react-router-dom";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { ComplaintForm } from "./ComplaintForm";
import { useQueryClient } from "@tanstack/react-query";

// Status badge colors
const statusColors: Record<string, string> = {
  new: "bg-blue-500",
  in_progress: "bg-yellow-500",
  waiting_on_user: "bg-purple-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
  reopened: "bg-red-600",
};

// Status column definitions
const statusColumns: { id: ComplaintStatus; title: string }[] = [
  { id: "new", title: "New" },
  { id: "in_progress", title: "In Progress" },
  { id: "waiting_on_user", title: "Waiting on User" },
  { id: "resolved", title: "Resolved" },
  { id: "closed", title: "Closed" },
];

interface ComplaintKanbanProps {
  onCreateNew?: () => void;
  onViewDetail?: (id: string) => void;
}

export function ComplaintKanban({ onCreateNew, onViewDetail }: ComplaintKanbanProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { complaints, isLoading, updateComplaint, groupedComplaints, refetch, isUpdating } = useComplaints();
  
  // Sheet state for slide-in form
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    console.log('Drag end result:', result);
    
    // If there's no destination or the item was dropped back in its original position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      console.log('No destination or same position, returning');
      return;
    }
    
    // Get the new status from the destination droppableId
    const newStatus = destination.droppableId as ComplaintStatus;
    
    console.log(`Moving complaint ${draggableId} from ${source.droppableId} to ${newStatus}`);
    
    // Update the complaint status - optimistic update is now handled in the mutation
    updateComplaint({
      id: draggableId,
      updates: { status: newStatus }
    });
  };
  
  // Handle view detail
  const handleViewDetail = (id: string) => {
    if (onViewDetail) {
      onViewDetail(id);
    } else {
      navigate(`/complaints/${id}`);
    }
  };

  // Handle create new complaint
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      setIsFormOpen(true);
    }
  };

  // Handle form success
  const handleFormSuccess = (id: string) => {
    setIsFormOpen(false);
    refetch(); // Refresh the complaints list
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setIsFormOpen(false);
  };
  
  // Render a complaint card
  const renderComplaintCard = (complaint: FrontendComplaint, index: number) => {
    // Check if due date is approaching (within 24 hours)
    const isDueSoon = complaint.dueDate && 
      !complaint.slaBreach && 
      isAfter(new Date(complaint.dueDate), new Date()) && 
      isAfter(new Date(complaint.dueDate), new Date(Date.now() + 24 * 60 * 60 * 1000));
    
    return (
      <Draggable key={complaint.id} draggableId={complaint.id} index={index}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className="mb-3"
          >
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="p-3 pb-0">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-sm font-medium line-clamp-2">
                    {complaint.title}
                  </CardTitle>
                  <Badge className={statusColors[complaint.status]}>
                    {complaint.status.replace(/_/g, ' ')}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-1">
                  {complaint.categoryName}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 pt-2">
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Category:</span>
                    <span className="font-medium">{complaint.categoryName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asset:</span>
                    <span className="font-medium">{complaint.assetName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created by:</span>
                    <span className="font-medium">{complaint.createdByName}</span>
                  </div>
                  {complaint.assignedToName && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Assigned to:</span>
                      <span className="font-medium">{complaint.assignedToName}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex justify-between items-center">
                <div className="flex items-center gap-1">
                  {complaint.commentCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {complaint.commentCount} comments
                    </Badge>
                  )}
                  {complaint.attachmentCount > 0 && (
                    <Badge variant="outline" className="text-xs">
                      {complaint.attachmentCount} files
                    </Badge>
                  )}
                </div>
                <div>
                  {complaint.dueDate && (
                    <div className="flex items-center text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {complaint.slaBreach ? (
                        <span className="text-red-600 font-medium flex items-center">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          SLA Breached
                        </span>
                      ) : (
                        <span className={isDueSoon ? "text-amber-600 font-medium" : ""}>
                          {formatDistance(new Date(complaint.dueDate), new Date(), { addSuffix: true })}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </CardFooter>
              <div 
                className="absolute inset-0 cursor-pointer" 
                onClick={() => handleViewDetail(complaint.id)}
              />
            </Card>
          </div>
        )}
      </Draggable>
    );
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading complaints...</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Complaint Management</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          New Complaint
        </Button>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {statusColumns.map((column) => (
            <div key={column.id} className="flex flex-col h-full">
              <div className="bg-muted rounded-t-lg p-3 font-medium flex justify-between items-center">
                <span>{column.title}</span>
                <Badge variant="secondary">
                  {groupedComplaints[column.id]?.length || 0}
                </Badge>
              </div>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="bg-muted/30 rounded-b-lg p-2 flex-1 min-h-[500px]"
                  >
                    {groupedComplaints[column.id]?.map((complaint, index) => 
                      renderComplaintCard(complaint, index)
                    )}
                    {provided.placeholder}
                    {(!groupedComplaints[column.id] || groupedComplaints[column.id].length === 0) && (
                      <div className="flex flex-col items-center justify-center h-24 text-center text-muted-foreground text-sm border-2 border-dashed border-muted rounded-lg mt-2">
                        <p>No complaints</p>
                        <p>Drag items here</p>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Slide-in Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="sm:max-w-md w-full p-0">
          <ComplaintForm 
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
