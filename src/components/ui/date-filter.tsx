import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface DateFilterProps {
  onDateChange: (year: number | undefined, month: number | undefined) => void;
}

export function DateFilter({ onDateChange }: DateFilterProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>();

  const months = [
    { value: 1, label: "Jan" },
    { value: 2, label: "Feb" },
    { value: 3, label: "Mar" },
    { value: 4, label: "Apr" },
    { value: 5, label: "May" },
    { value: 6, label: "Jun" },
    { value: 7, label: "Jul" },
    { value: 8, label: "Aug" },
    { value: 9, label: "Sep" },
    { value: 10, label: "Oct" },
    { value: 11, label: "Nov" },
    { value: 12, label: "Dec" },
  ];

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const year = parseInt(e.target.value);
    if (!isNaN(year)) {
      setSelectedYear(year);
      onDateChange(year, selectedMonth);
    }
  };

  const handleMonthClick = (month: number) => {
    const newMonth = selectedMonth === month ? undefined : month;
    setSelectedMonth(newMonth);
    onDateChange(selectedYear, newMonth);
  };

  const handleReset = () => {
    setSelectedYear(currentYear);
    setSelectedMonth(undefined);
    onDateChange(undefined, undefined);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-slate-800 rounded-lg border border-slate-700">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-300">
          Select a month and transfer all basic salary data to the payroll details table.
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-slate-300">Year:</label>
          <Input
            type="number"
            value={selectedYear}
            onChange={handleYearChange}
            className="w-20 bg-slate-700 border-slate-600 text-white"
            min="2020"
            max="2030"
          />
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleReset} className="text-slate-400 hover:text-white">
          <X className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-slate-300 mr-2">Month:</label>
        <div className="flex gap-1">
          {months.map((month) => (
            <Button
              key={month.value}
              variant={selectedMonth === month.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleMonthClick(month.value)}
              className={`px-3 py-1 text-xs ${
                selectedMonth === month.value
                  ? "bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  : "bg-slate-700 hover:bg-slate-600 text-slate-300 border-slate-600"
              }`}
            >
              {month.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
