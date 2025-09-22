import React, { useState } from "react";
import { X } from "lucide-react";

export interface ColumnOption {
  id: string;
  label: string;
  visible: boolean;
}

interface ColumnCustomizerProps {
  columns: ColumnOption[];
  onChange: (columns: ColumnOption[]) => void;
}

const ColumnCustomizer: React.FC<ColumnCustomizerProps> = ({
  columns,
  onChange,
}) => {
  // Debug logging for incoming columns
  console.log("ColumnCustomizer received columns:", columns);
  
  const [localColumns, setLocalColumns] = useState<ColumnOption[]>(columns);

  const handleToggleColumn = (id: string) => {
    setLocalColumns((prev) =>
      prev.map((col) =>
        col.id === id ? { ...col, visible: !col.visible } : col
      )
    );
  };

  const handleSave = () => {
    onChange(localColumns);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Customize Columns</h2>
        <div className="flex space-x-3">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Apply Changes
          </button>
          <button
            onClick={() => onChange(columns)}
            className="p-2 hover:bg-slate-700 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      <div className="space-y-4 mb-8">
        <p className="text-gray-300 text-sm">
          Select which columns to display in the staff table.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {localColumns.map((column) => (
            <div
              key={column.id}
              className="flex items-center space-x-3 p-3 bg-slate-700 rounded-lg"
            >
              <input
                type="checkbox"
                id={`column-${column.id}`}
                checked={column.visible}
                onChange={() => handleToggleColumn(column.id)}
                className="h-4 w-4 rounded border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800"
              />
              <label
                htmlFor={`column-${column.id}`}
                className="text-gray-200 cursor-pointer flex-1"
              >
                {column.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={() => onChange(columns)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ColumnCustomizer;
