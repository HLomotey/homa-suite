import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/custom-ui";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Search, Filter, DoorOpen, Building2, Users, Calendar, Edit, Trash2, Square, CheckSquare } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import RoomForm from "./RoomForm";
import { FrontendRoom, RoomStatus, RoomType } from "@/integration/supabase/types";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, useBulkDeleteRooms, useRoomsByStatus, useRoomsByProperty } from "@/hooks/room";
import { useProperties } from "@/hooks/property";



// Rooms List Component
export const RoomsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<FrontendRoom | undefined>();
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(false);
  
  // Toast notifications
  const { toast } = useToast();
  
  // Fetch rooms using hooks
  const { rooms, loading: roomsLoading, error: roomsError, refetch: refetchRooms } = useRooms();
  const { create, loading: createLoading } = useCreateRoom();
  const { update, loading: updateLoading } = useUpdateRoom();
  const { deleteRoom, loading: deleteLoading } = useDeleteRoom();
  const { bulkDelete, loading: bulkDeleteLoading } = useBulkDeleteRooms();
  
  // Fetch properties for the form
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();
  
  // Debug properties data
  React.useEffect(() => {
    console.log("RoomsList - Properties loaded:", properties);
    console.log("RoomsList - Properties loading:", propertiesLoading);
    console.log("RoomsList - Properties error:", propertiesError);
  }, [properties, propertiesLoading, propertiesError]);

  // Filter rooms based on search query, status filter, and property filter
  const filteredRooms = rooms ? rooms.filter((room) => {
    const matchesSearch = 
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.type.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      room.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesProperty = 
      propertyFilter === "all" || 
      room.propertyId === propertyFilter;
    
    return matchesSearch && matchesStatus && matchesProperty;
  }) : [];

  // Get unique properties for the filter dropdown
  const uniqueProperties = rooms ? Array.from(
    new Set(rooms.map(room => room.propertyId))
  ).map(propertyId => {
    const room = rooms.find(r => r.propertyId === propertyId);
    return {
      id: propertyId,
      name: room ? room.propertyName : ""
    };
  }) : [];

  const handleAddRoom = () => {
    setIsFormOpen(true);
    setEditingRoom(undefined);
  };

  const handleEditRoom = (room: FrontendRoom) => {
    setIsFormOpen(true);
    setEditingRoom(room);
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await deleteRoom(roomId);
      toast({
        title: "Room deleted",
        description: "Room has been successfully deleted.",
      });
      refetchRooms();
      // Clear selection if the deleted room was selected
      setSelectedRooms(prev => prev.filter(id => id !== roomId));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room. Please try again.",
        variant: "destructive",
      });
      console.error("Error deleting room:", error);
    }
  };

  const handleBulkDeleteRooms = async () => {
    if (selectedRooms.length === 0) return;
    
    try {
      const result = await bulkDelete(selectedRooms);
      
      if (result.success.length > 0) {
        toast({
          title: "Rooms deleted",
          description: `Successfully deleted ${result.success.length} room(s).`,
        });
      }
      
      if (result.errors.length > 0) {
        toast({
          title: "Some deletions failed",
          description: `Failed to delete ${result.errors.length} room(s).`,
          variant: "destructive",
        });
        console.error("Bulk delete errors:", result.errors);
      }
      
      // Clear selections and refresh the list
      setSelectedRooms([]);
      setSelectAll(false);
      refetchRooms();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete rooms. Please try again.",
        variant: "destructive",
      });
      console.error("Error bulk deleting rooms:", error);
    }
  };
  
  const toggleSelectRoom = (roomId: string) => {
    setSelectedRooms(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId);
      } else {
        return [...prev, roomId];
      }
    });
  };
  
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedRooms([]);
    } else {
      setSelectedRooms(filteredRooms.map(room => room.id));
    }
    setSelectAll(!selectAll);
  };
  
  // Update selectAll state when filtered rooms or selections change
  useEffect(() => {
    if (filteredRooms.length > 0 && selectedRooms.length === filteredRooms.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedRooms, filteredRooms]);

  const handleSaveRoom = async (roomData: Omit<FrontendRoom, "id">) => {
    try {
      if (editingRoom) {
        await update(editingRoom.id, roomData);
        toast({
          title: "Room updated",
          description: "Room has been successfully updated.",
        });
      } else {
        await create(roomData);
        toast({
          title: "Room created",
          description: "New room has been successfully created.",
        });
      }
      refetchRooms();
      setIsFormOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${editingRoom ? "update" : "create"} room. Please try again.`,
        variant: "destructive",
      });
      console.error(`Error ${editingRoom ? "updating" : "creating"} room:`, error);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Room Management</h2>
          <p className="text-white/60">Manage your property rooms</p>
        </div>
        <Button onClick={handleAddRoom}>
          <Plus className="h-4 w-4 mr-2" /> Add Room
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total Rooms" 
          value={rooms ? rooms.length.toString() : "0"} 
          icon={<DoorOpen className="h-5 w-5" />}
          color="blue"
          loading={roomsLoading}
        />
        <StatsCard 
          title="Available Rooms" 
          value={rooms ? rooms.filter(r => r.status === "Available").length.toString() : "0"} 
          icon={<Building2 className="h-5 w-5" />}
          color="green"
          loading={roomsLoading}
        />
        <StatsCard 
          title="Occupied Rooms" 
          value={rooms ? rooms.filter(r => r.status === "Occupied").length.toString() : "0"} 
          icon={<Users className="h-5 w-5" />}
          color="amber"
          loading={roomsLoading}
        />
        <StatsCard 
          title="Maintenance" 
          value={rooms ? rooms.filter(r => r.status === "Maintenance").length.toString() : "0"} 
          icon={<Square className="h-5 w-5" />}
          color="purple"
          loading={roomsLoading}
        />
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search rooms..."
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
            aria-label="Filter rooms by status"
            title="Filter rooms by status"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
          </select>
          <select
            className="bg-background border border-input rounded-md px-3 py-2 text-sm"
            value={propertyFilter}
            onChange={(e) => setPropertyFilter(e.target.value)}
            aria-label="Filter rooms by property"
            title="Filter rooms by property"
          >
            <option value="all">All Properties</option>
            {uniqueProperties.map(property => (
              <option key={property.id} value={property.id}>{property.name}</option>
            ))}
          </select>
          {selectedRooms.length > 0 && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={bulkDeleteLoading}
            >
              <Trash2 className="h-4 w-4 mr-2" /> Delete ({selectedRooms.length})
            </Button>
          )}
        </div>
      </div>

      {/* Rooms Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={selectAll} 
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all rooms"
                  disabled={filteredRooms.length === 0 || roomsLoading}
                />
              </TableHead>
              <TableHead>Room</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Occupants</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Available From</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roomsLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">Loading rooms...</TableCell>
              </TableRow>
            ) : roomsError ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4 text-red-500">Error loading rooms</TableCell>
              </TableRow>
            ) : filteredRooms.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-4">No rooms found</TableCell>
              </TableRow>
            ) : filteredRooms.map((room) => (
              <TableRow key={room.id} className={selectedRooms.includes(room.id) ? "bg-primary/5" : ""}>
                <TableCell>
                  <Checkbox 
                    checked={selectedRooms.includes(room.id)}
                    onCheckedChange={() => toggleSelectRoom(room.id)}
                    aria-label={`Select room ${room.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{room.name}</TableCell>
                <TableCell>{room.propertyName}</TableCell>
                <TableCell>{room.type}</TableCell>
                <TableCell>
                  <StatusBadge status={room.status} />
                </TableCell>
                <TableCell>{room.area} ft²</TableCell>
                <TableCell>{room.occupants}/{room.maxOccupants}</TableCell>
                <TableCell>${room.price}/mo</TableCell>
                <TableCell>{room.dateAvailable}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditRoom(room)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleDeleteRoom(room.id)}
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

      {/* Room Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <RoomForm
            room={editingRoom}
            onSave={handleSaveRoom}
            onCancel={() => setIsFormOpen(false)}
            properties={properties ? properties.map(p => ({ id: p.id, title: p.title, address: p.address || '' })) : []}
          />
        </SheetContent>
      </Sheet>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedRooms.length} room{selectedRooms.length !== 1 ? 's' : ''}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={bulkDeleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleBulkDeleteRooms();
              }}
              disabled={bulkDeleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {bulkDeleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
  loading?: boolean;
}

const StatsCard = ({ title, value, icon, color, loading = false }: StatsCardProps) => {
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
      <div className="text-2xl font-bold text-white">
        {loading ? (
          <div className="h-8 w-16 bg-white/10 animate-pulse rounded"></div>
        ) : (
          value
        )}
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: RoomStatus }) => {
  const getStatusColor = (status: RoomStatus) => {
    switch (status.toLowerCase()) {
      case 'available':
        return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'occupied':
        return 'bg-amber-500/20 text-amber-500 border-amber-500/30';
      case 'maintenance':
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

export default RoomsList;
