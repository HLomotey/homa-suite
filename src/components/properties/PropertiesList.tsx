import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Grid3X3,
  Plus,
  Table as TableIcon,
  Search,
  Filter,
  MapPin,
  Home,
  DollarSign,
  Calendar,
  Edit,
  Trash2,
  Bath,
  Bed,
  Square,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { cn } from "@/lib/utils";

// Import FrontendProperty from Supabase types
import { FrontendProperty } from "../../integration/supabase/types";

// Properties List Component
export const PropertiesList = ({
  properties,
  onEdit,
  onDelete,
  onAddProperty,
  onSelect,
}: {
  properties: FrontendProperty[];
  onEdit: (property: FrontendProperty) => void;
  onDelete: (id: string) => void;
  onAddProperty: () => void;
  onSelect?: (propertyId: string) => void;
}) => {
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isExporting, setIsExporting] = useState(false);

  // Filter properties based on search query and status filter
  const filteredProperties = properties.filter((property) => {
    const locationText = property.location ? 
      `${property.location.city} ${property.location.state}`.toLowerCase() : '';
      
    const matchesSearch =
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      locationText.includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      property.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  // Function to export properties to Excel
  const exportToExcel = () => {
    try {
      setIsExporting(true);
      
      // Prepare data for export
      const exportData = filteredProperties.map(property => ({
        'Property': property.title,
        'Address': property.address,
        'Location': property.location ? `${property.location.city}, ${property.location.state}` : 'Not assigned',
        'Type': property.type,
        'Price': `$${property.price.toLocaleString()}`,
        'Status': property.status,
        'Bedrooms': property.bedrooms,
        'Bathrooms': property.bathrooms,
        'Area (sq ft)': property.area,
        'Date Added': property.dateAdded
      }));
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Properties');
      
      // Generate Excel file
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      
      // Save file
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(data, `properties_${new Date().toISOString().split('T')[0]}.xlsx`);
      
      setIsExporting(false);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      setIsExporting(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Property Management
          </h2>
          <p className="text-white/60">Manage your real estate portfolio</p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex items-center bg-black/40 backdrop-blur-md border border-white/10 rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className={cn(
                "rounded-md",
                viewMode === "grid"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={cn(
                "rounded-md",
                viewMode === "table"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              )}
            >
              <TableIcon className="h-4 w-4" />
            </Button>
          </div>

          <Button onClick={exportToExcel} variant="outline" disabled={isExporting} className="mr-2">
            {isExporting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </>
            )}
          </Button>
          <Button onClick={onAddProperty}>
            <Plus className="h-4 w-4 mr-2" />
            Add Property
          </Button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
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
            aria-label="Filter properties by status"
            title="Filter properties by status"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="pending">Pending</option>
            <option value="sold">Sold</option>
            <option value="rented">Rented</option>
          </select>
        </div>
      </div>

      {/* Property Cards or Table */}
      {viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={() => onEdit(property)}
              onDelete={() => onDelete(property.id)}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Property</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProperties.map((property) => (
                <TableRow 
                  key={property.id} 
                  className="cursor-pointer hover:bg-black/20" 
                  onClick={() => onSelect && onSelect(property.id)}
                >
                  <TableCell className="font-medium">
                    {property.title}
                  </TableCell>
                  <TableCell>{property.address}</TableCell>
                  <TableCell>
                    {property.location ? 
                      `${property.location.city}, ${property.location.state}` : 
                      <span className="text-muted-foreground italic">Not assigned</span>}
                  </TableCell>
                  <TableCell>{property.type}</TableCell>
                  <TableCell>${property.price.toLocaleString()}</TableCell>
                  <TableCell>
                    <StatusBadge status={property.status} />
                  </TableCell>
                  <TableCell>{property.dateAdded}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(property);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(property.id);
                        }}
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
      )}
    </div>
  );
};

// Property Card Component
const PropertyCard = ({
  property,
  onEdit,
  onDelete,
  onSelect,
}: {
  property: FrontendProperty;
  onEdit: () => void;
  onDelete: () => void;
  onSelect?: (propertyId: string) => void;
}) => {
  return (
    <div 
    className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden cursor-pointer hover:border-primary/50 transition-colors" 
    onClick={() => onSelect && onSelect(property.id)}
  >
      <div className="relative h-48">
        <img
          src={property.image}
          alt={property.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 right-3">
          <StatusBadge status={property.status} />
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white mb-1">
          {property.title}
        </h3>
        <p className="text-white/60 flex items-center text-sm mb-1">
          <MapPin className="h-3 w-3 mr-1" />
          {property.address}
        </p>
        <p className="text-white/60 flex items-center text-sm mb-3">
          <Home className="h-3 w-3 mr-1" />
          {property.location ? 
            `${property.location.city}, ${property.location.state}` : 
            <span className="italic">No location assigned</span>}
        </p>
        <div className="flex justify-between mb-4">
          <div className="text-white font-bold">
            ${property.price.toLocaleString()}
          </div>
          <div className="flex items-center gap-3 text-white/60 text-sm">
            <span className="flex items-center">
              <Bed className="h-3 w-3 mr-1" />
              {property.bedrooms}
            </span>
            <span className="flex items-center">
              <Bath className="h-3 w-3 mr-1" />
              {property.bathrooms}
            </span>
            <span className="flex items-center">
              <Square className="h-3 w-3 mr-1" />
              {property.area} ft²
            </span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="text-sm text-white/60 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Added {property.dateAdded}
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-500/20 text-green-500 border-green-500/30";
      case "pending":
        return "bg-amber-500/20 text-amber-500 border-amber-500/30";
      case "sold":
        return "bg-blue-500/20 text-blue-500 border-blue-500/30";
      case "rented":
        return "bg-purple-500/20 text-purple-500 border-purple-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Badge className={`${getStatusColor(status)} border`} variant="outline">
      {status}
    </Badge>
  );
};

export default PropertiesList;
