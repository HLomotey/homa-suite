import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ExternalStaffSimple() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">External Staff</h1>
          <p className="text-muted-foreground">
            Manage external staff members and their information
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>External Staff Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              External Staff module is temporarily simplified to resolve loading issues.
              Full functionality will be restored shortly.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
