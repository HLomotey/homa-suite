import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useStaffLocation from "@/hooks/transport/useStaffLocation";

interface StaffLocationSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
}

export const StaffLocationSelect = React.memo(({
  value,
  onValueChange
}: StaffLocationSelectProps) => {
  // Use the hook directly like property form does
  const { staffLocations, loading: locationsLoading } = useStaffLocation();

  return (
    <div>
      <label
        htmlFor="staffLocationId"
        className="block text-sm font-medium text-gray-700"
      >
        Staff Location
      </label>
      <Select
        value={value || undefined}
        onValueChange={(selectedValue) => onValueChange?.(selectedValue || "")}
      >
        <SelectTrigger className="w-full mt-2 h-10">
          <SelectValue placeholder="Select staff location..." />
        </SelectTrigger>
        <SelectContent>
          {locationsLoading ? (
            <SelectItem value="loading" disabled>Loading locations...</SelectItem>
          ) : staffLocations && staffLocations.length > 0 ? (
            staffLocations.map((location) => (
              <SelectItem key={location.id} value={location.id}>
                {location.locationCode} - {location.locationDescription}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="none" disabled>No locations available</SelectItem>
          )}
        </SelectContent>
      </Select>
      {locationsLoading && <p className="text-xs text-muted-foreground mt-1">Loading locations...</p>}
    </div>
  );
});

StaffLocationSelect.displayName = "StaffLocationSelect";
