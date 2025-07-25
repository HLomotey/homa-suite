import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUp, ArrowDown, Percent, Building, DoorOpen, Users } from "lucide-react";

// Occupancy Dashboard Component
export const OccupancyDashboard = () => {
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
          value="12" 
          trend={{ value: "+15%", direction: "up", period: "vs last month" }}
          icon={<Building className="h-5 w-5" />}
          color="blue"
        />
        <StatsCard 
          title="Total Rooms" 
          value="248" 
          trend={{ value: "+5%", direction: "up", period: "vs last month" }}
          icon={<DoorOpen className="h-5 w-5" />}
          color="green"
        />
        <StatsCard 
          title="Occupied Rooms" 
          value="186" 
          trend={{ value: "-1%", direction: "down", period: "vs last month" }}
          icon={<Users className="h-5 w-5" />}
          color="amber"
        />
        <StatsCard 
          title="Occupancy Rate" 
          value="75%" 
          trend={{ value: "-1%", direction: "down", period: "vs last month" }}
          icon={<Percent className="h-5 w-5" />}
          color="purple"
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
              <CardContent className="h-80 flex items-center justify-center">
                <p className="text-white/60">Chart placeholder - Occupancy trend line chart</p>
              </CardContent>
            </Card>
            
            <Card className="bg-black/40 backdrop-blur-md border border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Available Rooms</CardTitle>
                <p className="text-sm text-white/60">Available room count over time</p>
              </CardHeader>
              <CardContent className="h-80 flex items-center justify-center">
                <p className="text-white/60">Chart placeholder - Available rooms line chart</p>
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
            <CardContent className="h-96 flex items-center justify-center">
              <p className="text-white/60">Chart placeholder - Property breakdown</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-distribution">
          <Card className="bg-black/40 backdrop-blur-md border border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Status Distribution</CardTitle>
              <p className="text-sm text-white/60">Room status distribution</p>
            </CardHeader>
            <CardContent className="h-96 flex items-center justify-center">
              <p className="text-white/60">Chart placeholder - Status distribution</p>
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
}

const StatsCard = ({ title, value, trend, icon, color }: StatsCardProps) => {
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
        <span className={trend.direction === "up" ? "text-green-500" : "text-red-500"}>
          {trend.direction === "up" ? <ArrowUp className="h-3 w-3 inline mr-1" /> : <ArrowDown className="h-3 w-3 inline mr-1" />}
          {trend.value}
        </span>
        <span className="text-white/40 ml-1">{trend.period}</span>
      </div>
    </div>
  );
};

export default OccupancyDashboard;
