"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataSourcesTab } from "./DataSourcesTab";
import { ADPTab } from "./ADPTab";
import { NotificationsTab } from "./NotificationsTab";
import { LocationsTab } from "./LocationsTab";
import { BillingPeriodsList } from "./BillingPeriodsList";
import {
  Cog,
  Database,
  UserCircle,
  Bell,
  Lock,
  Shield,
  MapPin,
  BarChart3,
  Calendar,
} from "lucide-react";

export function Settings() {
  const [activeTab, setActiveTab] = useState("data-sources");

  return (
    <div className="w-full h-full">
      <div className="p-6 space-y-4">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-white/60">
          Configure system settings and integrations
        </p>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-black/40 border border-white/10 mb-6 grid grid-cols-5 h-auto">
            <TabsTrigger
              value="data-sources"
              className="flex items-center gap-2 py-3"
            >
              <Database className="h-4 w-4" />
              <span>Data Sources</span>
            </TabsTrigger>
            <TabsTrigger
              value="adp-api"
              className="flex items-center gap-2 py-3"
            >
              <Shield className="h-4 w-4" />
              <span>ADP API</span>
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2 py-3"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger
              value="locations"
              className="flex items-center gap-2 py-3"
            >
              <MapPin className="h-4 w-4" />
              <span>Locations</span>
            </TabsTrigger>
            <TabsTrigger
              value="billing-periods"
              className="flex items-center gap-2 py-3"
            >
              <Calendar className="h-4 w-4" />
              <span>Billing Periods</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="data-sources">
            <DataSourcesTab />
          </TabsContent>

          <TabsContent value="adp-api">
            <ADPTab />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="locations">
            <LocationsTab />
          </TabsContent>

          <TabsContent value="billing-periods">
            <BillingPeriodsList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
