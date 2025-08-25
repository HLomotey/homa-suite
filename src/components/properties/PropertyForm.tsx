import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, Image as ImageIcon, Search, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FrontendProperty,
  PropertyType,
  PropertyStatus,
} from "@/integration/supabase/types";
import { FrontendLocation } from "@/integration/supabase/types/location";
import { useLocation } from "@/hooks/transport/useLocation";
import { useBillingStaff } from "@/hooks/billing";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Property Form Component
export interface PropertyFormProps {
  property?: FrontendProperty;
  onSave: (property: Omit<FrontendProperty, "id" | "dateAdded">) => void;
  onCancel: () => void;
}

export const PropertyForm: React.FC<PropertyFormProps> = ({
  property,
  onSave,
  onCancel,
}) => {
  const { locations, loading: locationsLoading } = useLocation();
  const { staff, loading: staffLoading } = useBillingStaff();
  const [managerSearchOpen, setManagerSearchOpen] = React.useState(false);
  const [managerSearchValue, setManagerSearchValue] = React.useState("");

  // Debug logging
  console.log('PropertyForm - staff data:', staff);
  console.log('PropertyForm - staffLoading:', staffLoading);
  console.log('PropertyForm - staff is array:', Array.isArray(staff));
  console.log('PropertyForm - staff length:', staff?.length);
  
  // Ensure staff is an array before filtering
  const staffArray = Array.isArray(staff) ? staff : [];
  console.log('PropertyForm - staff employment statuses:', staffArray.map(s => s.employmentStatus));
  
  // Filter active staff - try different employment status values
  const activeStaff = staffArray.filter(member => 
    member.employmentStatus === 'Active' || 
    member.employmentStatus === 'Full-time' || 
    member.employmentStatus === 'active' ||
    member.employmentStatus === 'full-time'
  );
  
  console.log('PropertyForm - activeStaff:', activeStaff);
  console.log('PropertyForm - activeStaff length:', activeStaff.length);
  
  const searchStaff = (searchTerm: string) => {
    if (!searchTerm.trim()) return activeStaff || [];
    
    const lowercaseSearch = searchTerm.toLowerCase();
    return (activeStaff || []).filter(
      (member) =>
        member.legalName?.toLowerCase().includes(lowercaseSearch) ||
        member.jobTitle?.toLowerCase().includes(lowercaseSearch) ||
        member.department?.toLowerCase().includes(lowercaseSearch) ||
        member.email?.toLowerCase().includes(lowercaseSearch)
    );
  };
  const [formData, setFormData] = React.useState<
    Omit<FrontendProperty, "id" | "dateAdded">
  >({
    title: property?.title || "",
    address: property?.address || "",
    price: property?.price || 0,
    bedrooms: property?.bedrooms || 1,
    bathrooms: property?.bathrooms || 1,
    area: property?.area || 0,
    type: property?.type || ("Apartment" as PropertyType),
    status: property?.status || ("Available" as PropertyStatus),
    image: property?.image || "",
    description: property?.description || "",
    locationId: property?.locationId || null,
    managerId: property?.managerId || null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "bedrooms" ||
        name === "bathrooms" ||
        name === "area"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h2 className="text-lg font-semibold">
          {property ? "Edit Property" : "Add New Property"}
        </h2>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="address"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Address
              </label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <Select
                value={formData.locationId || undefined}
                onValueChange={(value) =>
                  setFormData((prev) => ({
                    ...prev,
                    locationId: value || null,
                  }))
                }
              >
                <SelectTrigger className="w-full mt-2 h-10">
                  <SelectValue placeholder="Select location..." />
                </SelectTrigger>
                <SelectContent>
                  {locationsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading locations...
                    </SelectItem>
                  ) : locations && locations.length > 0 ? (
                    locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name}{" "}
                        {location.city && location.state
                          ? `(${location.city}, ${location.state})`
                          : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>
                      No locations available
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {locationsLoading && (
                <p className="text-xs text-muted-foreground mt-1">
                  Loading locations...
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="manager"
                className="block text-sm font-medium text-gray-700"
              >
                Property Manager
              </label>
              <Popover 
                open={managerSearchOpen && !staffLoading} 
                onOpenChange={(open) => {
                  if (!staffLoading) {
                    setManagerSearchOpen(open);
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={managerSearchOpen && !staffLoading}
                    className="w-full mt-2 h-10 justify-between"
                    disabled={staffLoading}
                  >
                    {staffLoading ? (
                      "Loading managers..."
                    ) : formData.managerId ? (
                      activeStaff.find((member) => member.id === formData.managerId)?.legalName ||
                      "Manager not found"
                    ) : (
                      "Select manager..."
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-0">
                  <div className="p-2">
                    <Input
                      placeholder="Search managers..."
                      value={managerSearchValue}
                      onChange={(e) => setManagerSearchValue(e.target.value)}
                      className="mb-2"
                    />
                    <div className="max-h-64 overflow-auto">
                      {Array.isArray(activeStaff) && activeStaff.length > 0 ? (
                        searchStaff(managerSearchValue).length > 0 ? (
                          searchStaff(managerSearchValue).map((member) => (
                            <div
                              key={member.id}
                              className="flex flex-col p-2 hover:bg-accent cursor-pointer rounded-sm"
                              onClick={() => {
                                setFormData((prev) => ({
                                  ...prev,
                                  managerId: member.id,
                                }));
                                setManagerSearchOpen(false);
                                setManagerSearchValue("");
                              }}
                            >
                              <span className="font-medium">{member.legalName}</span>
                              <span className="text-sm text-muted-foreground">
                                {member.jobTitle} • {member.department}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No managers match your search
                          </div>
                        )
                      ) : (
                        <div className="p-4 text-center text-muted-foreground">
                          No active managers found
                        </div>
                      )}
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              {staffLoading && (
                <p className="text-xs text-muted-foreground mt-1">
                  Loading managers...
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="price"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Price ($)
                </label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="area"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Area (sq ft)
                </label>
                <Input
                  id="area"
                  name="area"
                  type="number"
                  value={formData.area}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="bedrooms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Bedrooms
                </label>
                <Input
                  id="bedrooms"
                  name="bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="bathrooms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Bathrooms
                </label>
                <Input
                  id="bathrooms"
                  name="bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="type"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                >
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Condo">Condo</option>
                  <option value="Townhouse">Townhouse</option>
                  <option value="Land">Land</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="status"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                >
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="Sold">Sold</option>
                  <option value="Rented">Rented</option>
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="image"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Property Image
              </label>
              <div
                className={cn(
                  "mt-2 border-2 border-dashed rounded-md p-4 hover:border-primary/50 transition-colors cursor-pointer",
                  formData.image ? "border-primary/70" : "border-border"
                )}
                onClick={() => document.getElementById("image-upload")?.click()}
              >
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  {formData.image ? (
                    <div className="relative w-full h-40">
                      <img
                        src={formData.image}
                        alt="Property preview"
                        className="w-full h-full object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData((prev) => ({ ...prev, image: "" }));
                        }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="bg-primary/10 p-2 rounded-full">
                        <ImageIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          Click to upload image
                        </p>
                        <p className="text-xs text-muted-foreground">
                          SVG, PNG, JPG or GIF (max. 2MB)
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                aria-label="Upload property image"
                title="Upload property image"
                placeholder="Upload property image"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setFormData((prev) => ({
                        ...prev,
                        image: event.target?.result as string,
                      }));
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="mt-2"
                rows={4}
                required
              />
            </div>
          </div>
        </form>
      </div>

      <div className="flex items-center justify-end gap-2 p-6 border-t border-border">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save Property</Button>
      </div>
    </div>
  );
};

export default PropertyForm;
