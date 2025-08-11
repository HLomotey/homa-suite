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
import { Trash2, Plus, ArrowUpDown, Route } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { useRoute } from "@/hooks/transport/useRoute";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/auth";

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
  const { routes } = useRoute();
  const { user } = useAuth();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [selectedRoutes, setSelectedRoutes] = useState<Array<{
    id: string;
    routeId: string;
    routeName: string;
    order: number;
  }>>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    
    const nextOrder = selectedRoutes.length > 0 
      ? Math.max(...selectedRoutes.map(r => r.order)) + 1 
      : 1;
    
    setSelectedRoutes([
      ...selectedRoutes, 
      {
        id: `temp-${Date.now()}`,
        routeId: availableRoutes[0].id,
        routeName: availableRoutes[0].name,
        order: nextOrder
      }
    ]);
  };

  const handleRemoveRoute = (index: number) => {
    const newRoutes = [...selectedRoutes];
    newRoutes.splice(index, 1);
    
    // Reorder remaining routes
    const reorderedRoutes = newRoutes.map((route, idx) => ({
      ...route,
      order: idx + 1
    }));
    
    setSelectedRoutes(reorderedRoutes);
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
      // In a real implementation, this would call the API
      // For now, we just simulate success
      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast({
        title: "Success",
        description: editingCombinedRoute 
          ? "Combined route updated successfully" 
          : "Combined route created successfully",
      });
      
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error("Error submitting combined route:", error);
      toast({
        title: "Error",
        description: editingCombinedRoute 
          ? "Failed to update combined route" 
          : "Failed to create combined route",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
            <div className="flex items-center justify-between">
              <Label>Routes</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleAddRoute}
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Route
              </Button>
            </div>
            
            {selectedRoutes.length === 0 && (
              <div className="text-center p-4 border border-dashed rounded-md">
                <Route className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  No routes added yet. Click "Add Route" to start building your combined route.
                </p>
              </div>
            )}
            
            {selectedRoutes.map((route, index) => (
              <div key={route.id} className="space-y-2 p-4 border rounded-md">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Route {index + 1}</h4>
                  <div className="flex items-center space-x-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveUp(index)}
                      disabled={isSubmitting || index === 0}
                    >
                      <ArrowUpDown className="h-4 w-4 rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMoveDown(index)}
                      disabled={isSubmitting || index === selectedRoutes.length - 1}
                    >
                      <ArrowUpDown className="h-4 w-4 -rotate-90" />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveRoute(index)}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`route-${index}`}>Select Route</Label>
                  <Select
                    value={route.routeId}
                    onValueChange={(value) => handleRouteChange(index, value)}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id={`route-${index}`}>
                      <SelectValue placeholder="Select a route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routes.map((r) => (
                        <SelectItem 
                          key={r.id} 
                          value={r.id}
                          disabled={selectedRoutes.some(
                            selected => selected.routeId === r.id && selected.id !== route.id
                          )}
                        >
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
  );
}
