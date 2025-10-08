import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, Building, Calendar, CheckCircle } from 'lucide-react';
import { useMonthEndReportContext } from '../../context/MonthEndReportContext';
import useStaffLocation from '@/hooks/transport/useStaffLocation';

export const GlobalReportHeader: React.FC = () => {
  const { 
    selectedHotelSite, 
    selectedDateRange, 
    setSelectedHotelSite, 
    setSelectedDateRange,
    isContextComplete 
  } = useMonthEndReportContext();
  
  const { staffLocations, loading: staffLocationsLoading } = useStaffLocation();

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Report Configuration
          {isContextComplete && (
            <Badge className="bg-green-100 text-green-800 ml-2">
              <CheckCircle className="h-3 w-3 mr-1" />
              Ready
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Hotel Site Selection */}
          <div>
            <Label htmlFor="global-hotel-site">Hotel Site</Label>
            {staffLocationsLoading ? (
              <div className="flex items-center space-x-2 mt-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-gray-500">Loading locations...</span>
              </div>
            ) : (
              <Select
                value={selectedHotelSite?.id || ""}
                onValueChange={(value) => {
                  const selectedLocation = staffLocations?.find(loc => loc.id.toString() === value);
                  setSelectedHotelSite(selectedLocation ? {
                    id: value,
                    name: selectedLocation.locationDescription
                  } : null);
                }}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select hotel site" />
                </SelectTrigger>
                <SelectContent>
                  {staffLocations?.map((location) => (
                    <SelectItem key={location.id} value={location.id.toString()}>
                      {location.locationDescription}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Start Date */}
          <div>
            <Label htmlFor="global-start-date">
              <Calendar className="h-4 w-4 inline mr-1" />
              Start Date
            </Label>
            <Input
              id="global-start-date"
              type="date"
              className="mt-2"
              value={selectedDateRange?.startDate || ""}
              onChange={(e) => setSelectedDateRange({
                startDate: e.target.value,
                endDate: selectedDateRange?.endDate || ""
              })}
            />
          </div>

          {/* End Date */}
          <div>
            <Label htmlFor="global-end-date">
              <Calendar className="h-4 w-4 inline mr-1" />
              End Date
            </Label>
            <Input
              id="global-end-date"
              type="date"
              className="mt-2"
              value={selectedDateRange?.endDate || ""}
              onChange={(e) => setSelectedDateRange({
                startDate: selectedDateRange?.startDate || "",
                endDate: e.target.value
              })}
            />
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-4 p-3 bg-blue-50 rounded-md">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Select your hotel site and reporting period here. These selections will automatically apply to all key indicator forms below, reducing repetitive data entry.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
