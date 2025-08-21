import * as React from "react";
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  FrontendCombinedRoute, 
  FrontendRoute 
} from "@/integration/supabase/types/transport-route";
import { Plus, Route as RouteIcon, ArrowUpDown, Trash2, X } from "lucide-react";
import { RouteItem } from "./RouteItem";
import { RouteSelectionHeader } from "./RouteSelectionHeader";
import { toast } from "@/components/ui/use-toast";
import { useRoute } from "@/hooks/transport/useRoute";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useAuth } from "@/components/auth";
import { supabase } from "@/integration/supabase/client"; // Import Supabase client

interface CombinedRouteFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingCombinedRoute?: FrontendCombinedRoute | null;
}

export function CombinedRouteForm({ 
  open, 
  onOpenChange, 
  onSuccess, 
  editingCombinedRoute 
}: CombinedRouteFormProps) {
  const { routes, loading, error, fetchAllRoutes } = useRoute(false); // false to use real data from database
  const { user } = useAuth();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoutes, setSelectedRoutes] = useState<Array<{
    id: string;
    routeId: string;
    routeName: string;
    order: number;
  }>>([]);
  const [selectedForDeletion, setSelectedForDeletion] = useState<string[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routeFormOpen, setRouteFormOpen] = useState(false);
  const [currentRouteIndex, setCurrentRouteIndex] = useState<number | null>(null);

  // Fetch routes when component mounts
  useEffect(() => {
    fetchAllRoutes();
  }, [fetchAllRoutes]);

  // Reset form when opened or when editing route changes
  useEffect(() => {
    if (open) {
      if (editingCombinedRoute) {
        setName(editingCombinedRoute.name);
        setDescription(editingCombinedRoute.description);
        setStatus(editingCombinedRoute.status);
        setSelectedRoutes(
          editingCombinedRoute.routes.map((route) => ({
            id: route.id,
            routeId: route.routeId,
            routeName: route.routeName,
            order: route.order,
          }))
        );
      } else {
        setName("");
        setDescription("");
        setStatus("active");
        setSelectedRoutes([]);
      }
    }
  }, [open, editingCombinedRoute]);

  const handleAddRoute = () => {
    if (routes.length === 0) {
      toast({
        title: "No Routes Available",
        description: "Please create some routes first",
        variant: "destructive",
      });
      return;
    }
    
    // Find routes that haven't been selected yet
    const availableRoutes = routes.filter(
      route => !selectedRoutes.some(selected => selected.routeId === route.id)
    );
    
    if (availableRoutes.length === 0) {
      toast({
        title: "All Routes Selected",
        description: "All available routes have been added to this combined route",
        variant: "destructive",
      });
      return;
    }
    
    // Open the RouteForm dialog for selecting a route
    setCurrentRouteIndex(null); // Indicates we're adding a new route
    setRouteFormOpen(true);
  };
  
  const handleEditRoute = (index: number) => {
    setCurrentRouteIndex(index);
    setRouteFormOpen(true);
  };
  
  const handleRouteFormSuccess = (selectedRoute: FrontendRoute) => {
    const nextOrder = selectedRoutes.length > 0 
      ? Math.max(...selectedRoutes.map(r => r.order)) + 1 
      : 1;
    
    if (currentRouteIndex !== null) {
      // Editing an existing route
      const newRoutes = [...selectedRoutes];
      newRoutes[currentRouteIndex] = {
        ...newRoutes[currentRouteIndex],
        routeId: selectedRoute.id,
        routeName: selectedRoute.name
      };
      setSelectedRoutes(newRoutes);
    } else {
      // Adding a new route
      setSelectedRoutes([
        ...selectedRoutes, 
        {
          id: `temp-${Date.now()}`,
          routeId: selectedRoute.id,
          routeName: selectedRoute.name,
          order: nextOrder
        }
      ]);
    }
    
    setRouteFormOpen(false);
  };

  const handleRemoveRoute = (index: number) => {
    setSelectedRoutes(prev => prev.filter((_, i) => i !== index));
  };

  const toggleSelectMode = () => {
    setSelectMode(prev => !prev);
    setSelectedForDeletion([]);
  };

  const toggleRouteSelection = (id: string) => {
    setSelectedForDeletion(prev => 
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedForDeletion.length === selectedRoutes.length) {
      // If all are selected, deselect all
      setSelectedForDeletion([]);
    } else {
      // Otherwise, select all
      setSelectedForDeletion(selectedRoutes.map(route => route.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedForDeletion.length === 0) return;
    
    setSelectedRoutes(prev => 
      prev.filter((route) => !selectedForDeletion.includes(route.id))
    );
    
    toast({
      title: "Routes Removed",
      description: `${selectedForDeletion.length} route${selectedForDeletion.length > 1 ? 's' : ''} removed from combined route`,
    });
    
    setSelectedForDeletion([]);
    setSelectMode(false);
  };

  const handleRouteChange = (index: number, routeId: string) => {
    const selectedRoute = routes.find(r => r.id === routeId);
    if (!selectedRoute) return;
    
    const newRoutes = [...selectedRoutes];
    newRoutes[index] = { 
      ...newRoutes[index], 
      routeId, 
      routeName: selectedRoute.name 
    };
    
    setSelectedRoutes(newRoutes);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    
    const newRoutes = [...selectedRoutes];
    const temp = newRoutes[index - 1];
    newRoutes[index - 1] = { ...newRoutes[index], order: index };
    newRoutes[index] = { ...temp, order: index + 1 };
    
    setSelectedRoutes(newRoutes);
  };

  const handleMoveDown = (index: number) => {
    if (index === selectedRoutes.length - 1) return;
    
    const newRoutes = [...selectedRoutes];
    const temp = newRoutes[index + 1];
    newRoutes[index + 1] = { ...newRoutes[index], order: index + 2 };
    newRoutes[index] = { ...temp, order: index + 1 };
    
    setSelectedRoutes(newRoutes);
  };

  // CRUD helper functions
  async function createCombinedRoute(data: {
    name: string;
    description: string;
    status: "active" | "inactive";
    routes: Array<{ routeId: string; order: number }>;
  }) {
    // Check if user is authenticated
    if (!user || !user.id) {
      throw new Error("User not authenticated");
    }
    
    // Insert combined route
    const { data: combinedRoute, error } = await supabase
      .from("combined_routes")
      .insert([
        {
          name: data.name,
          description: data.description,
          status: data.status,
          created_by: user.id
        },
      ])
      .select("*")
      .single();

    if (error || !combinedRoute) throw error || new Error("Failed to create combined route");

    // Insert combined route details
    const detailsToInsert = data.routes.map((r) => ({
      combined_route_id: combinedRoute.id,
      route_id: r.routeId,
      order: r.order,
    }));

    const { error: detailsError } = await supabase
      .from("combined_route_details")
      .insert(detailsToInsert);

    if (detailsError) throw detailsError;

    return combinedRoute;
  }

  async function updateCombinedRoute(id: string, data: {
    name: string;
    description: string;
    status: "active" | "inactive";
    routes: Array<{ routeId: string; order: number }>;
  }) {
    // Update combined route
    const { error } = await supabase
      .from("combined_routes")
      .update({
        name: data.name,
        description: data.description,
        status: data.status,
      })
      .eq("id", id);

    if (error) throw error;

    // Remove existing details
    await supabase
      .from("combined_route_details")
      .delete()
      .eq("combined_route_id", id);

    // Insert new details
    const detailsToInsert = data.routes.map((r) => ({
      combined_route_id: id,
      route_id: r.routeId,
      order: r.order,
    }));

    const { error: detailsError } = await supabase
      .from("combined_route_details")
      .insert(detailsToInsert);

    if (detailsError) throw detailsError;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Combined route name is required",
        variant: "destructive",
      });
      return;
    }

    if (selectedRoutes.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one route is required",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingCombinedRoute) {
        await updateCombinedRoute(editingCombinedRoute.id, {
          name,
          description,
          status,
          routes: selectedRoutes.map(r => ({
            routeId: r.routeId,
            order: r.order,
          })),
        });
      } else {
        await createCombinedRoute({
          name,
          description,
          status,
          routes: selectedRoutes.map(r => ({
            routeId: r.routeId,
            order: r.order,
          })),
        });
      }

      toast({
        title: "Success",
        description: editingCombinedRoute 
          ? "Combined route updated successfully" 
          : "Combined route created successfully",
      });

      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Error submitting combined route:", errorMessage);
      toast({
        title: "Error",
        description: editingCombinedRoute 
          ? `Failed to update combined route: ${errorMessage}`
          : `Failed to create combined route: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-md md:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {editingCombinedRoute ? "Edit Combined Route" : "Create Combined Route"}
            </SheetTitle>
          </SheetHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Route Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning School Route"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Combined route description"
                disabled={isSubmitting}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="status"
                checked={status === "active"}
                onCheckedChange={(checked) => setStatus(checked ? "active" : "inactive")}
                disabled={isSubmitting}
              />
              <Label htmlFor="status">Active</Label>
              <Badge variant={status === "active" ? "default" : "secondary"}>
                {status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
            
            <div className="space-y-4">
              <RouteSelectionHeader
                selectMode={selectMode}
                selectedCount={selectedForDeletion.length}
                totalRoutes={selectedRoutes.length}
                isSubmitting={isSubmitting}
                onToggleSelectMode={toggleSelectMode}
                onToggleSelectAll={toggleSelectAll}
                onDeleteSelected={handleDeleteSelected}
                onAddRoute={handleAddRoute}
                allSelected={selectedForDeletion.length === selectedRoutes.length}
              />
              
              {selectedRoutes.length === 0 && (
                <div className="text-center p-4 border border-dashed rounded-md">
                  <RouteIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No routes added yet. Click "Add Route" to start building your combined route.
                  </p>
                </div>
              )}
              
              {selectedRoutes.map((route, index) => (
                <RouteItem
                  key={route.id}
                  route={route}
                  index={index}
                  selectMode={selectMode}
                  isSelected={selectedForDeletion.includes(route.id)}
                  isSubmitting={isSubmitting}
                  onSelect={toggleRouteSelection}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                  onDelete={handleRemoveRoute}
                  onRouteChange={handleEditRoute}
                  routes={routes}
                  isFirst={index === 0}
                  isLast={index === selectedRoutes.length - 1}
                />
              ))}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting 
                  ? "Saving..." 
                  : editingCombinedRoute 
                    ? "Update Combined Route" 
                    : "Create Combined Route"
                }
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      {/* Route Selection Dialog */}
      <Dialog open={routeFormOpen} onOpenChange={setRouteFormOpen}>
        <DialogContent 
          className="sm:max-w-md md:max-w-lg lg:max-w-2xl"
        >
          <DialogHeader>
            <DialogTitle>{currentRouteIndex !== null ? "Change Route" : "Select Route"}</DialogTitle>
            <DialogDescription id="route-dialog-description">
              Choose routes to include in this combined route.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 p-2">
            {/* Search input */}
            <div className="relative">
              <Input
                placeholder="Search routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setSearchTerm("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {/* Route selection UI */}
            <div className="space-y-4 p-2">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
                  <p className="mt-4 text-sm text-muted-foreground">Loading routes...</p>
                </div>
              ) : error ? (
                <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10">
                  <p className="text-destructive">Error loading routes: {error}</p>
                  <Button 
                    variant="outline" 
                    className="mt-2" 
                    onClick={() => fetchAllRoutes()}
                  >
                    Retry
                  </Button>
                </div>
              ) : routes.length === 0 ? (
                <div className="p-4 border rounded-md">
                  <p className="text-muted-foreground">No routes available. Please create routes first.</p>
                </div>
              ) : routes.filter(route => 
                searchTerm ? route.name.toLowerCase().includes(searchTerm.toLowerCase()) : true
              ).map((route) => {
                const isSelected = selectedRoutes.some(r => r.routeId === route.id);
                const isDisabled = isSelected && (currentRouteIndex === null || 
                  selectedRoutes[currentRouteIndex]?.routeId !== route.id);
                
                return (
                  <div 
                    key={route.id}
                    className={`p-4 border rounded-md cursor-pointer transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : 
                      isSelected && currentRouteIndex !== null && selectedRoutes[currentRouteIndex]?.routeId === route.id ? 
                      'border-primary bg-primary/10' : 'hover:border-primary/50'}`}
                    onClick={() => {
                      if (!isDisabled) {
                        handleRouteFormSuccess(route);
                      }
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium text-lg">{route.name}</h3>
                      {isSelected && (
                        <Badge variant="outline" className="ml-2">
                          {isDisabled ? "Already Selected" : "Current"}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{route.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}