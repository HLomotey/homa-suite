import React from 'react';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import { useMonthEndReportContext } from '../../context/MonthEndReportContext';

interface SimplifiedFormWrapperProps {
  children: React.ReactNode;
  title: string;
}

export const SimplifiedFormWrapper: React.FC<SimplifiedFormWrapperProps> = ({ 
  children, 
  title 
}) => {
  const { selectedHotelSite, selectedDateRange, isContextComplete } = useMonthEndReportContext();

  if (!isContextComplete) {
    return (
      <div className="p-6 bg-amber-50 border border-amber-200 rounded-md text-center">
        <AlertTriangle className="h-8 w-8 text-amber-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-amber-800 mb-2">{title}</h3>
        <p className="text-sm text-amber-700 mb-4">
          Please select hotel site and date range in the Report Configuration section above to continue.
        </p>
        <Badge variant="outline" className="text-amber-700 border-amber-300">
          Configuration Required
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Context Summary */}
      <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-md">
        <CheckCircle className="h-5 w-5 text-green-600" />
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">
            {title} for {selectedHotelSite?.name}
          </p>
          <p className="text-xs text-green-600">
            Period: {selectedDateRange?.startDate} to {selectedDateRange?.endDate}
          </p>
        </div>
      </div>
      
      {/* Form Content */}
      {children}
    </div>
  );
};
