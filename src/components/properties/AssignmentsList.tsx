import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/custom-ui";
import { Plus, Search, Filter, Users, Calendar, Edit, Trash2, DoorOpen, Building2, Clock } from "lucide-react";
import AssignmentForm from "./AssignmentForm";
import { Assignment, mockProperties } from "./data/housing-data";

// Mock data for rooms for the form
const mockRooms = [
  {
    id: "1",
    name: "Room 101",
    propertyId: "1"
  },
  {
    id: "2",
    name: "Room 102",
    propertyId: "1"
  },
  {
    id: "3",
    name: "Master Bedroom",
    propertyId: "2"
  },
  {
    id: "4",
    name: "Guest Room",
    propertyId: "2"
  },
  {
    id: "5",
    name: "Penthouse Suite",
    propertyId: "3"
  }
];

// Mock data for assignments
const mockAssignments: Assignment[] = [
  {
    id: "1",
    tenantName: "John Doe",
    tenantId: "T001",
    propertyId: "1",
    propertyName: "Modern Downtown Apartment",
    roomId: "1",
    roomName: "Room 101",
    status: "Active",
    startDate: "2024-01-15",
    endDate: "2024-12-31",
    rentAmount: 800,
    paymentStatus: "Paid"
  },
  {
    id: "2",
    tenantName: "Jane Smith",
    tenantId: "T002",
    propertyId: "2",
    propertyName: "Suburban Family Home",
    roomId: "3",
    roomName: "Master Bedroom",
    status: "Active",
    startDate: "2024-02-01",
    endDate: "2025-01-31",
    rentAmount: 1200,
    paymentStatus: "Paid"
  },
  {
    id: "3",
    tenantName: "Michael Johnson",
    tenantId: "T003",
    propertyId: "3",
    propertyName: "Luxury Penthouse",
    roomId: "5",
    roomName: "Penthouse Suite",
    status: "Active",
    startDate: "2024-03-01",
    endDate: "2024-08-31",
    rentAmount: 1800,
    paymentStatus: "Overdue"
  },
  {
    id: "4",
    tenantName: "Emily Wilson",
    tenantId: "T004",
    propertyId: "1",
    propertyName: "Modern Downtown Apartment",
    roomId: "2",
    roomName: "Room 102",
    status: "Pending",
    startDate: "2024-08-01",
    endDate: "2025-07-31",
    rentAmount: 750,
    paymentStatus: "Not Due"
  },
  {
    id: "5",
    tenantName: "Robert Brown",
    tenantId: "T005",
    propertyId: "2",
    propertyName: "Suburban Family Home",
    roomId: "4",
    roomName: "Guest Room",
    status: "Expired",
    startDate: "2023-06-01",
    endDate: "2024-05-31",
    rentAmount: 900,
    paymentStatus: "Paid"
  }
];

// Assignments List Component
export const AssignmentsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [assignments, setAssignments] = useState<Assignment[]>(mockAssignments);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | undefined>();

  // Filter assignments based on search query, status filter, and property filter
  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = 
      assignment.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.roomName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      assignment.tenantId.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      assignment.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesProperty = 
      propertyFilter === "all" || 
      assignment.propertyId === propertyFilter;
    
    return matchesSearch && matchesStatus && matchesProperty;
  });

  // Get unique properties for the filter dropdown
  const uniqueProperties = Array.from(
    new Set(assignments.map(assignment => assignment.propertyId))
  ).map(propertyId => {
    const assignment = assignments.find(a => a.propertyId === propertyId);
    return {
      id: propertyId,
      name: assignment ? assignment.propertyName : ""
    };
  });

  // Count assignments by status
  const activeCount = assignments.filter(a => a.status === "Active").length;
  const pendingCount = assignments.filter(a => a.status === "Pending").length;
  const expiredCount = assignments.filter(a => a.status === "Expired").length;
  
  const handleAddAssignment = () => {
    setEditingAssignment(undefined);
    setIsFormOpen(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setEditingAssignment(assignment);
    setIsFormOpen(true);
  };

  const handleDeleteAssignment = (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSaveAssignment = (assignmentData: Omit<Assignment, "id">) => {
    if (editingAssignment) {
      // Update existing assignment
      setAssignments((prev) =>
        prev.map((a) =>
          a.id === editingAssignment.id
            ? { ...assignmentData, id: editingAssignment.id }
            : a
        )
      );
    } else {
      // Add new assignment
      const newAssignment = {
        ...assignmentData,
        id: `${assignments.length + 1}`,
      };
      setAssignments((prev) => [...prev, newAssignment]);
    }
    setIsFormOpen(false);
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
          value={mockAssignments.length.toString()} 
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
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssignments.map((assignment) => (
              <TableRow key={assignment.id}>
                <TableCell className="font-medium">{assignment.tenantName}</TableCell>
                <TableCell>{assignment.propertyName}</TableCell>
                <TableCell>{assignment.roomName}</TableCell>
                <TableCell>
                  <StatusBadge status={assignment.status} />
                </TableCell>
                <TableCell>{assignment.startDate}</TableCell>
                <TableCell>{assignment.endDate}</TableCell>
                <TableCell>${assignment.rentAmount}/mo</TableCell>
                <TableCell>
                  <PaymentBadge status={assignment.paymentStatus} />
                </TableCell>
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
      </div>

      {/* Assignment Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <AssignmentForm
            assignment={editingAssignment}
            onSave={handleSaveAssignment}
            onCancel={() => setIsFormOpen(false)}
            properties={mockProperties.map(p => ({ id: p.id, title: p.title }))}
            rooms={mockRooms}
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
