import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Grid3X3,
  Plus,
  Edit,
  Trash2,
  Users,
  Building2,
  Calendar,
  Table as TableIcon,
  Gauge,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UtilitiesDashboard } from "@/components/utilities/UtilitiesDashboard";

interface Staff {
  id: string;
  name: string;
  position: string;
  department: string;
  employmentStatus: string;
  housingEligible: boolean;
}

interface Assignment {
  id: string;
  staffId: string;
  propertyId: string;
  roomNumber: string;
  startDate: string;
  endDate: string | null;
  status: "active" | "pending" | "completed";
}

const mockStaff: Staff[] = [
  {
    id: "1",
    name: "John Doe",
    position: "Chef",
    department: "Kitchen",
    employmentStatus: "Full-time",
    housingEligible: true,
  },
  // Add more mock staff data
];

const mockAssignments: Assignment[] = [
  {
    id: "1",
    staffId: "1",
    propertyId: "1",
    roomNumber: "101",
    startDate: "2024-01-01",
    endDate: null,
    status: "active",
  },
  // Add more mock assignments
];

export default function Housing() {
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("housing");

  const filteredAssignments = mockAssignments.filter((assignment) => {
    const staff = mockStaff.find((s) => s.id === assignment.staffId);
    if (!staff) return false;

    const matchesSearch = staff.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || assignment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    setIsFormOpen(false);
  };

  return (
    <main className="flex-1 p-6">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Staff Housing
              </h1>
              <p className="text-white/60">
                Manage staff housing assignments and utilities
              </p>
            </div>
          </div>

          {/* Main Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="housing">Housing Assignments</TabsTrigger>
              <TabsTrigger value="utilities">Utilities</TabsTrigger>
            </TabsList>

            <TabsContent value="housing">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    label: "Total Assignments",
                    value: filteredAssignments.length,
                    icon: Users,
                  },
                  {
                    label: "Active",
                    value: filteredAssignments.filter(
                      (a) => a.status === "active"
                    ).length,
                    icon: Building2,
                  },
                  {
                    label: "Pending",
                    value: filteredAssignments.filter(
                      (a) => a.status === "pending"
                    ).length,
                    icon: Calendar,
                  },
                  {
                    label: "Completed",
                    value: filteredAssignments.filter(
                      (a) => a.status === "completed"
                    ).length,
                    icon: Calendar,
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-sm">{stat.label}</p>
                        <p className="text-white text-2xl font-bold">
                          {stat.value}
                        </p>
                      </div>
                      <stat.icon className="h-8 w-8 text-white/40" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Input
                    type="text"
                    placeholder="Search by staff name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                    defaultValue="all"
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-4">
                  {/* View Toggle */}
                  <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1">
                    <Button
                      variant={viewMode === "grid" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={cn(
                        "h-8 px-3",
                        viewMode === "grid"
                          ? "bg-white text-black hover:bg-white/90"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <Grid3X3 className="h-4 w-4 mr-2" />
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === "table" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("table")}
                      className={cn(
                        "h-8 px-3",
                        viewMode === "table"
                          ? "bg-white text-black hover:bg-white/90"
                          : "text-white/70 hover:text-white hover:bg-white/10"
                      )}
                    >
                      <TableIcon className="h-4 w-4 mr-2" />
                      Table
                    </Button>
                  </div>
                  <Button onClick={() => setIsFormOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Assignment
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Staff</TableHead>
                      <TableHead>Property</TableHead>
                      <TableHead>Room</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAssignments.map((assignment) => {
                      const staff = mockStaff.find(
                        (s) => s.id === assignment.staffId
                      );
                      return (
                        <TableRow key={assignment.id}>
                          <TableCell className="font-medium">
                            {staff?.name}
                          </TableCell>
                          <TableCell>
                            Property {assignment.propertyId}
                          </TableCell>
                          <TableCell>{assignment.roomNumber}</TableCell>
                          <TableCell>
                            {new Date(
                              assignment.startDate
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {assignment.endDate
                              ? new Date(
                                  assignment.endDate
                                ).toLocaleDateString()
                              : "Ongoing"}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                assignment.status === "active"
                                  ? "default"
                                  : "secondary"
                              }
                              className="capitalize"
                            >
                              {assignment.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="utilities">
              <UtilitiesDashboard />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Housing Assignment</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockStaff.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="property">Property</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select property" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Property 1</SelectItem>
                    <SelectItem value="2">Property 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="room">Room Number</Label>
                <Input id="room" name="room" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input id="startDate" name="startDate" type="date" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date (Optional)</Label>
                <Input id="endDate" name="endDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                className="min-h-[100px]"
                placeholder="Add any additional notes about this assignment"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Create Assignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
