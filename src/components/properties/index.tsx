import React, { useState } from "react";
import { OccupancyDashboard } from "./Dashboard";
import { PropertiesList } from "./PropertiesList";
import { PropertyForm } from "./PropertyForm";
import { AddPropertyDialog } from "./AddPropertyDialog";
import { useProperties, useCreateProperty, useUpdateProperty, useDeleteProperty } from "../../hooks/property";
import { FrontendProperty } from "../../integration/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Inventory } from "../inventory";

export default function Properties() {
  // Hooks for property data and operations
  const { properties, loading, error, refetch } = useProperties();
  const { create } = useCreateProperty();
  const { update } = useUpdateProperty();
  const { deleteProperty } = useDeleteProperty();
  const { toast } = useToast();

  // State for property form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProperty, setCurrentProperty] = useState<FrontendProperty | null>(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(null);

  // Handle property operations
  const handleAddProperty = () => {
    setCurrentProperty(null);
    setIsAddDialogOpen(true);
  };

  const handleEditProperty = (property: FrontendProperty) => {
    setCurrentProperty(property);
    setSelectedPropertyId(property.id);
    setIsEditDialogOpen(true);
  };

  const handleDeleteProperty = async (id: string) => {
    try {
      await deleteProperty(id);
      toast({
        title: "Property deleted",
        description: "The property has been deleted successfully.",
      });
      refetch(); // Refresh the properties list
    } catch (error) {
      console.error("Error deleting property:", error);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCreateProperty = async (propertyData: Omit<FrontendProperty, "id" | "dateAdded">) => {
    try {
      await create(propertyData);
      setIsAddDialogOpen(false);
      toast({
        title: "Property created",
        description: "The property has been created successfully.",
      });
      refetch(); // Refresh the properties list
    } catch (error) {
      console.error("Error creating property:", error);
      toast({
        title: "Error",
        description: "Failed to create property. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateProperty = async (id: string, propertyData: Partial<Omit<FrontendProperty, "id" | "dateAdded">>) => {
    try {
      await update(id, propertyData);
      setIsEditDialogOpen(false);
      toast({
        title: "Property updated",
        description: "The property has been updated successfully.",
      });
      refetch(); // Refresh the properties list
    } catch (error) {
      console.error("Error updating property:", error);
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <Tabs defaultValue="properties" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
        </TabsList>
        
        <TabsContent value="properties" className="space-y-6">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-white/60">Loading properties...</p>
            </div>
          ) : error ? (
            <div className="flex justify-center items-center h-64">
              <p className="text-red-500">Error loading properties: {error.message}</p>
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
        
        <TabsContent value="dashboard">
          <OccupancyDashboard />
        </TabsContent>

        <TabsContent value="inventory">
          <Inventory />
        </TabsContent>
      </Tabs>

      {/* Add Property Dialog */}
      <AddPropertyDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onSubmit={handleCreateProperty}
      />

      {/* Edit Property Dialog */}
      {currentProperty && (
        <AddPropertyDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          property={currentProperty}
          onSubmit={(data) => handleUpdateProperty(currentProperty.id, data)}
        />
      )}
    </div>
  );
}
