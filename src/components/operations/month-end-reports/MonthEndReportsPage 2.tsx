import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MonthEndReportSheetForm } from "./components/sheet/MonthEndReportSheetForm";
import { MonthEndReportsList } from "./MonthEndReportsList";
import { OpsCallFormData } from "@/integration/supabase/types/operations-call";
import {
  FrontendMonthEndReport,
  PropertyOption,
} from "@/integration/supabase/types/month-end-reports";
import { useOpsCall } from "@/hooks/operations/ops-call/useOpsCall";
import { useProperties } from "@/hooks/property/useProperties";
import { Plus, FileText } from "lucide-react";

export const MonthEndReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch ops calls and properties
  const {
    opsCalls,
    loading,
    createOpsCall,
    fetchOpsCalls,
    submitOpsCall,
    approveOpsCall,
    updateOpsCall,
    deleteOpsCall,
  } = useOpsCall();

  const { properties } = useProperties();

  // Map properties to the format expected by the form
  const propertyOptions: PropertyOption[] =
    properties?.map((property) => ({
      id: property.id,
      name: property.title,
    })) || [];

  // Handle saving an ops call
  const handleSaveReport = async (data: OpsCallFormData) => {
    try {
      await createOpsCall(data);
      // Refresh the list to show the new data
      await fetchOpsCalls();
      toast({
        title: "Success",
        description: "Ops call created successfully",
      });
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error saving ops call:", error);
      toast({
        title: "Error",
        description: "Failed to save ops call",
        variant: "destructive",
      });
    }
  };

  const handleOpenForm = () => {
    setIsSheetOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Operations Call Meeting Report</h1>
          <p className="text-muted-foreground">
            Create and manage monthly operational reports
          </p>
        </div>
        <Button onClick={handleOpenForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {loading ? (
          <div className="flex items-center justify-center p-6">
            <div className="text-center">Loading...</div>
          </div>
        ) : opsCalls && opsCalls.length > 0 ? (
          <MonthEndReportsList
            onCreateNew={handleOpenForm}
            onEdit={(report) => {
              // Handle edit functionality
              console.log("Edit report:", report);
            }}
            onView={(report) => {
              // Handle view functionality
              console.log("View report:", report);
            }}
            onDelete={async (id) => {
              try {
                await deleteOpsCall(id);
                await fetchOpsCalls();
                toast({
                  title: "Success",
                  description: "Ops call deleted successfully",
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to delete ops call",
                  variant: "destructive",
                });
              }
            }}
            onSubmit={async (id) => {
              try {
                await submitOpsCall(id);
                await fetchOpsCalls();
                toast({
                  title: "Success",
                  description: "Ops call submitted successfully",
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to submit ops call",
                  variant: "destructive",
                });
              }
            }}
            onApprove={async (id) => {
              try {
                await approveOpsCall(id);
                await fetchOpsCalls();
                toast({
                  title: "Success",
                  description: "Ops call approved successfully",
                });
              } catch (error) {
                toast({
                  title: "Error",
                  description: "Failed to approve ops call",
                  variant: "destructive",
                });
              }
            }}
          />
        ) : (
          <div className="flex items-center justify-center p-6">
            <div className="text-center space-y-4">
              <FileText className="h-16 w-16 mx-auto text-muted-foreground" />
              <div>
                <h2 className="text-xl font-semibold mb-2">No reports yet</h2>
                <p className="text-muted-foreground mb-4">
                  Get started by creating your first month-end report
                </p>
                <Button onClick={handleOpenForm} size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sheet Form */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl">
          <SheetHeader>
            <SheetTitle>Create New Report</SheetTitle>
            <SheetDescription>
              Fill out the form below to create a new month-end report.
            </SheetDescription>
          </SheetHeader>

          <MonthEndReportSheetForm
            report={null}
            mode="create"
            properties={propertyOptions}
            staffLocations={[]}
            onSave={handleSaveReport}
            onSubmit={async (id) => {
              try {
                await submitOpsCall(id);
                setIsSheetOpen(false);
              } catch (error) {
                console.error("Error submitting ops call:", error);
              }
            }}
            onApprove={async (id) => {
              try {
                await approveOpsCall(id);
                setIsSheetOpen(false);
              } catch (error) {
                console.error("Error approving ops call:", error);
              }
            }}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MonthEndReportsPage;
