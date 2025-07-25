import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Bed, Users, Edit, Eye, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onView: (property: Property) => void;
}

export const PropertyCard = ({ property, onEdit, onView }: PropertyCardProps) => {
  const occupancyRate = (property.occupiedBeds / property.totalCapacity) * 100;
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'maintenance':
        return 'secondary';
      case 'inactive':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return 'text-destructive';
    if (rate >= 70) return 'text-warning';
    return 'text-success';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{property.name}</CardTitle>
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusVariant(property.status)}>
              {property.status}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(property)}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(property)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Property
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <Bed className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{property.roomCount}</p>
              <p className="text-xs text-muted-foreground">Rooms</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium">{property.totalCapacity}</p>
              <p className="text-xs text-muted-foreground">Total Beds</p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Occupancy</span>
            <span className={`font-medium ${getOccupancyColor(occupancyRate)}`}>
              {occupancyRate.toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{property.occupiedBeds} occupied</span>
            <span>{property.availableBeds} available</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onView(property)}
        >
          Manage Rooms
        </Button>
      </CardFooter>
    </Card>
  );
};