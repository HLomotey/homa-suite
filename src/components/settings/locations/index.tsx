import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CompanyLocationsTab } from "./CompanyLocationsTab";
import { StaffLocationsTab } from "./StaffLocationsTab";

export function LocationsTab() {
  const [activeTab, setActiveTab] = useState<string>("company");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Locations Management</CardTitle>
        <CardDescription>Manage company and staff locations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="company"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="company">Company Locations</TabsTrigger>
            <TabsTrigger value="staff">Staff Locations</TabsTrigger>
          </TabsList>
          <TabsContent value="company" className="mt-6">
            <CompanyLocationsTab />
          </TabsContent>
          <TabsContent value="staff" className="mt-6">
            <StaffLocationsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default LocationsTab;
