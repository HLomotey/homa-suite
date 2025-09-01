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
import { MonthEndReportFormData } from "./schemas/monthEndReportSchema";
import {
  FrontendMonthEndReport,
  PropertyOption,
} from "@/integration/supabase/types/month-end-reports";
import { useMonthEndReports } from "@/hooks/operations/month-end-reports/useMonthEndReports";
import { useProperties } from "@/hooks/property/useProperties";
import {
  Plus,
  FileText
} from "lucide-react";

export const MonthEndReportsPage: React.FC = () => {
  const { toast } = useToast();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Fetch reports and properties
  const {
    createReport,
    submitReport,
    approveReport,
  } = useMonthEndReports();

  const { properties } = useProperties();

  // Map properties to the format expected by the form
  const propertyOptions: PropertyOption[] =
    properties?.map((property) => ({
      id: property.id,
      name: property.title,
    })) || [];

  // Handle saving a report
  const handleSaveReport = async (data: MonthEndReportFormData) => {
    try {
      await createReport(data);
      toast({
        title: "Success",
        description: "Report created successfully",
      });
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Error saving report:", error);
      toast({
        title: "Error",
        description: "Failed to save report",
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
          <h1 className="text-2xl font-bold">Month-End Reports</h1>
          <p className="text-muted-foreground">Create and manage monthly operational reports</p>
        </div>
        <Button onClick={handleOpenForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
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
                await submitReport(id);
                setIsSheetOpen(false);
              } catch (error) {
                console.error('Error submitting report:', error);
              }
            }}
            onApprove={async (id) => {
              try {
                await approveReport(id);
                setIsSheetOpen(false);
              } catch (error) {
                console.error('Error approving report:', error);
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
