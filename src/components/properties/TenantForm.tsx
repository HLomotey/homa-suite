import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Upload, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { FrontendTenant } from "@/integration/supabase/types/tenant";

export interface TenantFormProps {
  tenant?: FrontendTenant;
  onSave: (tenant: Omit<FrontendTenant, "id" | "dateAdded">) => void;
  onCancel: () => void;
}

export const TenantForm: React.FC<TenantFormProps> = ({
  tenant,
  onSave,
  onCancel,
}) => {
  const [formData, setFormData] = React.useState<Omit<FrontendTenant, "id" | "dateAdded">>({
    firstName: tenant?.firstName || "",
    lastName: tenant?.lastName || "",
    email: tenant?.email || "",
    phone: tenant?.phone || "",
    dateOfBirth: tenant?.dateOfBirth || "",
    occupation: tenant?.occupation || "",
    employer: tenant?.employer || "",
    emergencyContactName: tenant?.emergencyContactName || "",
    emergencyContactPhone: tenant?.emergencyContactPhone || "",
    emergencyContactRelationship: tenant?.emergencyContactRelationship || "",
    monthlyIncome: tenant?.monthlyIncome || 0,
    previousAddress: tenant?.previousAddress || "",
    leaseStartDate: tenant?.leaseStartDate || "",
    leaseEndDate: tenant?.leaseEndDate || "",
    securityDeposit: tenant?.securityDeposit || 0,
    monthlyRent: tenant?.monthlyRent || 0,
    propertyId: tenant?.propertyId || "",
    roomId: tenant?.roomId || "",
    status: tenant?.status || "Pending",
    profileImage: tenant?.profileImage || null,
    documents: tenant?.documents || null,
    notes: tenant?.notes || "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: ["monthlyIncome", "securityDeposit", "monthlyRent"].includes(name)
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold">
          {tenant ? "Edit Tenant" : "Add New Tenant"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.profileImage || undefined} />
              <AvatarFallback className="bg-primary/20 text-primary text-lg">
                {formData.firstName && formData.lastName 
                  ? getInitials(formData.firstName, formData.lastName)
                  : <User className="h-8 w-8" />
                }
              </AvatarFallback>
            </Avatar>
            <div 
              className="cursor-pointer text-center"
              onClick={() => document.getElementById("profile-upload")?.click()}
            >
              <Button type="button" variant="outline" size="sm" className="gap-2">
                <Upload className="h-4 w-4" />
                Upload Photo
              </Button>
              <input
                id="profile-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setFormData(prev => ({ ...prev, profileImage: event.target?.result as string }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-border pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="text-sm font-medium text-white/80">
                  First Name
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="lastName" className="text-sm font-medium text-white/80">
                  Last Name
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="text-sm font-medium text-white/80">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-white/80">
                  Phone
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className="text-sm font-medium text-white/80">
                Date of Birth
              </label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-border pb-2">
              Employment Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="occupation" className="text-sm font-medium text-white/80">
                  Occupation
                </label>
                <Input
                  id="occupation"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="employer" className="text-sm font-medium text-white/80">
                  Employer
                </label>
                <Input
                  id="employer"
                  name="employer"
                  value={formData.employer}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="monthlyIncome" className="text-sm font-medium text-white/80">
                Monthly Income ($)
              </label>
              <Input
                id="monthlyIncome"
                name="monthlyIncome"
                type="number"
                value={formData.monthlyIncome}
                onChange={handleChange}
                className="mt-2"
                min={0}
                required
              />
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-border pb-2">
              Emergency Contact
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="emergencyContactName" className="text-sm font-medium text-white/80">
                  Contact Name
                </label>
                <Input
                  id="emergencyContactName"
                  name="emergencyContactName"
                  value={formData.emergencyContactName}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="emergencyContactPhone" className="text-sm font-medium text-white/80">
                  Contact Phone
                </label>
                <Input
                  id="emergencyContactPhone"
                  name="emergencyContactPhone"
                  value={formData.emergencyContactPhone}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="emergencyContactRelationship" className="text-sm font-medium text-white/80">
                Relationship
              </label>
              <Input
                id="emergencyContactRelationship"
                name="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>
          </div>

          {/* Lease Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-border pb-2">
              Lease Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="propertyId" className="text-sm font-medium text-white/80">
                  Property ID
                </label>
                <Input
                  id="propertyId"
                  name="propertyId"
                  value={formData.propertyId}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="roomId" className="text-sm font-medium text-white/80">
                  Room ID
                </label>
                <Input
                  id="roomId"
                  name="roomId"
                  value={formData.roomId || ""}
                  onChange={handleChange}
                  className="mt-2"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="leaseStartDate" className="text-sm font-medium text-white/80">
                  Lease Start Date
                </label>
                <Input
                  id="leaseStartDate"
                  name="leaseStartDate"
                  type="date"
                  value={formData.leaseStartDate}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
              <div>
                <label htmlFor="leaseEndDate" className="text-sm font-medium text-white/80">
                  Lease End Date
                </label>
                <Input
                  id="leaseEndDate"
                  name="leaseEndDate"
                  type="date"
                  value={formData.leaseEndDate}
                  onChange={handleChange}
                  className="mt-2"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="monthlyRent" className="text-sm font-medium text-white/80">
                  Monthly Rent ($)
                </label>
                <Input
                  id="monthlyRent"
                  name="monthlyRent"
                  type="number"
                  value={formData.monthlyRent}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  required
                />
              </div>
              <div>
                <label htmlFor="securityDeposit" className="text-sm font-medium text-white/80">
                  Security Deposit ($)
                </label>
                <Input
                  id="securityDeposit"
                  name="securityDeposit"
                  type="number"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="text-sm font-medium text-white/80">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
              >
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Former">Former</option>
                <option value="Blacklisted">Blacklisted</option>
              </select>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white border-b border-border pb-2">
              Additional Information
            </h3>
            <div>
              <label htmlFor="previousAddress" className="text-sm font-medium text-white/80">
                Previous Address
              </label>
              <Input
                id="previousAddress"
                name="previousAddress"
                value={formData.previousAddress}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="text-sm font-medium text-white/80">
                Notes
              </label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes || ""}
                onChange={handleChange}
                className="mt-2"
                rows={4}
                placeholder="Any additional notes about the tenant..."
              />
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Tenant</Button>
      </div>
    </div>
  );
};

export default TenantForm;