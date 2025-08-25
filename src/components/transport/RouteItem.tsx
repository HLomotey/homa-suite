import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Trash, Route as RouteIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface RouteItemProps {
  route: {
    id: string;
    routeId: string;
    order: number;
    name?: string;
  };
  index: number;
  selectMode: boolean;
  isSelected: boolean;
  isSubmitting: boolean;
  onSelect: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onDelete: (index: number) => void;
  onRouteChange: (index: number, routeId: string) => void;
  routes: Array<{ id: string; name: string }>;
  isFirst: boolean;
  isLast: boolean;
}

export function RouteItem({
  route,
  index,
  selectMode,
  isSelected,
  isSubmitting,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
  onRouteChange,
  routes,
  isFirst,
  isLast,
}: RouteItemProps) {
  const selectedRoute = routes.find(r => r.id === route.routeId);

  return (
    <div 
      className={cn(
        "space-y-2 p-4 border rounded-md transition-colors",
        selectMode && "cursor-pointer",
        selectMode && isSelected && "border-destructive bg-destructive/5"
      )}
      onClick={() => selectMode && onSelect(route.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {selectMode && (
            <Checkbox 
              checked={isSelected}
              onCheckedChange={() => onSelect(route.id)}
              className="data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
              onClick={(e) => e.stopPropagation()}
            />
          )}
          <h4 className="font-medium">Route {index + 1}</h4>
        </div>
        <div className="flex items-center space-x-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMoveUp(index);
            }}
            disabled={isSubmitting || isFirst}
          >
            <ArrowUpDown className="h-4 w-4 rotate-90" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onMoveDown(index);
            }}
            disabled={isSubmitting || isLast}
          >
            <ArrowUpDown className="h-4 w-4 -rotate-90" />
          </Button>
          {!selectMode && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(index);
              }}
              disabled={isSubmitting}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <RouteIcon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm">{selectedRoute?.name || "Unknown Route"}</span>
      </div>
    </div>
  );
}
