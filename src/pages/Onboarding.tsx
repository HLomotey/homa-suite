import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserPlus, Users, ClipboardCheck, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Onboarding = () => {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center space-x-3">
        <UserPlus className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Staff Onboarding</h1>
          <p className="text-muted-foreground">
            Manage new employee onboarding process and benefits setup
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Housing & Transportation</span>
            </CardTitle>
            <CardDescription>
              Set up housing and transportation benefits for new employees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/staff-benefits">
              <Button className="w-full">Manage Benefits</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ClipboardCheck className="h-5 w-5" />
              <span>Onboarding Checklist</span>
            </CardTitle>
            <CardDescription>
              Track completion of onboarding tasks and requirements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Documentation</span>
            </CardTitle>
            <CardDescription>
              Employee handbook, policies, and onboarding documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common onboarding tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link to="/staff-benefits">
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add New Employee Benefits
                </Button>
              </Link>
              <Link to="/external-staff">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  View All Staff
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
