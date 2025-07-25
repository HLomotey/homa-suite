import { Vehicle } from "./data";
import { Car, Truck, Bus, Wrench } from "lucide-react";

interface TransportStatsProps {
  vehicles: Vehicle[];
}

export function TransportStats({ vehicles }: TransportStatsProps) {
  // Calculate stats
  const totalVehicles = vehicles.length;
  const activeVehicles = vehicles.filter(v => v.status === 'active').length;
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance' || v.status === 'repair').length;
  const vehicleTypes = {
    cars: vehicles.filter(v => v.type === 'car').length,
    trucks: vehicles.filter(v => v.type === 'truck').length,
    buses: vehicles.filter(v => v.type === 'bus').length,
    vans: vehicles.filter(v => v.type === 'van').length
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      {/* Total Vehicles */}
      <div className="bg-blue-950 border border-blue-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-300 text-sm">Total Vehicles</p>
            <p className="text-white text-3xl font-bold">{totalVehicles}</p>
            {totalVehicles > 0 && <p className="text-green-400 text-xs mt-1">+{Math.round(totalVehicles * 0.1)}% vs last month</p>}
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-blue-900/50 rounded-full">
            <Car className="h-5 w-5 text-blue-300" />
          </div>
        </div>
      </div>
      
      {/* Active */}
      <div className="bg-green-950 border border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-300 text-sm">Active</p>
            <p className="text-white text-3xl font-bold">{activeVehicles}</p>
            {activeVehicles > 0 && <p className="text-green-400 text-xs mt-1">+{Math.round(activeVehicles * 0.15)}% vs last month</p>}
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-green-900/50 rounded-full">
            <Car className="h-5 w-5 text-green-300" />
          </div>
        </div>
      </div>
      
      {/* Maintenance */}
      <div className="bg-amber-950 border border-amber-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-amber-300 text-sm">Maintenance</p>
            <p className="text-white text-3xl font-bold">{maintenanceVehicles}</p>
            {maintenanceVehicles > 0 && <p className="text-red-400 text-xs mt-1">-{Math.round(maintenanceVehicles * 0.1)}% vs last month</p>}
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-amber-900/50 rounded-full">
            <Wrench className="h-5 w-5 text-amber-300" />
          </div>
        </div>
      </div>
      
      {/* Vehicle Types */}
      <div className="bg-purple-950 border border-purple-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-300 text-sm">Vehicle Types</p>
            <p className="text-white text-3xl font-bold">{Object.values(vehicleTypes).filter(count => count > 0).length}</p>
            <div className="flex gap-2 mt-1">
              {vehicleTypes.cars > 0 && <span className="text-purple-300 text-xs">Cars: {vehicleTypes.cars}</span>}
              {vehicleTypes.trucks > 0 && <span className="text-purple-300 text-xs">Trucks: {vehicleTypes.trucks}</span>}
            </div>
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-purple-900/50 rounded-full">
            <Truck className="h-5 w-5 text-purple-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
