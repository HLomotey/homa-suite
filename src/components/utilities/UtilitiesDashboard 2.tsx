import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UtilityTypesList } from "./UtilityTypesList";
import { BillingPeriodsList } from "@/components/settings/BillingPeriodsList";
// UtilitySetupsList import removed
// Removed utility readings import
import { UtilityPaymentsList } from "./UtilityPaymentsList";
import { useProperties } from "@/hooks/property/useProperty";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export function UtilitiesDashboard() {
  const [activeTab, setActiveTab] = useState("payments"); // Default to payments tab
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("all");
  const [isAddBillDialogOpen, setIsAddBillDialogOpen] = useState(false);
  const { properties } = useProperties();

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Utilities Management</CardTitle>
          <CardDescription>
            Manage utility payments, readings, setups, types, and billing
            periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-4"
          >
            <div className="flex justify-between items-center">
              <TabsList>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="types">Utility Types</TabsTrigger>
                {/* <TabsTrigger value="billing">Billing Periods</TabsTrigger> */}
              </TabsList>

              {/* Property filter removed */}
            </div>

            <TabsContent value="payments" className="space-y-4">
              <UtilityPaymentsList
                isDialogOpen={isAddBillDialogOpen}
                setIsDialogOpen={setIsAddBillDialogOpen}
              />
            </TabsContent>

            {/* Readings tab removed */}

            {/* Utility Setups tab removed */}

            <TabsContent value="types" className="space-y-4">
              <UtilityTypesList />
            </TabsContent>

            <TabsContent value="billing" className="space-y-4">
              <BillingPeriodsList />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
