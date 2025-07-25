import { useState } from "react";
import { Vehicle, Staff, mockVehicles, mockStaff } from "./data";
import { TransportStats } from "./TransportStats";
import { TransportList } from "./TransportList";
import { TransportDetail } from "./TransportDetail";
import { TransportForm } from "./TransportForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Transport() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [staff] = useState<Staff[]>(mockStaff);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  // Filter vehicles based on active tab
  const filteredVehiclesByTab = () => {
    if (activeTab === "all") return vehicles;
    return vehicles.filter(vehicle => vehicle.status === activeTab);
  };

  // Handle adding a new vehicle
  const handleAddVehicle = (newVehicle: Omit<Vehicle, "id">) => {
    const vehicle: Vehicle = {
      ...newVehicle,
      id: (vehicles.length + 1).toString(),
    };
    setVehicles([...vehicles, vehicle]);
    setIsFormOpen(false);
  };

  return (
    <div className="w-full h-full">
      <div className="p-6 space-y-4">
        <h1 className="text-4xl font-bold text-white">Transport</h1>
        <p className="text-white/60">Manage staff vehicles and transportation</p>
      
        {/* Stats always visible */}
        <TransportStats vehicles={vehicles} />
      
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/40 border border-white/10 mb-4">
            <TabsTrigger value="all">All Vehicles</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="repair">Repair</TabsTrigger>
            <TabsTrigger value="retired">Retired</TabsTrigger>
          </TabsList>
          <TabsContent value={activeTab} className="bg-black/40 border border-white/10 rounded-lg p-0">
            {selectedVehicle ? (
              <div className="p-6">
                <TransportDetail 
                  vehicle={selectedVehicle} 
                  staff={staff.find(s => s.id === selectedVehicle.staffId) || mockStaff[0]} 
                  onBack={() => setSelectedVehicle(null)} 
                />
              </div>
            ) : (
              <div className="p-6">
                <TransportList 
                  vehicles={filteredVehiclesByTab()} 
                  staff={staff} 
                  onOpenForm={() => setIsFormOpen(true)} 
                  onSelectVehicle={setSelectedVehicle}
                  activeTab={activeTab}
                  onChangeTab={setActiveTab}
                />
              </div>
            )}
          </TabsContent>
        </Tabs>

        <TransportForm 
          open={isFormOpen} 
          onOpenChange={setIsFormOpen} 
          onSubmit={handleAddVehicle} 
          staff={staff} 
        />
      </div>
    </div>
  );
}
