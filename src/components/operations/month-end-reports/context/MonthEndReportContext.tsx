import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface MonthEndReportContextType {
  selectedHotelSite: {
    id: string;
    name: string;
  } | null;
  selectedDateRange: {
    startDate: string;
    endDate: string;
  } | null;
  setSelectedHotelSite: (site: { id: string; name: string } | null) => void;
  setSelectedDateRange: (range: { startDate: string; endDate: string } | null) => void;
  isContextComplete: boolean;
}

const MonthEndReportContext = createContext<MonthEndReportContextType | undefined>(undefined);

export const useMonthEndReportContext = () => {
  const context = useContext(MonthEndReportContext);
  if (context === undefined) {
    throw new Error('useMonthEndReportContext must be used within a MonthEndReportProvider');
  }
  return context;
};

interface MonthEndReportProviderProps {
  children: ReactNode;
}

export const MonthEndReportProvider: React.FC<MonthEndReportProviderProps> = ({ children }) => {
  const [selectedHotelSite, setSelectedHotelSite] = useState<{ id: string; name: string } | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<{ startDate: string; endDate: string } | null>(null);

  const isContextComplete = Boolean(selectedHotelSite && selectedDateRange?.startDate && selectedDateRange?.endDate);

  const value: MonthEndReportContextType = {
    selectedHotelSite,
    selectedDateRange,
    setSelectedHotelSite,
    setSelectedDateRange,
    isContextComplete,
  };

  return (
    <MonthEndReportContext.Provider value={value}>
      {children}
    </MonthEndReportContext.Provider>
  );
};
