import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { CalendarIcon } from 'lucide-react';
// import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  loading?: boolean;
}

export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
  loading = false
}: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      onDateRangeChange(range);
    }
  };

  const formatDateRange = () => {
    if (dateRange.from) {
      if (dateRange.to) {
        return `${dateRange.from.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} - ${dateRange.to.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`;
      } else {
        return dateRange.from.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      }
    }
    return 'Select date range';
  };

  const handlePresetRange = (preset: string) => {
    const today = new Date();
    const currentYear = today.getFullYear();
    
    switch (preset) {
      case 'thisMonth':
        onDateRangeChange({
          from: new Date(currentYear, today.getMonth(), 1),
          to: new Date(currentYear, today.getMonth() + 1, 0)
        });
        break;
      case 'lastMonth':
        onDateRangeChange({
          from: new Date(currentYear, today.getMonth() - 1, 1),
          to: new Date(currentYear, today.getMonth(), 0)
        });
        break;
      case 'thisQuarter':
        const quarterStart = Math.floor(today.getMonth() / 3) * 3;
        onDateRangeChange({
          from: new Date(currentYear, quarterStart, 1),
          to: new Date(currentYear, quarterStart + 3, 0)
        });
        break;
      case 'thisYear':
        onDateRangeChange({
          from: new Date(currentYear, 0, 1),
          to: new Date(currentYear, 11, 31)
        });
        break;
      case 'lastYear':
        onDateRangeChange({
          from: new Date(currentYear - 1, 0, 1),
          to: new Date(currentYear - 1, 11, 31)
        });
        break;
      case 'all':
        onDateRangeChange({
          from: new Date(2025, 0, 1), // Based on data range from query
          to: new Date(2025, 11, 31)
        });
        break;
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-2">
      <Label>Date Range</Label>
      <div className="flex gap-2">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex-1 justify-start text-left font-normal',
                !dateRange.from && 'text-muted-foreground'
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-3 border-b">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange('thisMonth')}
                >
                  This Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange('lastMonth')}
                >
                  Last Month
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange('thisQuarter')}
                >
                  This Quarter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange('thisYear')}
                >
                  This Year
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange('lastYear')}
                >
                  Last Year
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePresetRange('all')}
                >
                  All Time
                </Button>
              </div>
            </div>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.from}
              selected={dateRange}
              onSelect={handleSelect}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
