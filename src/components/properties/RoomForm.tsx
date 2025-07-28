import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { FrontendRoom, RoomStatus, RoomType } from "@/integration/supabase/types";
import { SheetTitle, SheetDescription } from "@/components/ui/sheet";

// Room Form Component
export interface RoomFormProps {
  room?: FrontendRoom;
  onSave: (room: Omit<FrontendRoom, "id">) => void;
  onCancel: () => void;
  properties: { id: string; title: string }[];
}

export const RoomForm: React.FC<RoomFormProps> = ({
  room,
  onSave,
  onCancel,
  properties,
}) => {
  // Debug properties data
  React.useEffect(() => {
    console.log("RoomForm - Properties received:", properties);
    console.log("RoomForm - Properties length:", properties?.length || 0);
    console.log("RoomForm - Properties array is array?", Array.isArray(properties));
    if (properties && properties.length > 0) {
      console.log("RoomForm - First property:", properties[0]);
    }
  }, [properties]);

  const [formData, setFormData] = React.useState<Omit<FrontendRoom, "id">>({
    name: room?.name || "",
    propertyId: room?.propertyId || (properties[0]?.id || ""),
    propertyName: room?.propertyName || (properties[0]?.title || ""),
    type: room?.type || "Single",
    status: room?.status || "Available",
    area: room?.area || 0,
    occupants: room?.occupants || 0,
    maxOccupants: room?.maxOccupants || 1,
    price: room?.price || 0,
    dateAvailable: room?.dateAvailable || new Date().toISOString().split("T")[0],
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    
    if (name === "propertyId") {
      const selectedProperty = properties.find(p => p.id === value);
      setFormData(prev => ({
        ...prev,
        propertyId: value,
        propertyName: selectedProperty?.title || "",
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]:
          name === "price" || name === "area" || name === "occupants" || name === "maxOccupants"
            ? Number(value)
            : value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-6 border-b border-border">
        <div>
          <SheetTitle className="text-lg font-semibold">
            {room ? "Edit Room" : "Add New Room"}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {room ? "Update the details for this room." : "Fill in the details to create a new room."}
          </SheetDescription>
        </div>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Room Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="mt-2"
                required
              />
            </div>

            <div>
              <label
                htmlFor="propertyId"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Property
              </label>
              <select
                id="propertyId"
                name="propertyId"
                value={formData.propertyId}
                onChange={handleChange}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                required
              >
                {properties && properties.length > 0 ? (
                  properties.map(property => (
                    <option key={property.id} value={property.id}>
                      {property.title}
                    </option>
                  ))
                ) : (
                  <option value="">No properties available</option>
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="type"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Room Type
                </label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                >
                  {(['Single', 'Double', 'Suite', 'Studio'] as RoomType[]).map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
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
                  {(['Available', 'Occupied', 'Maintenance', 'Reserved'] as RoomStatus[]).map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="occupants"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Current Occupants
                </label>
                <Input
                  id="occupants"
                  name="occupants"
                  type="number"
                  value={formData.occupants}
                  onChange={handleChange}
                  className="mt-2"
                  min={0}
                  max={formData.maxOccupants}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="maxOccupants"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Maximum Occupants
                </label>
                <Input
                  id="maxOccupants"
                  name="maxOccupants"
                  type="number"
                  value={formData.maxOccupants}
                  onChange={handleChange}
                  className="mt-2"
                  min={1}
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="dateAvailable"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Date Available
              </label>
              <Input
                id="dateAvailable"
                name="dateAvailable"
                type="date"
                value={formData.dateAvailable}
                onChange={handleChange}
                className="mt-2"
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
        <Button onClick={handleSubmit}>Save Room</Button>
      </div>
    </div>
  );
};

export default RoomForm;
