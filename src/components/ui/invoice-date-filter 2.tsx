import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, X, ChevronDown } from "lucide-react";

interface DateRange {
  year: number;
  month: number;
  label: string;
}

interface InvoiceDateFilterProps {
  onDateRangeChange: (dateRanges: DateRange[]) => void;
  availableDates?: DateRange[];
}

export function InvoiceDateFilter({ onDateRangeChange, availableDates }: InvoiceDateFilterProps) {
  const [selectedRanges, setSelectedRanges] = useState<DateRange[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Generate available date ranges based on invoice data or default to recent months
  const defaultDateRanges: DateRange[] = [];
  const currentDate = new Date();
  
  // Generate last 12 months of date ranges
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    defaultDateRanges.push({
      year: date.getFullYear(),
      month: date.getMonth() + 1, // Convert to 1-based month
      label: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    });
  }

  const dateRanges = availableDates || defaultDateRanges;

  const handleRangeToggle = (range: DateRange) => {
    const isSelected = selectedRanges.some(
      r => r.year === range.year && r.month === range.month
    );

    let newRanges: DateRange[];
    if (isSelected) {
      newRanges = selectedRanges.filter(
        r => !(r.year === range.year && r.month === range.month)
      );
    } else {
      newRanges = [...selectedRanges, range];
    }

    setSelectedRanges(newRanges);
    onDateRangeChange(newRanges);
  };

  const handleSelectAll = () => {
    if (selectedRanges.length === dateRanges.length) {
      setSelectedRanges([]);
      onDateRangeChange([]);
    } else {
      setSelectedRanges(dateRanges);
      onDateRangeChange(dateRanges);
    }
  };

  const handleClear = () => {
    setSelectedRanges([]);
    onDateRangeChange([]);
  };

  const removeDateRange = (rangeToRemove: DateRange) => {
    const newRanges = selectedRanges.filter(
      r => !(r.year === rangeToRemove.year && r.month === rangeToRemove.month)
    );
    setSelectedRanges(newRanges);
    onDateRangeChange(newRanges);
  };

  return (
    <div className="flex flex-col gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="justify-between min-w-[200px] bg-slate-700/50 border-slate-600/50 text-white hover:bg-slate-600/50"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {selectedRanges.length === 0 
                  ? "Select Invoice Dates" 
                  : `${selectedRanges.length} period${selectedRanges.length > 1 ? 's' : ''} selected`
                }
              </span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0 bg-slate-800 border-slate-600" align="start">
          <div className="p-3 border-b border-slate-600">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-white">Invoice Date Periods</h4>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAll}
                  className="h-6 px-2 text-xs text-slate-300 hover:text-white"
                >
                  {selectedRanges.length === dateRanges.length ? "Deselect All" : "Select All"}
                </Button>
                {selectedRanges.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClear}
                    className="h-6 px-2 text-xs text-slate-300 hover:text-white"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Select one or more periods to filter invoices by their issue date
            </p>
          </div>
          
          <div className="max-h-64 overflow-y-auto p-2">
            {dateRanges.map((range) => {
              const isSelected = selectedRanges.some(
                r => r.year === range.year && r.month === range.month
              );
              
              return (
                <div
                  key={`${range.year}-${range.month}`}
                  className="flex items-center space-x-2 p-2 hover:bg-slate-700/50 rounded cursor-pointer"
                  onClick={() => handleRangeToggle(range)}
                >
                  <Checkbox
                    checked={isSelected}
                    onChange={() => handleRangeToggle(range)}
                    className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                  />
                  <span className="text-sm text-white flex-1">{range.label}</span>
                </div>
              );
            })}
          </div>
        </PopoverContent>
      </Popover>

      {/* Selected date ranges display */}
      {selectedRanges.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedRanges.map((range) => (
            <Badge
              key={`${range.year}-${range.month}`}
              variant="secondary"
              className="bg-blue-600/20 text-blue-300 border-blue-600/30 hover:bg-blue-600/30"
            >
              {range.label}
              <button
                onClick={() => removeDateRange(range)}
                className="ml-1 hover:text-blue-100"
                title={`Remove ${range.label}`}
                aria-label={`Remove ${range.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
