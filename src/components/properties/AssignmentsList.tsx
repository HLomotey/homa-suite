import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/custom-ui";
import { Plus, Search, Filter, Users, Calendar, Edit, Trash2, DoorOpen, Building2, Clock } from "lucide-react";
import AssignmentForm from "./AssignmentForm";
import { useToast } from "@/components/ui/use-toast";
import { useAssignments, useCreateAssignment, useUpdateAssignment, useDeleteAssignment } from "@/hooks/assignment/useAssignment";
import { useProperties } from "@/hooks/property/useProperty";
import { useRooms } from "@/hooks/room/useRoom";
import { FrontendAssignment } from "@/integration/supabase/types";



// Assignments List Component
export const AssignmentsList = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<FrontendAssignment | undefined>();
  
  // Fetch data using hooks
  const { assignments, loading: assignmentsLoading, error: assignmentsError, refetch: refetchAssignments } = useAssignments();
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();
  const { create, loading: createLoading } = useCreateAssignment();
  const { update, loading: updateLoading } = useUpdateAssignment();
  const { deleteAssignment, loading: deleteLoading } = useDeleteAssignment();
  
  // Debug logs
  useEffect(() => {
    console.log("AssignmentsList - Assignments:", assignments);
    console.log("AssignmentsList - Properties:", properties);
    console.log("AssignmentsList - Rooms:", rooms);
  }, [assignments, properties, rooms]);
  
  // Show errors if any
  useEffect(() => {
    if (assignmentsError) {
      toast({
        title: "Error loading assignments",
        description: assignmentsError.message,
        variant: "destructive",
      });
    }
    
    if (propertiesError) {
      toast({
        title: "Error loading properties",
        description: propertiesError.message,
        variant: "destructive",
      });
    }
    
    if (roomsError) {
      toast({
        title: "Error loading rooms",
        description: roomsError.message,
        variant: "destructive",
      });
    }
  }, [assignmentsError, propertiesError, roomsError, toast]);

  // Filter assignments based on search query, status filter, and property filter
  const filteredAssignments = assignments ? assignments.filter((assignment) => {
    const matchesSearch = 
      (assignment.tenantName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (assignment.propertyName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (assignment.roomName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (assignment.tenantId?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      assignment.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesProperty = 
      propertyFilter === "all" || 
      assignment.propertyId === propertyFilter;
    
    return matchesSearch && matchesStatus && matchesProperty;
  }) : [];

  // Get unique properties for the filter dropdown
  const uniqueProperties = properties ? properties.map(property => ({
    id: property.id,
    name: property.title
  })) : [];

  // Count assignments by status
  const activeCount = assignments ? assignments.filter(a => a.status === "Active").length : 0;
  const pendingCount = assignments ? assignments.filter(a => a.status === "Pending").length : 0;
  const expiredCount = assignments ? assignments.filter(a => a.status === "Expired").length : 0;
  
  const handleAddAssignment = () => {
    setEditingAssignment(undefined);
    setIsFormOpen(true);
  };

  const handleEditAssignment = (assignment: FrontendAssignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteAssignment(id);
      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });
      refetchAssignments();
    } catch (error) {
      console.error("Error deleting assignment:", error);
      toast({
        title: "Error",
        description: "Failed to delete assignment",
        variant: "destructive",
      });
    }
  };

  const handleSaveAssignment = async (assignmentData: Omit<FrontendAssignment, "id">) => {
    try {
      if (editingAssignment) {
        // Update existing assignment
        await update(editingAssignment.id, assignmentData);
        toast({
          title: "Success",
          description: "Assignment updated successfully",
        });
      } else {
        // Add new assignment
        await create(assignmentData);
        toast({
          title: "Success",
          description: "Assignment created successfully",
        });
      }
      refetchAssignments();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving assignment:", error);
      toast({
        title: "Error",
        description: "Failed to save assignment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Room Assignments</h2>
          <p className="text-white/60">Manage tenant assignments to rooms</p>
        </div>
        
        <Button onClick={handleAddAssignment}>
          <Plus className="h-4 w-4 mr-2" />
          New Assignment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total Assignments" 
          value={assignments ? assignments.length.toString() : "0"} 
          icon={<Users className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard 
          title="Active Assignments" 
          value={activeCount.toString()} 
          icon={<Building2 className="h-5 w-5" />}
          color="green"
        />
        <StatsCard 
          title="Pending Assignments" 
          value={pendingCount.toString()} 
          icon={<Clock className="h-5 w-5" />}
          color="amber"
        />
        <StatsCard 
          title="Expired Assignments" 
          value={expiredCount.toString()} 
          icon={<DoorOpen className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search assignments..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <select
            className="bg-background border border-input rounded-md px-3 py-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by status"
            title="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
          </select>
          <select
            className="bg-background border border-input rounded-md px-3 py-2 text-sm"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            aria-label="Filter by property"
            title="Filter by property"
          >
            <option value="all">All Properties</option>
            {uniqueProperties.map(property => (
              <option key={property.id} value={property.id}>{property.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="rounded-md border border-border overflow-hidden">
        {assignmentsLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading assignments...</div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            {searchQuery || statusFilter !== "all" || propertyFilter !== "all" 
              ? "No assignments match your filters"
              : "No assignments found. Create your first assignment!"}
          </div>
        ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tenant</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.tenantName || 'Unassigned'}</TableCell>
                <TableCell>{assignment.propertyName}</TableCell>
                <TableCell>{assignment.roomName}</TableCell>
                <TableCell>
                  <StatusBadge status={assignment.status} />
                </TableCell>
                <TableCell>{assignment.startDate}</TableCell>
                <TableCell>{assignment.endDate}</TableCell>
                <TableCell>${assignment.rentAmount}/mo</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditAssignment(assignment)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteAssignment(assignment.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        )}
      </div>

      {/* Assignment Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <AssignmentForm
            assignment={editingAssignment}
            onSave={handleSaveAssignment}
            onCancel={() => setIsFormOpen(false)}
            properties={properties ? properties.map(p => ({ id: p.id, title: p.title, address: p.address })) : []}
            rooms={rooms ? rooms.map(r => ({ id: r.id, name: r.name, propertyId: r.propertyId })) : []}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
}

const StatsCard = ({ title, value, icon, color }: StatsCardProps) => {
  const colorClasses = {
    blue: "bg-blue-950/40 border-blue-800/30 text-blue-500",
    green: "bg-green-950/40 border-green-800/30 text-green-500",
    amber: "bg-amber-950/40 border-amber-800/30 text-amber-500",
    purple: "bg-purple-950/40 border-purple-800/30 text-purple-500",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-white/60">{title}</span>
        <div className="p-2 rounded-full bg-white/5">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'expired':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border`} variant="outline">
      {status}
    </Badge>
  );
};

// Payment Badge Component
const PaymentBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'pending':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'overdue':
        return 'bg-red-500/20 text-red-500 border-red-500/30';
      case 'not due':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border`} variant="outline">
      {status}
    </Badge>
  );
};

export default AssignmentsList;
