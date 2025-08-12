import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVehicle } from "@/hooks/transport/useVehicle";
import { useMaintenanceType } from "@/hooks/transport/useMaintenanceType";
import { useMaintenanceTransaction } from "@/hooks/transport/useMaintenanceTransaction";
import VehicleList from "@/components/transport/VehicleList";
import MaintenanceTypeList from "@/components/transport/MaintenanceTypeList";
import MaintenanceTransactionList from "@/components/transport/MaintenanceTransactionList";
import { RouteManagement } from "@/components/transport/RouteManagement";
import { FrontendVehicle } from "@/integration/supabase/types/vehicle";
import { FrontendMaintenanceType } from "@/integration/supabase/types/maintenance-type";
import { FrontendMaintenanceTransaction } from "@/integration/supabase/types/maintenance-transaction";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Car, CheckCircle2, Clock, MapPin } from "lucide-react";
import { supabase } from "@/integration/supabase";

export default function TransportDashboard() {
  // Initialize hooks
  const {
    vehicles,
    loading: vehiclesLoading,
    error: vehiclesError,
    addVehicle,
    editVehicle,
    removeVehicle,
    setSelectedVehicle
  } = useVehicle();

  const {
    maintenanceTypes,
    loading: typesLoading,
    error: typesError,
    addMaintenanceType,
    editMaintenanceType,
    removeMaintenanceType,
    setSelectedMaintenanceType
  } = useMaintenanceType();

  const {
    transactions,
    loading: transactionsLoading,
    error: transactionsError,
    addTransaction,
    editTransaction,
    removeTransaction,
    setSelectedTransaction
  } = useMaintenanceTransaction();

  // Handle vehicle actions
  // Get the first available location for default vehicle creation
  const [defaultLocationId, setDefaultLocationId] = React.useState<string>("");

  // Fetch locations for default selection
  React.useEffect(() => {
    const fetchDefaultLocation = async () => {
      try {
        const { data } = await supabase
          .from('company_locations')
          .select('id')
          .limit(1)
          .single();
        
        if (data) {
          console.log('Found default location:', data.id);
          setDefaultLocationId(data.id);
        } else {
          console.log('No default location found');
        }
      } catch (err) {
        console.error('Error fetching default location:', err);
      }
    };
    
    fetchDefaultLocation();
  }, []);

  const handleAddVehicle = async (vehicleData: Omit<FrontendVehicle, "id">) => {
    try {
      // Check if we have a default location and the vehicle doesn't have one
      if (!vehicleData.locationId && !defaultLocationId) {
        toast({
          title: "Error",
          description: "No company location available. Please create a location first.",
          variant: "destructive",
        });
        return;
      }

      // Use the form data but ensure locationId is set
      const vehicleToAdd = {
        ...vehicleData,
        locationId: vehicleData.locationId || defaultLocationId
      };
      
      console.log('Adding vehicle with data:', vehicleToAdd);
      await addVehicle(vehicleToAdd);
      toast({
        title: "Success",
        description: "Vehicle added successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add vehicle",
        variant: "destructive",
      });
    }
  };

  const handleEditVehicle = async (vehicle: FrontendVehicle) => {
    try {
      await editVehicle(vehicle.id, vehicle);
      toast({
        title: "Success",
        description: "Vehicle updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update vehicle",
        variant: "destructive",
      });
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await removeVehicle(id);
      toast({
        title: "Success",
        description: "Vehicle deleted successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete vehicle",
        variant: "destructive",
      });
    }
  };

  const handleSelectVehicle = (vehicle: FrontendVehicle) => {
    setSelectedVehicle(vehicle);
  };

  // Handle maintenance type actions
  const handleAddMaintenanceType = async (maintenanceTypeData: Omit<FrontendMaintenanceType, "id">) => {
    try {
      console.log('Adding maintenance type with data:', maintenanceTypeData);
      await addMaintenanceType(maintenanceTypeData);
      toast({
        title: "Success",
        description: "Maintenance type added successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add maintenance type",
        variant: "destructive",
      });
    }
  };

  const handleEditMaintenanceType = async (maintenanceType: FrontendMaintenanceType) => {
    try {
      await editMaintenanceType(maintenanceType.id, maintenanceType);
      toast({
        title: "Success",
        description: "Maintenance type updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update maintenance type",
        variant: "destructive",
      });
    }
  };

  const handleDeleteMaintenanceType = async (id: string) => {
    try {
      await removeMaintenanceType(id);
      toast({
        title: "Success",
        description: "Maintenance type deleted successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete maintenance type",
        variant: "destructive",
      });
    }
  };

  const handleSelectMaintenanceType = (maintenanceType: FrontendMaintenanceType) => {
    setSelectedMaintenanceType(maintenanceType);
  };

  // Handle maintenance transaction actions
  const handleAddTransaction = async () => {
    try {
      if (vehicles.length === 0 || maintenanceTypes.length === 0) {
        toast({
          title: "Error",
          description: "You need at least one vehicle and maintenance type to add a transaction",
          variant: "destructive",
        });
        return;
      }

      await addTransaction({
        vehicleId: vehicles[0].id,
        maintenanceTypeId: maintenanceTypes[0].id,
        date: new Date().toISOString().split("T")[0],
        issue: "",
        amount: 0,
        notes: "",
        performedBy: "",
        status: "Scheduled",
        receiptUrl: null
      });
      toast({
        title: "Success",
        description: "Maintenance record added successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add maintenance record",
        variant: "destructive",
      });
    }
  };

  const handleEditTransaction = async (transaction: FrontendMaintenanceTransaction) => {
    try {
      const { id, vehicleInfo, maintenanceTypeName, ...rest } = transaction;
      await editTransaction(id, rest);
      toast({
        title: "Success",
        description: "Maintenance record updated successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update maintenance record",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await removeTransaction(id);
      toast({
        title: "Success",
        description: "Maintenance record deleted successfully",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete maintenance record",
        variant: "destructive",
      });
    }
  };

  const handleSelectTransaction = (transaction: FrontendMaintenanceTransaction) => {
    setSelectedTransaction(transaction);
  };

  // Calculate dashboard stats
  const activeVehicles = vehicles.filter(v => v.status === "Active").length;
  const inMaintenanceVehicles = vehicles.filter(v => v.status === "Maintenance").length;
  const scheduledMaintenance = transactions.filter(t => t.status === "Scheduled").length;
  const completedMaintenance = transactions.filter(t => t.status === "Completed").length;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-3xl font-bold">Transport Management</h1>
      
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.length > 0 ? Math.round((activeVehicles / vehicles.length) * 100) : 0}% of fleet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inMaintenanceVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.length > 0 ? Math.round((inMaintenanceVehicles / vehicles.length) * 100) : 0}% of fleet
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Maintenance</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduledMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              Upcoming maintenance tasks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Maintenance</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedMaintenance}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.length > 0 ? Math.round((completedMaintenance / transactions.length) * 100) : 0}% completion rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
            <p className="text-xs text-muted-foreground">
              Transport routes in progress
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
          <TabsTrigger value="maintenance-types">Maintenance Types</TabsTrigger>
          <TabsTrigger value="maintenance-records">Maintenance Records</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="vehicles" className="space-y-4">
          {vehiclesError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading vehicles: {vehiclesError}
            </div>
          )}
          
          {vehiclesLoading ? (
            <div className="text-center py-4">Loading vehicles...</div>
          ) : (
            <VehicleList
              vehicles={vehicles}
              onEdit={handleEditVehicle}
              onDelete={handleDeleteVehicle}
              onAdd={handleAddVehicle}
              onSelect={handleSelectVehicle}
            />
          )}
        </TabsContent>
        
        <TabsContent value="maintenance-types" className="space-y-4">
          {typesError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading maintenance types: {typesError}
            </div>
          )}
          
          {typesLoading ? (
            <div className="text-center py-4">Loading maintenance types...</div>
          ) : (
            <MaintenanceTypeList
              maintenanceTypes={maintenanceTypes}
              onEdit={handleEditMaintenanceType}
              onDelete={handleDeleteMaintenanceType}
              onAdd={handleAddMaintenanceType}
              onSelect={handleSelectMaintenanceType}
            />
          )}
        </TabsContent>
        
        <TabsContent value="maintenance-records" className="space-y-4">
          {transactionsError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              Error loading maintenance records: {transactionsError}
            </div>
          )}
          
          {transactionsLoading ? (
            <div className="text-center py-4">Loading maintenance records...</div>
          ) : (
            <MaintenanceTransactionList
              transactions={transactions}
              vehicles={vehicles}
              maintenanceTypes={maintenanceTypes}
              onEdit={handleEditTransaction}
              onDelete={handleDeleteTransaction}
              onAdd={handleAddTransaction}
              onSelect={handleSelectTransaction}
            />
          )}
        </TabsContent>
        
        <TabsContent value="routes" className="space-y-4">
          <RouteManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
