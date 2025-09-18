import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";

interface RouteSelectionHeaderProps {
  selectMode: boolean;
  selectedCount: number;
  totalRoutes: number;
  isSubmitting: boolean;
  onToggleSelectMode: () => void;
  onToggleSelectAll: () => void;
  onDeleteSelected: () => void;
  onAddRoute: () => void;
  allSelected: boolean;
}

export function RouteSelectionHeader({
  selectMode,
  selectedCount,
  totalRoutes,
  isSubmitting,
  onToggleSelectMode,
  onToggleSelectAll,
  onDeleteSelected,
  onAddRoute,
  allSelected,
}: RouteSelectionHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <Label>Routes</Label>
      <div className="flex items-center space-x-2">
        {totalRoutes > 0 && (
          <Button
            type="button"
            variant={selectMode ? "default" : "outline"}
            size="sm"
            onClick={onToggleSelectMode}
            disabled={isSubmitting}
          >
            {selectMode ? "Cancel" : "Select"}
          </Button>
        )}
        {selectMode && totalRoutes > 1 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToggleSelectAll}
            disabled={isSubmitting}
          >
            {allSelected ? "Deselect All" : "Select All"}
          </Button>
        )}
        {selectMode && selectedCount > 0 && (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDeleteSelected}
            disabled={isSubmitting}
          >
            Delete ({selectedCount})
          </Button>
        )}
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={onAddRoute}
          disabled={isSubmitting}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Route
        </Button>
      </div>
    </div>
  );
}
