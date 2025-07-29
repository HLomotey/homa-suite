import React, { useState } from "react";
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
  DollarSign
} from "lucide-react";
import { FrontendTenant } from "@/integration/supabase/types/tenant";

// Mock data for development
const mockTenants: FrontendTenant[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@email.com",
    phone: "(555) 123-4567",
    dateOfBirth: "1990-05-15",
    occupation: "Software Engineer",
    employer: "Tech Corp",
    emergencyContactName: "Jane Doe",
    emergencyContactPhone: "(555) 987-6543",
    emergencyContactRelationship: "Spouse",
    monthlyIncome: 75000,
    previousAddress: "123 Old St, Previous City",
    leaseStartDate: "2024-01-01",
    leaseEndDate: "2024-12-31",
    securityDeposit: 2000,
    monthlyRent: 1500,
    propertyId: "1",
    roomId: "101",
    status: "Active",
    profileImage: null,
    documents: null,
    notes: "Excellent tenant, always pays on time",
    dateAdded: "2024-01-01"
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    phone: "(555) 234-5678",
    dateOfBirth: "1985-08-22",
    occupation: "Nurse",
    employer: "City Hospital",
    emergencyContactName: "Mike Johnson",
    emergencyContactPhone: "(555) 876-5432",
    emergencyContactRelationship: "Brother",
    monthlyIncome: 65000,
    previousAddress: "456 Previous Ave, Old Town",
    leaseStartDate: "2024-02-01",
    leaseEndDate: "2025-01-31",
    securityDeposit: 1800,
    monthlyRent: 1350,
    propertyId: "2",
    roomId: "201",
    status: "Active",
    profileImage: null,
    documents: null,
    notes: "Great communicator, very respectful",
    dateAdded: "2024-02-01"
  }
];

export interface TenantsListProps {
  tenants?: FrontendTenant[];
  onEdit: (tenant: FrontendTenant) => void;
  onDelete: (id: string) => void;
  onAddTenant: () => void;
}

export const TenantsList: React.FC<TenantsListProps> = ({
  tenants = mockTenants,
  onEdit,
  onDelete,
  onAddTenant,
}) => {
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
          <p className="text-white/60">Manage tenant information and lease details</p>
        </div>
        <Button onClick={onAddTenant} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Add Tenant
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tenants.map((tenant) => (
          <Card key={tenant.id} className="bg-card border-border hover:border-primary/50 transition-colors">
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
                <Badge variant="outline" className={getStatusColor(tenant.status)}>
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
                  <span>{new Date(tenant.leaseEndDate).toLocaleDateString()}</span>
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

      {tenants.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-muted/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <UserPlus className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">No tenants found</h3>
          <p className="text-white/60 mb-4">Get started by adding your first tenant profile.</p>
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