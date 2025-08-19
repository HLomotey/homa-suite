import { FrontendFinanceTransaction } from "../integration/supabase/types/finance";

export interface FinanceProcessingResult {
  success: boolean;
  data?: Omit<FrontendFinanceTransaction, "id">[];
  errors?: string[];
  warnings?: string[];
  totalRows?: number;
  processedRows?: number;
}

// Define the interface for column mappings
export interface FinanceColumnMapping {
  excelColumn: string;
  fieldName: keyof Omit<FrontendFinanceTransaction, "id">;
  required: boolean;
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
}

// Define the column mappings for Excel to Finance conversion
export const FINANCE_COLUMN_MAPPINGS: FinanceColumnMapping[] = [
  {
    excelColumn: "Client Name",
    fieldName: "client",
    required: true,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Invoice #",
    fieldName: "invoiceId",
    required: true,
    validator: (value) => typeof value === "string" && value.trim().length > 0,
    transformer: (value) => value?.trim(),
  },
  {
    excelColumn: "Date",
    fieldName: "date",
    required: true,
    validator: (value) => !isNaN(Date.parse(value)),
    transformer: (value) => {
      const date = new Date(value);
      return isNaN(date.getTime())
        ? new Date().toISOString().split("T")[0]
        : date.toISOString().split("T")[0];
    },
  },
  {
    excelColumn: "Invoice Status",
    fieldName: "status",
    required: true,
    validator: (value) =>
      ["Pending", "Paid", "Overdue"].includes(value),
    transformer: (value) => value?.trim() || "Pending",
  },
  {
    excelColumn: "Date Paid",
    fieldName: "datePaid",
    required: false,
    validator: (value) => !value || !isNaN(Date.parse(value)),
    transformer: (value) => {
      if (!value) return "";
      const date = new Date(value);
      return isNaN(date.getTime())
        ? ""
        : date.toISOString().split("T")[0];
    },
  },
  {
    excelColumn: "Item Description",
    fieldName: "description",
    required: true,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Rate",
    fieldName: "rate",
    required: true,
    validator: (value) => !isNaN(parseFloat(value)),
    transformer: (value) => {
      const num = parseFloat(value.toString().replace(/[,$]/g, ""));
      return isNaN(num) ? 0 : num;
    },
  },
  {
    excelColumn: "Quantity",
    fieldName: "quantity",
    required: true,
    validator: (value) => !isNaN(parseFloat(value)),
    transformer: (value) => {
      const num = parseFloat(value.toString());
      return isNaN(num) ? 0 : num;
    },
  },
  {
    excelColumn: "Discount Percentage",
    fieldName: "discountPercentage",
    required: false,
    validator: (value) => !value || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100),
    transformer: (value) => {
      if (!value) return 0;
      const num = parseFloat(value.toString().replace(/[%]/g, ""));
      return isNaN(num) ? 0 : num;
    },
  },
  {
    excelColumn: "Line Subtotal",
    fieldName: "lineSubtotal",
    required: false,
    validator: (value) => !value || !isNaN(parseFloat(value)),
    transformer: (value) => {
      if (!value) return 0;
      const num = parseFloat(value.toString().replace(/[,$]/g, ""));
      return isNaN(num) ? 0 : num;
    },
  },
  {
    excelColumn: "Tax 1 Type",
    fieldName: "tax1Type",
    required: false,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Tax 1 Amount",
    fieldName: "tax1Amount",
    required: false,
    validator: (value) => !value || !isNaN(parseFloat(value)),
    transformer: (value) => {
      if (!value) return 0;
      const num = parseFloat(value.toString().replace(/[,$]/g, ""));
      return isNaN(num) ? 0 : num;
    },
  },
  {
    excelColumn: "Tax 2 Type",
    fieldName: "tax2Type",
    required: false,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Tax 2 Amount",
    fieldName: "tax2Amount",
    required: false,
    validator: (value) => !value || !isNaN(parseFloat(value)),
    transformer: (value) => {
      if (!value) return 0;
      const num = parseFloat(value.toString().replace(/[,$]/g, ""));
      return isNaN(num) ? 0 : num;
    },
  },
  {
    excelColumn: "Line Total",
    fieldName: "amount",
    required: true,
    validator: (value) => !isNaN(parseFloat(value)) && parseFloat(value) !== 0,
    transformer: (value) => {
      const num = parseFloat(value.toString().replace(/[,$]/g, ""));
      return isNaN(num) ? 0 : num;
    },
  },
  {
    excelColumn: "Currency",
    fieldName: "currency",
    required: false,
    validator: (value) => !value || (typeof value === "string" && value.trim().length === 3),
    transformer: (value) => value?.trim() || "USD",
  },
];

/**
 * Process Excel data and convert to Finance format
 * This function takes raw Excel data (ArrayBuffer) and converts it to the proper format
 */
export async function processFinanceData(fileData: ArrayBuffer): Promise<FinanceProcessingResult> {
  try {
    console.log('Starting finance data processing');
    
    if (!fileData || fileData.byteLength === 0) {
      console.error('Invalid file data: Empty or null ArrayBuffer');
      return {
        success: false,
        errors: ["Invalid file data: The file appears to be empty"],
        totalRows: 0,
        processedRows: 0,
      };
    }
    
    // Import XLSX dynamically to avoid issues
    console.log('Importing XLSX library');
    const XLSX = await import('xlsx');
    
    // Parse the Excel data
    console.log(`Parsing Excel data, size: ${fileData.byteLength} bytes`);
    let workbook;
    try {
      workbook = XLSX.read(fileData, { type: 'array' });
    } catch (error) {
      console.error('Error parsing Excel file:', error);
      return {
        success: false,
        errors: ["Could not parse Excel file. Please ensure it's a valid Excel (.xlsx) file."],
        totalRows: 0,
        processedRows: 0,
      };
    }
    
    // Check if workbook has sheets
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      console.error('No worksheets found in Excel file');
      return {
        success: false,
        errors: ["No worksheets found in Excel file"],
        totalRows: 0,
        processedRows: 0,
      };
    }
    
    // Get the first worksheet
    const worksheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[worksheetName];
    console.log(`Using worksheet: ${worksheetName}`);
    
    if (!worksheet) {
      console.error('Worksheet is empty or invalid');
      return {
        success: false,
        errors: ["The worksheet appears to be empty or invalid"],
        totalRows: 0,
        processedRows: 0,
      };
    }
    
    // Convert to JSON
    console.log('Converting worksheet to JSON');
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    const errors: string[] = [];
    const warnings: string[] = [];
    const processedData: Omit<FrontendFinanceTransaction, "id">[] = [];

    if (!rawData || rawData.length === 0) {
      console.error('No data found in the Excel file');
      return {
        success: false,
        errors: ["No data found in the Excel file"],
        totalRows: 0,
        processedRows: 0,
      };
    }
    
    console.log(`Found ${rawData.length} rows of data`);

    // Check for required columns
    const firstRow = rawData[0];
    const availableColumns = Object.keys(firstRow);
    console.log('Available columns:', availableColumns);
    const requiredColumns = FINANCE_COLUMN_MAPPINGS.filter(
      (mapping) => mapping.required
    );

    const missingRequiredColumns = requiredColumns
      .filter((mapping) => !availableColumns.includes(mapping.excelColumn))
      .map((mapping) => mapping.excelColumn);

    if (missingRequiredColumns.length > 0) {
      console.error('Missing required columns:', missingRequiredColumns);
      return {
        success: false,
        errors: [
          `Missing required columns: ${missingRequiredColumns.join(", ")}`,
        ],
        totalRows: rawData.length,
        processedRows: 0,
      };
    }

    // Process each row
    rawData.forEach((row, index) => {
      const rowNumber = index + 2; // +2 because Excel rows start at 1 and we skip header
      const transaction: Partial<Omit<FrontendFinanceTransaction, "id">> = {};
      const rowErrors: string[] = [];
      const rowWarnings: string[] = [];

      // Process each column mapping
      FINANCE_COLUMN_MAPPINGS.forEach((mapping) => {
        const rawValue = row[mapping.excelColumn];

        // Skip empty values for optional fields
        if (!rawValue && !mapping.required) {
          return;
        }

        // Check required fields
        if (
          mapping.required &&
          (!rawValue || (typeof rawValue === "string" && rawValue.trim() === ""))
        ) {
          rowErrors.push(
            `Row ${rowNumber}: Missing required field '${mapping.excelColumn}'`
          );
          return;
        }

        // Validate value
        if (mapping.validator && !mapping.validator(rawValue)) {
          rowErrors.push(
            `Row ${rowNumber}: Invalid value for '${mapping.excelColumn}': ${rawValue}`
          );
          return;
        }

        // Transform value
        let transformedValue = rawValue;
        if (mapping.transformer) {
          transformedValue = mapping.transformer(rawValue);
        }

        // Set the value
        if (transformedValue !== undefined) {
          (transaction as any)[mapping.fieldName] = transformedValue;
        }
      });

      // Add row-specific errors and warnings
      errors.push(...rowErrors);
      warnings.push(...rowWarnings);

      // Only add to processed data if no errors
      if (rowErrors.length === 0) {
        processedData.push(transaction as Omit<FrontendFinanceTransaction, "id">);
      }
    });

    // Add summary warnings
    if (processedData.length < rawData.length) {
      warnings.push(
        `${rawData.length - processedData.length} rows were skipped due to errors`
      );
    }

    if (processedData.length > 0) {
      warnings.push(
        `${processedData.length} transactions processed successfully`
      );
    }

    console.log('Finished processing finance data, returning result');
    return {
      success: errors.length === 0 && processedData.length > 0,
      data: processedData,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined,
      totalRows: rawData.length,
      processedRows: processedData.length,
    };
  } catch (error) {
    console.error('Unexpected error in finance data processing:', error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : 'An unknown error occurred during processing'],
      totalRows: 0,
      processedRows: 0,
    };
  }
}

/**
 * Generate a CSV template for finance invoice line item data upload
 * @returns A Blob containing the CSV template
 */
export async function generateFinanceTemplate(): Promise<Blob> {
  try {
    console.log('Generating finance invoice template');
    
    // Get headers from column mappings
    const headers = FINANCE_COLUMN_MAPPINGS.map(mapping => mapping.excelColumn);
    
    // Create sample data rows
    const sampleData1 = [
      "ABC Corporation", // Client Name
      "INV-2023-001", // Invoice #
      new Date().toISOString().split('T')[0], // Date
      "Pending", // Invoice Status
      "", // Date Paid
      "Web Development Services", // Item Description
      "125.00", // Rate
      "10", // Quantity
      "5", // Discount Percentage
      "1187.50", // Line Subtotal
      "VAT", // Tax 1 Type
      "237.50", // Tax 1 Amount
      "", // Tax 2 Type
      "0", // Tax 2 Amount
      "1425.00", // Line Total
      "USD" // Currency
    ];
    
    const sampleData2 = [
      "XYZ Ltd", // Client Name
      "INV-2023-002", // Invoice #
      new Date().toISOString().split('T')[0], // Date
      "Paid", // Invoice Status
      new Date().toISOString().split('T')[0], // Date Paid
      "Monthly Maintenance", // Item Description
      "75.00", // Rate
      "6", // Quantity
      "0", // Discount Percentage
      "450.00", // Line Subtotal
      "GST", // Tax 1 Type
      "45.00", // Tax 1 Amount
      "PST", // Tax 2 Type
      "22.50", // Tax 2 Amount
      "517.50", // Line Total
      "USD" // Currency
    ];
    
    // Create CSV content
    const csvContent = [
      headers.join(','),
      sampleData1.join(','),
      sampleData2.join(',')
    ].join('\n');
    
    // Convert to Blob
    const blob = new Blob([csvContent], { type: 'text/csv' });
    
    console.log('Finance invoice template generated successfully');
    return blob;
  } catch (error) {
    console.error('Error generating finance invoice template:', error);
    return new Blob([""], { type: 'text/csv' });
  }
}

/**
 * Convert an Excel row to a Finance Invoice Line Item
 */
export function convertExcelRowToFinance(row: any): Omit<FrontendFinanceTransaction, "id"> {
  const transaction = {} as Omit<FrontendFinanceTransaction, "id">;
  
  // Apply each column mapping
  FINANCE_COLUMN_MAPPINGS.forEach((mapping) => {
    const { excelColumn, fieldName, transformer } = mapping;
    
    // Get the value from the row
    const value = row[excelColumn];
    
    // Apply transformer if available
    if (transformer && value !== undefined) {
      (transaction as any)[fieldName] = transformer(value);
    } else if (value !== undefined) {
      (transaction as any)[fieldName] = value;
    }
  });
  
  // Ensure required fields have default values if missing
  if (transaction.rate === undefined) transaction.rate = 0;
  if (transaction.quantity === undefined) transaction.quantity = 0;
  if (transaction.amount === undefined) transaction.amount = 0;
  if (transaction.status === undefined) transaction.status = "Pending";
  if (transaction.currency === undefined) transaction.currency = "USD";
  
  return transaction;
}
