import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/custom-ui";
import OccupancyDashboard from "@/components/properties/Dashboard";
import PropertiesList from "@/components/properties/PropertiesList";
import RoomsList from "@/components/properties/RoomsList";
import AssignmentsList from "@/components/properties/AssignmentsList";
import TenantsList from "@/components/properties/TenantsList";
import PropertyForm from "@/components/properties/PropertyForm";
import TenantForm from "@/components/properties/TenantForm";
import { mockProperties, Property } from "@/components/properties/data/housing-data";
import { FrontendTenant } from "@/integration/supabase/types/tenant";

// Main Housing Page Component
const HousingPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | undefined>();
  const [properties, setProperties] = useState<Property[]>(mockProperties);
  
  // Tenant form state
  const [isTenantFormOpen, setIsTenantFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<FrontendTenant | undefined>();

  const handleAddProperty = () => {
    setEditingProperty(undefined);
    setIsFormOpen(true);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDeleteProperty = (id: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSaveProperty = (propertyData: Omit<Property, "id">) => {
    if (editingProperty) {
      // Update existing property
      setProperties((prev) =>
        prev.map((p) =>
          p.id === editingProperty.id
            ? { ...propertyData, id: editingProperty.id }
            : p
        )
      );
    } else {
      // Add new property
      const newProperty = {
        ...propertyData,
        id: `${properties.length + 1}`,
      };
      setProperties((prev) => [...prev, newProperty]);
    }
    setIsFormOpen(false);
  };

  // Tenant handlers
  const handleAddTenant = () => {
    setEditingTenant(undefined);
    setIsTenantFormOpen(true);
  };

  const handleEditTenant = (tenant: FrontendTenant) => {
    setEditingTenant(tenant);
    setIsTenantFormOpen(true);
  };

  const handleDeleteTenant = (id: string) => {
    // Placeholder - will be connected to API later
    console.log("Delete tenant:", id);
  };

  const handleSaveTenant = (tenantData: Omit<FrontendTenant, "id" | "dateAdded">) => {
    // Placeholder - will be connected to API later
    console.log("Save tenant:", tenantData);
    setIsTenantFormOpen(false);
  };

  return (
    <div className="h-full p-4 md:p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Housing Management</h1>
      <p className="text-white/60 mb-8">Manage properties, rooms, and staff assignments</p>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="tenants">Tenant Profiles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <OccupancyDashboard />
        </TabsContent>
        
        <TabsContent value="properties">
          <PropertiesList 
            properties={properties}
            onEdit={handleEditProperty}
            onDelete={handleDeleteProperty}
            onAddProperty={handleAddProperty}
          />
        </TabsContent>
        
        <TabsContent value="rooms">
          <RoomsList />
        </TabsContent>
        
        <TabsContent value="assignments">
          <AssignmentsList />
        </TabsContent>
        
        <TabsContent value="tenants">
          <TenantsList 
            onEdit={handleEditTenant}
            onDelete={handleDeleteTenant}
            onAddTenant={handleAddTenant}
          />
        </TabsContent>
      </Tabs>

      {/* Property Form Sheet */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <PropertyForm
            property={editingProperty}
            onSave={handleSaveProperty}
            onCancel={() => setIsFormOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Tenant Form Sheet */}
      <Sheet open={isTenantFormOpen} onOpenChange={setIsTenantFormOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-auto">
          <TenantForm
            tenant={editingTenant}
            onSave={handleSaveTenant}
            onCancel={() => setIsTenantFormOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HousingPage;
