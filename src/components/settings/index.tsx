"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataSourcesTab } from "./DataSourcesTab";
import { ADPTab } from "./ADPTab";
import { ProfileTab } from "./ProfileTab";
import { SecurityTab } from "./SecurityTab";
import { NotificationsTab } from "./NotificationsTab";
import { Cog, Database, UserCircle, Bell, Lock, Shield } from "lucide-react";

export function Settings() {
  const [activeTab, setActiveTab] = useState("data-sources");

  return (
    <div className="w-full h-full">
      <div className="p-6 space-y-4">
        <h1 className="text-4xl font-bold text-white">Settings</h1>
        <p className="text-white/60">Configure system settings and integrations</p>
      
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
              value="profile" 
              className="flex items-center gap-2 py-3"
            >
              <UserCircle className="h-4 w-4" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="flex items-center gap-2 py-3"
            >
              <Lock className="h-4 w-4" />
              <span>Security</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="flex items-center gap-2 py-3"
            >
              <Bell className="h-4 w-4" />
              <span>Notifications</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="data-sources">
            <DataSourcesTab />
          </TabsContent>
          
          <TabsContent value="adp-api">
            <ADPTab />
          </TabsContent>
          
          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
