import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { PropertyStats } from '@/components/properties/PropertyStats';
import { PropertyCard } from '@/components/properties/PropertyCard';
import { AddPropertyDialog } from '@/components/properties/AddPropertyDialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';

interface Property {
  id: string;
  name: string;
  address: string;
  totalCapacity: number;
  occupiedBeds: number;
  availableBeds: number;
  status: 'active' | 'maintenance' | 'inactive';
  roomCount: number;
}

// Mock data
const mockProperties: Property[] = [
  {
    id: '1',
    name: 'Downtown Staff Housing',
    address: '123 Main Street, Downtown, TX 75201',
    totalCapacity: 48,
    occupiedBeds: 42,
    availableBeds: 6,
    status: 'active',
    roomCount: 24
  },
  {
    id: '2',
    name: 'Riverside Apartments',
    address: '456 River Road, Riverside, TX 75202',
    totalCapacity: 32,
    occupiedBeds: 28,
    availableBeds: 4,
    status: 'active',
    roomCount: 16
  },
  {
    id: '3',
    name: 'Sunset Villa',
    address: '789 Sunset Boulevard, West End, TX 75203',
    totalCapacity: 24,
    occupiedBeds: 18,
    availableBeds: 6,
    status: 'maintenance',
    roomCount: 12
  },
  {
    id: '4',
    name: 'Garden Court',
    address: '321 Garden Lane, Uptown, TX 75204',
    totalCapacity: 36,
    occupiedBeds: 30,
    availableBeds: 6,
    status: 'active',
    roomCount: 18
  }
];

const Properties = () => {
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>(mockProperties);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const stats = {
    totalProperties: properties.length,
    totalRooms: properties.reduce((sum, p) => sum + p.roomCount, 0),
    totalBeds: properties.reduce((sum, p) => sum + p.totalCapacity, 0),
    occupiedBeds: properties.reduce((sum, p) => sum + p.occupiedBeds, 0),
    availableBeds: properties.reduce((sum, p) => sum + p.availableBeds, 0),
    occupancyRate: properties.reduce((sum, p) => sum + p.totalCapacity, 0) > 0 
      ? (properties.reduce((sum, p) => sum + p.occupiedBeds, 0) / properties.reduce((sum, p) => sum + p.totalCapacity, 0)) * 100 
      : 0
  };

  useEffect(() => {
    let filtered = properties;
    
    if (searchTerm) {
      filtered = filtered.filter(property =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(property => property.status === statusFilter);
    }
    
    setFilteredProperties(filtered);
  }, [properties, searchTerm, statusFilter]);

  const handlePropertyAdded = () => {
    // In a real app, this would refetch the properties
    console.log('Property added - refreshing list...');
  };

  const handleEditProperty = (property: Property) => {
    console.log('Edit property:', property);
    // Open edit dialog
  };

  const handleViewProperty = (property: Property) => {
    console.log('View property:', property);
    // Navigate to property details
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="container mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Property Registry</h1>
                <p className="text-muted-foreground mt-2">
                  Manage housing properties, rooms, and occupancy across all locations.
                </p>
              </div>
              <AddPropertyDialog onPropertyAdded={handlePropertyAdded} />
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <PropertyStats stats={stats} />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Properties</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Properties Grid */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProperties.map((property) => (
              <PropertyCard
                key={property.id}
                property={property}
                onEdit={handleEditProperty}
                onView={handleViewProperty}
              />
            ))}
          </div>

          {filteredProperties.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No properties found matching your criteria.</p>
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Properties;