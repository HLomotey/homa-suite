import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import OccupancyDashboard from "@/components/properties/Dashboard";
import { PropertiesList } from "@/components/properties/PropertiesList";
import { RoomsList } from "@/components/properties/RoomsList";
import { AssignmentsList } from "@/components/properties/AssignmentsList";
import { TenantsList } from "@/components/properties/TenantsList";
import { StaffTransactionLog } from "@/components/properties/StaffTransactionLog";
import PropertyForm from "@/components/properties/PropertyForm";
import TenantForm from "@/components/properties/TenantForm";
import { Inventory } from "@/components/inventory";
import { UtilitiesDashboard } from "@/components/utilities/UtilitiesDashboard";
import { FrontendProperty } from "@/integration/supabase/types";
import { FrontendTenant } from "@/integration/supabase/types/tenant";
import {
  useProperties,
  useCreateProperty,
  useUpdateProperty,
  useDeleteProperty,
} from "@/hooks/property/useProperty";
import { Loader2 } from "lucide-react";

// Main Housing Page Component
const HousingPage: React.FC = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<
    FrontendProperty | undefined
  >();
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    null
  );

  // Use the real property API hooks
  const { properties, loading, error, refetch } = useProperties();
  const { create: createPropertyApi, loading: createLoading } =
    useCreateProperty();
  const { update: updatePropertyApi, loading: updateLoading } =
    useUpdateProperty();
  const { deleteProperty, loading: deleteLoading } = useDeleteProperty();

  // Tenant form state
  const [isTenantFormOpen, setIsTenantFormOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<
    FrontendTenant | undefined
  >();

  const handleAddProperty = () => {
    setEditingProperty(undefined);
    setIsFormOpen(true);
  };

  const handleEditProperty = (property: FrontendProperty) => {
    setEditingProperty(property);
    setIsFormOpen(true);
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await deleteProperty(id);
      // Refetch properties to update the list
      refetch();
    } catch (error) {
      console.error("Error deleting property:", error);
    }
  };

  const handleSaveProperty = async (
    propertyData: Omit<FrontendProperty, "id" | "dateAdded">
  ) => {
    try {
      if (editingProperty) {
        // Update existing property
        await updatePropertyApi(editingProperty.id, propertyData);
      } else {
        // Add new property
        await createPropertyApi(propertyData);
      }
      // Refetch properties to update the list
      refetch();
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving property:", error);
    }
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

  const handleSaveTenant = (
    tenantData: Omit<FrontendTenant, "id" | "dateAdded">
  ) => {
    // Placeholder - will be connected to API later
    console.log("Save tenant:", tenantData);
    setIsTenantFormOpen(false);
  };

  return (
    <div className="h-full p-4 md:p-6">
      <h1 className="text-3xl font-bold text-white mb-6">Housing Management</h1>
      <p className="text-white/60 mb-8">
        Manage properties, rooms, and staff assignments
      </p>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="assignments">Assignments</TabsTrigger>
          <TabsTrigger value="staff-transactions">
            Staff Transactions
          </TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="utilities">Utilities</TabsTrigger>
          {/* <TabsTrigger value="tenants">Tenant Profiles</TabsTrigger> */}
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <OccupancyDashboard />
        </TabsContent>

        <TabsContent value="properties">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-white" />
              <span className="ml-2 text-white">Loading properties...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-400 mb-2">Error loading properties:</p>
                <p className="text-white/60 mb-4">{error.message}</p>
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          ) : (
            <PropertiesList
              properties={properties}
              onEdit={handleEditProperty}
              onDelete={handleDeleteProperty}
              onAddProperty={handleAddProperty}
              onSelect={(propertyId) => setSelectedPropertyId(propertyId)}
            />
          )}
        </TabsContent>

        <TabsContent value="rooms">
          <RoomsList />
        </TabsContent>

        <TabsContent value="assignments">
          <AssignmentsList />
        </TabsContent>

        <TabsContent value="staff-transactions">
          <StaffTransactionLog />
        </TabsContent>

        <TabsContent value="inventory">
          <Inventory propertyId={selectedPropertyId} />
        </TabsContent>

        <TabsContent value="utilities">
          <UtilitiesDashboard />
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
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-auto"
        >
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
