import { useState, useEffect } from "react";
import {
  FrontendVehicle,
  FrontendTransportStaff,
} from "@/integration/supabase/types";
import {
  useVehicles,
  useTransportStaff,
  useVehiclesByStatus,
} from "@/hooks/transport";
import { toast } from "@/components/ui/use-toast";
import { TransportStats } from "./TransportStats";
import { TransportList } from "./TransportList";
import { TransportDetail } from "./TransportDetail";
import { TransportForm } from "./TransportForm";
import { TransportBilling } from "./TransportBilling";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Transport() {
  // Fetch vehicles and staff using hooks
  const {
    vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
    refetch: refetchVehicles,
  } = useVehicles();
  const {
    staff,
    loading: staffLoading,
    error: staffError,
  } = useTransportStaff();

  const [selectedVehicle, setSelectedVehicle] =
    useState<FrontendVehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [editingVehicle, setEditingVehicle] = useState<FrontendVehicle | null>(
    null
  );

  // Handle errors
  useEffect(() => {
    if (vehiclesError) {
      console.error("Error fetching vehicles:", vehiclesError);
      toast({
        title: "Error",
        description: "Failed to load vehicles. Please try again.",
        variant: "destructive",
      });
    }

    if (staffError) {
      console.error("Error fetching staff:", staffError);
      toast({
        title: "Error",
        description:
          "Failed to load staff data. Some information may be incomplete.",
        variant: "destructive",
      });
    }
  }, [vehiclesError, staffError]);

  // Filter vehicles based on active tab
  const filteredVehiclesByTab = () => {
    if (!vehicles) return [];
    if (activeTab === "all") return vehicles;
    return vehicles.filter((vehicle) => vehicle.status === activeTab);
  };

  // Handle opening form for editing
  const handleEditVehicle = (vehicle: FrontendVehicle) => {
    setEditingVehicle(vehicle);
    setIsFormOpen(true);
  };

  // Handle form success (create or update)
  const handleFormSuccess = () => {
    refetchVehicles();
    setEditingVehicle(null);
  };

  return (
    <div className=" w-full h-full">
      <div className="p-6 space-y-4">
        <h1 className="text-4xl font-bold text-white">Transport</h1>
        <p className="text-white/60">
          Manage staff vehicles and transportation
        </p>

        {/* Stats always visible */}
        <TransportStats vehicles={vehicles || []} />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/40 border border-white/10 mb-4">
            <TabsTrigger value="all">All Vehicles</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="repair">Repair</TabsTrigger>
            <TabsTrigger value="retired">Retired</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
          </TabsList>
          <TabsContent
            value={activeTab}
            className="bg-black/40 border border-white/10 rounded-lg p-0"
          >
            {activeTab === "billing" ? (
              <div className="p-6">
                <TransportBilling />
              </div>
            ) : selectedVehicle ? (
              <div className="p-6">
                <TransportDetail
                  vehicle={selectedVehicle}
                  staff={staff?.find((s) => s.id === selectedVehicle.staffId)}
                  onBack={() => setSelectedVehicle(null)}
                />
              </div>
            ) : (
              <div className="p-6">
                <TransportList
                  onOpenForm={() => {
                    setEditingVehicle(null);
                    setIsFormOpen(true);
                  }}
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
          onSuccess={handleFormSuccess}
          editingVehicle={editingVehicle}
        />
      </div>
    </div>
  );
}
