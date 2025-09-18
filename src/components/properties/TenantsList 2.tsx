import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  UserPlus,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  LayoutGrid,
  Table as TableIcon,
  Loader2,
} from "lucide-react";
import { FrontendTenant } from "@/integration/supabase/types/tenant";
import { useTenants } from "@/hooks/tenant";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useToast } from "@/components/ui/use-toast";

export interface TenantsListProps {
  tenants?: FrontendTenant[];
  onEdit: (tenant: FrontendTenant) => void;
  onDelete: (id: string) => void;
  onAddTenant: () => void;
}

export const TenantsList: React.FC<TenantsListProps> = ({
  tenants: propTenants,
  onEdit,
  onDelete,
  onAddTenant,
}) => {
  // Fetch tenants from Supabase
  const { tenants: fetchedTenants, loading, error, refetch } = useTenants();
  const { toast } = useToast();

  // Use prop tenants if provided, otherwise use fetched tenants
  const tenants = propTenants || fetchedTenants;

  // Refresh data when component mounts or when it receives focus
  // useEffect(() => {
  //   // Initial fetch
  //   refetch();

  //   // Set up event listener for when the window regains focus
  //   const handleFocus = () => {
  //     refetch();
  //   };

  //   window.addEventListener("focus", handleFocus);

  //   // Clean up event listener
  //   return () => {
  //     window.removeEventListener("focus", handleFocus);
  //   };
  // }, [refetch]);

  // View mode state (grid or table)
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Show error toast if fetch fails
  React.useEffect(() => {
    if (error) {
      toast({
        title: "Error loading tenants",
        description: error.message,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500/20 text-green-300 border-green-500/50";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/50";
      case "Former":
        return "bg-gray-500/20 text-gray-300 border-gray-500/50";
      case "Blacklisted":
        return "bg-red-500/20 text-red-300 border-red-500/50";
      default:
        return "bg-blue-500/20 text-blue-300 border-blue-500/50";
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Tenant Profiles</h2>
          <p className="text-white/60">
            Manage tenant information and lease details
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(value) =>
              value && setViewMode(value as "grid" | "table")
            }
          >
            <ToggleGroupItem value="grid" aria-label="Grid View">
              <LayoutGrid className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="table" aria-label="Table View">
              <TableIcon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>
          <Button onClick={onAddTenant} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-white">Loading tenants...</span>
        </div>
      )}

      {/* Table View */}
      {!loading && viewMode === "table" && tenants.length > 0 && (
        <div className="rounded-md border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">Tenant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Lease End</TableHead>
                <TableHead>Rent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={tenant.profileImage || undefined} />
                        <AvatarFallback className="bg-primary/20 text-primary">
                          {getInitials(tenant.firstName, tenant.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-white">
                          {tenant.firstName} {tenant.lastName}
                        </div>
                        <div className="text-xs text-white/60">
                          {tenant.occupation}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={getStatusColor(tenant.status)}
                    >
                      {tenant.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-white/60">
                        <Mail className="h-3 w-3" />
                        {tenant.email}
                      </div>
                      <div className="flex items-center gap-1 text-white/60">
                        <Phone className="h-3 w-3" />
                        {tenant.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-white/60">
                      <MapPin className="h-3 w-3" />
                      Room {tenant.roomId}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-white/60">
                      <Calendar className="h-3 w-3" />
                      {new Date(tenant.leaseEndDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-white/60">
                      <DollarSign className="h-3 w-3" />${tenant.monthlyRent}/mo
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(tenant)}
                        className="h-8 gap-1"
                      >
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDelete(tenant.id)}
                        className="h-8 gap-1 text-red-400 border-red-400/50 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-3 w-3" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grid View */}
      {!loading && viewMode === "grid" && tenants.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map((tenant) => (
            <Card
              key={tenant.id}
              className="bg-card border-border hover:border-primary/50 transition-colors"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={tenant.profileImage || undefined} />
                      <AvatarFallback className="bg-primary/20 text-primary">
                        {getInitials(tenant.firstName, tenant.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg text-white">
                        {tenant.firstName} {tenant.lastName}
                      </CardTitle>
                      <div className="flex items-center gap-1 text-sm text-white/60">
                        <Mail className="h-3 w-3" />
                        {tenant.email}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={getStatusColor(tenant.status)}
                  >
                    {tenant.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-white/60">
                    <Phone className="h-3 w-3" />
                    <span>{tenant.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <DollarSign className="h-3 w-3" />
                    <span>${tenant.monthlyRent}/mo</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(tenant.leaseEndDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="h-3 w-3" />
                    <span>Room {tenant.roomId}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-white/60">Occupation:</span>
                    <span className="text-white ml-2">{tenant.occupation}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-white/60">Employer:</span>
                    <span className="text-white ml-2">{tenant.employer}</span>
                  </div>
                </div>

                {tenant.notes && (
                  <div className="bg-muted/20 p-3 rounded-md">
                    <p className="text-sm text-white/80">{tenant.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(tenant)}
                    className="flex-1 gap-2"
                  >
                    <Edit className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDelete(tenant.id)}
                    className="flex-1 gap-2 text-red-400 border-red-400/50 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && tenants.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            No tenants found
          </h3>
          <p className="text-white/60 mb-4">
            Get started by adding your first tenant profile.
          </p>
          <Button onClick={onAddTenant} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add First Tenant
          </Button>
        </div>
      )}
    </div>
  );
};

export default TenantsList;
