import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useMonthEndReportContext } from '../../context/MonthEndReportContext';

interface ContextualFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
  onSave: (data: any) => void;
  onCancel: () => void;
  formData: any;
}

export const ContextualFormSheet: React.FC<ContextualFormSheetProps> = ({
  isOpen,
  onOpenChange,
  title,
  children,
  onSave,
  onCancel,
  formData
}) => {
  const { selectedHotelSite, selectedDateRange, isContextComplete } = useMonthEndReportContext();

  const handleSave = () => {
    const completeData = {
      ...formData,
      property_id: selectedHotelSite?.id || "",
      hotel_site: selectedHotelSite?.name || "",
      start_date: selectedDateRange?.startDate || "",
      end_date: selectedDateRange?.endDate || ""
    };
    onSave(completeData);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        
        <div className="space-y-6">
          {!isContextComplete ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-md text-center">
              <AlertTriangle className="h-6 w-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-700 mb-3">
                Please select hotel site and date range in the Report Configuration section first.
              </p>
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                Configuration Required
              </Badge>
            </div>
          ) : (
            <>
              {/* Context Summary */}
              <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800">
                    {selectedHotelSite?.name}
                  </p>
                  <p className="text-xs text-green-600">
                    {selectedDateRange?.startDate} to {selectedDateRange?.endDate}
                  </p>
                </div>
              </div>
              
              {/* Form Content */}
              {children}
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t mt-6">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!isContextComplete}>
            Save Changes
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
