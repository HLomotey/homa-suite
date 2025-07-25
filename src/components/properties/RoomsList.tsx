import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent } from "@/components/ui/custom-ui";
import { Plus, Search, Filter, DoorOpen, Building2, Users, Calendar, Edit, Trash2, Square } from "lucide-react";
import RoomForm from "./RoomForm";
import { Room, mockProperties } from "./data/housing-data";

// Mock data for rooms
const mockRooms: Room[] = [
  {
    id: "1",
    name: "Room 101",
    propertyId: "1",
    propertyName: "Modern Downtown Apartment",
    type: "Studio",
    status: "Occupied",
    area: 350,
    occupants: 1,
    maxOccupants: 1,
    price: 800,
    dateAvailable: "2024-08-15"
  },
  {
    id: "2",
    name: "Room 102",
    propertyId: "1",
    propertyName: "Modern Downtown Apartment",
    type: "Single",
    status: "Available",
    area: 300,
    occupants: 0,
    maxOccupants: 1,
    price: 750,
    dateAvailable: "2024-07-30"
  },
  {
    id: "3",
    name: "Master Bedroom",
    propertyId: "2",
    propertyName: "Suburban Family Home",
    type: "Master",
    status: "Occupied",
    area: 450,
    occupants: 2,
    maxOccupants: 2,
    price: 1200,
    dateAvailable: "2024-09-01"
  },
  {
    id: "4",
    name: "Guest Room",
    propertyId: "2",
    propertyName: "Suburban Family Home",
    type: "Single",
    status: "Available",
    area: 350,
    occupants: 0,
    maxOccupants: 1,
    price: 900,
    dateAvailable: "2024-08-01"
  },
  {
    id: "5",
    name: "Penthouse Suite",
    propertyId: "3",
    propertyName: "Luxury Penthouse",
    type: "Master",
    status: "Occupied",
    area: 550,
    occupants: 2,
    maxOccupants: 2,
    price: 1800,
    dateAvailable: "2024-10-15"
  },
  {
    id: "6",
    name: "Guest Suite",
    propertyId: "3",
    propertyName: "Luxury Penthouse",
    type: "Suite",
    status: "Maintenance",
    area: 400,
    occupants: 0,
    maxOccupants: 2,
    price: 1500,
    dateAvailable: "2024-08-10"
  },
];

// Rooms List Component
export const RoomsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | undefined>();

  // Filter rooms based on search query, status filter, and property filter
  const filteredRooms = rooms.filter((room) => {
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
  });

  // Get unique properties for the filter dropdown
  const uniqueProperties = Array.from(
    new Set(rooms.map(room => room.propertyId))
  ).map(propertyId => {
    const room = rooms.find(r => r.propertyId === propertyId);
    return {
      id: propertyId,
      name: room ? room.propertyName : ""
    };
  });

  const handleAddRoom = () => {
    setIsFormOpen(true);
    setEditingRoom(undefined);
  };

  const handleEditRoom = (room: Room) => {
    setIsFormOpen(true);
    setEditingRoom(room);
  };

  const handleDeleteRoom = (roomId: string) => {
    setRooms(rooms.filter(room => room.id !== roomId));
  };

  const handleSaveRoom = (room: Room) => {
    if (editingRoom) {
      setRooms(rooms.map(r => r.id === room.id ? room : r));
    } else {
      setRooms([...rooms, room]);
    }
    setIsFormOpen(false);
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
          value={mockRooms.length.toString()} 
          icon={<DoorOpen className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard 
          title="Available Rooms" 
          value={mockRooms.filter(r => r.status === "Available").length.toString()} 
          icon={<Building2 className="h-5 w-5" />}
          color="green"
        />
        <StatsCard 
          title="Occupied Rooms" 
          value={mockRooms.filter(r => r.status === "Occupied").length.toString()} 
          icon={<Users className="h-5 w-5" />}
          color="amber"
        />
        <StatsCard 
          title="Maintenance" 
          value={mockRooms.filter(r => r.status === "Maintenance").length.toString()} 
          icon={<Square className="h-5 w-5" />}
          color="purple"
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
          >
            <option value="all">All Properties</option>
            {uniqueProperties.map(property => (
              <option key={property.id} value={property.id}>{property.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="rounded-md border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
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
            {filteredRooms.map((room) => (
              <TableRow key={room.id}>
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
            properties={mockProperties.map(p => ({ id: p.id, title: p.title }))}
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
