import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Percent, Building, DoorOpen, Users, Loader2 } from "lucide-react";
import { useProperties } from "@/hooks/property/useProperty";
import { useRooms } from "@/hooks/room/useRoom";
import { RoomStatus } from "@/integration/supabase/types/room";
import OccupancyTrendChart from "./charts/OccupancyTrendChart";
import AvailableRoomsChart from "./charts/AvailableRoomsChart";
import PropertyBreakdownChart from "./charts/PropertyBreakdownChart";
import StatusDistributionChart from "./charts/StatusDistributionChart";
import { format, subDays } from "date-fns";

// Occupancy Dashboard Component
export const OccupancyDashboard = () => {
  // Fetch properties and rooms data
  const { properties, loading: propertiesLoading, error: propertiesError } = useProperties();
  const { rooms, loading: roomsLoading, error: roomsError } = useRooms();

  // Calculate dashboard metrics and chart data
  const { dashboardMetrics, chartData } = useMemo(() => {
    if (propertiesLoading || roomsLoading) {
      return {
        dashboardMetrics: {
          totalProperties: 0,
          totalRooms: 0,
          occupiedRooms: 0,
          occupancyRate: 0,
          // Default to neutral trends when loading
          propertyTrend: { value: "0%", direction: "up" as "up" | "down", period: "vs last month" },
          roomsTrend: { value: "0%", direction: "up" as "up" | "down", period: "vs last month" },
          occupiedTrend: { value: "0%", direction: "up" as "up" | "down", period: "vs last month" },
          rateTrend: { value: "0%", direction: "up" as "up" | "down", period: "vs last month" }
        },
        chartData: {
          occupancyTrend: [],
          availableRooms: [],
          propertyBreakdown: [],
          statusDistribution: []
        }
      };
    }

    // Count total properties
    const totalProperties = properties.length;
    
    // Count total rooms
    const totalRooms = rooms.length;
    
    // Count occupied rooms (rooms with status 'Occupied')
    const occupiedRooms = rooms.filter(room => room.status === 'Occupied').length;
    
    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

    // For now, we'll use placeholder trends until we implement historical data tracking
    // In a real implementation, these would be calculated by comparing current vs previous period
    const propertyTrend = { value: "+15%", direction: "up" as "up" | "down", period: "vs last month" };
    const roomsTrend = { value: "+5%", direction: "up" as "up" | "down", period: "vs last month" };
    const occupiedTrend = { value: "-1%", direction: "down" as "up" | "down", period: "vs last month" };
    const rateTrend = { value: "-1%", direction: "down" as "up" | "down", period: "vs last month" };

    // Generate historical data for charts (last 30 days)
    const occupancyTrendData = Array.from({ length: 30 }, (_, i) => {
      // Generate a realistic occupancy trend with some variation
      const date = format(subDays(new Date(), 29 - i), 'MMM dd');
      const baseRate = 85; // Base occupancy rate
      const variation = Math.sin(i / 5) * 10; // Create a wave pattern
      const randomFactor = Math.random() * 5; // Add some randomness
      const occupancyRate = Math.min(100, Math.max(60, Math.round(baseRate + variation + randomFactor)));
      
      return {
        date,
        occupancyRate
      };
    });

    // Generate available rooms data
    const availableRoomsData = occupancyTrendData.map(item => {
      const availableRooms = Math.round(totalRooms * (1 - (item.occupancyRate / 100)));
      return {
        date: item.date,
        availableRooms,
        totalRooms
      };
    });

    // Generate property breakdown data
    const propertyBreakdownData = properties.map(property => {
      // Get rooms for this property
      const propertyRooms = rooms.filter(room => room.propertyId === property.id);
      const propertyTotalRooms = propertyRooms.length;
      const propertyOccupiedRooms = propertyRooms.filter(room => room.status === 'Occupied').length;
      const propertyOccupancyRate = propertyTotalRooms > 0 ? 
        Math.round((propertyOccupiedRooms / propertyTotalRooms) * 100) : 0;
      
      return {
        propertyName: property.title,
        totalRooms: propertyTotalRooms,
        occupiedRooms: propertyOccupiedRooms,
        occupancyRate: propertyOccupancyRate
      };
    });

    // Generate status distribution data
    const statusCounts = rooms.reduce((acc, room) => {
      acc[room.status] = (acc[room.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusColors = {
      'Occupied': '#8884d8',
      'Available': '#4ade80',
      'Maintenance': '#f97316',
      'Reserved': '#facc15',
      'Unavailable': '#ef4444'
    };

    const statusDistributionData = Object.entries(statusCounts).map(([status, value]) => ({
      status,
      value,
      color: statusColors[status as keyof typeof statusColors] || '#94a3b8'
    }));

    return {
      dashboardMetrics: {
        totalProperties,
        totalRooms,
        occupiedRooms,
        occupancyRate,
        propertyTrend,
        roomsTrend,
        occupiedTrend,
        rateTrend
      },
      chartData: {
        occupancyTrend: occupancyTrendData,
        availableRooms: availableRoomsData,
        propertyBreakdown: propertyBreakdownData,
        statusDistribution: statusDistributionData
      }
    };
  }, [properties, rooms, propertiesLoading, roomsLoading]);

  // Handle loading state
  const isLoading = propertiesLoading || roomsLoading;
  
  // Handle error state
  const hasError = propertiesError || roomsError;
  const errorMessage = propertiesError?.message || roomsError?.message;

  if (hasError) {
    return (
      <div className="w-full p-8 text-center">
        <h2 className="text-xl text-red-500 mb-2">Error loading dashboard data</h2>
        <p className="text-white/60">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Occupancy Dashboard</h2>
          <p className="text-white/60">Real-time housing occupancy metrics and analytics</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span>Jan 25 - Jul 25, 2025</span>
          </div>
          <button className="bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1 rounded-md text-sm">
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Total Properties" 
          value={isLoading ? "--" : dashboardMetrics.totalProperties.toString()} 
          trend={dashboardMetrics.propertyTrend}
          icon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Building className="h-5 w-5" />}
          color="blue"
          isLoading={isLoading}
        />
        <StatsCard 
          title="Total Rooms" 
          value={isLoading ? "--" : dashboardMetrics.totalRooms.toString()} 
          trend={dashboardMetrics.roomsTrend}
          icon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <DoorOpen className="h-5 w-5" />}
          color="green"
          isLoading={isLoading}
        />
        <StatsCard 
          title="Occupied Rooms" 
          value={isLoading ? "--" : dashboardMetrics.occupiedRooms.toString()} 
          trend={dashboardMetrics.occupiedTrend}
          icon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Users className="h-5 w-5" />}
          color="amber"
          isLoading={isLoading}
        />
        <StatsCard 
          title="Occupancy Rate" 
          value={isLoading ? "--" : `${dashboardMetrics.occupancyRate}%`} 
          trend={dashboardMetrics.rateTrend}
          icon={isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Percent className="h-5 w-5" />}
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="occupancy-trends" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="occupancy-trends">Occupancy Trends</TabsTrigger>
          <TabsTrigger value="property-breakdown">Property Breakdown</TabsTrigger>
          <TabsTrigger value="status-distribution">Status Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="occupancy-trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Occupancy Trend</CardTitle>
                <p className="text-sm text-white/60">Daily occupancy rate over time</p>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <OccupancyTrendChart data={chartData.occupancyTrend} />
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Available Rooms</CardTitle>
                <p className="text-sm text-white/60">Available room count over time</p>
              </CardHeader>
              <CardContent className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <AvailableRoomsChart data={chartData.availableRooms} />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="property-breakdown">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Property Breakdown</CardTitle>
              <p className="text-sm text-white/60">Occupancy statistics by property</p>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <PropertyBreakdownChart data={chartData.propertyBreakdown} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-distribution">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Status Distribution</CardTitle>
              <p className="text-sm text-white/60">Room status distribution</p>
            </CardHeader>
            <CardContent className="h-96">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <StatusDistributionChart data={chartData.statusDistribution} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Stats Card Component
interface StatsCardProps {
  title: string;
  value: string;
  trend: {
    value: string;
    direction: "up" | "down";
    period: string;
  };
  icon: React.ReactNode;
  color: "blue" | "green" | "amber" | "purple";
  isLoading?: boolean;
}

const StatsCard = ({ title, value, trend, icon, color, isLoading = false }: StatsCardProps) => {
  const colorClasses = {
    blue: "bg-blue-950/40 border-blue-800/30 text-blue-500",
    green: "bg-green-950/40 border-green-800/30 text-green-500",
    amber: "bg-amber-950/40 border-amber-800/30 text-amber-500",
    purple: "bg-purple-950/40 border-purple-800/30 text-purple-500",
  };

  return (
    <div className={`rounded-xl border p-4 ${colorClasses[color]}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm text-white/60">{title}</span>
        <div className="p-2 rounded-full bg-white/5">{icon}</div>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="flex items-center text-xs">
        {!isLoading && (
          <>
            <span className={trend.direction === "up" ? "text-green-500" : "text-red-500"}>
              {trend.direction === "up" ? <ArrowUp className="h-3 w-3 inline mr-1" /> : <ArrowDown className="h-3 w-3 inline mr-1" />}
              {trend.value}
            </span>
            <span className="text-white/40 ml-1">{trend.period}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default OccupancyDashboard;
