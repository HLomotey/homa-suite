import { FrontendFinanceTransaction } from "../integration/supabase/types/finance";

export interface FinanceProcessingResult {
  success: boolean;
  data?: Omit<FrontendFinanceTransaction, "id">[];
  errors?: string[];
  warnings?: string[];
  totalRows?: number;
  processedRows?: number;
}

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
    excelColumn: "Transaction ID",
    fieldName: "transactionId",
    required: true,
    validator: (value) => typeof value === "string" && value.trim().length > 0,
    transformer: (value) => value?.trim(),
  },
  {
    excelColumn: "Amount",
    fieldName: "amount",
    required: true,
    validator: (value) => !isNaN(parseFloat(value)) && parseFloat(value) !== 0,
    transformer: (value) => {
      const num = parseFloat(value.toString().replace(/[,$]/g, ""));
      return isNaN(num) ? 0 : num;
    },
  },
  {
    excelColumn: "Account",
    fieldName: "account",
    required: true,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Client",
    fieldName: "client",
    required: true,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Payment Method",
    fieldName: "paymentMethod",
    required: true,
    transformer: (value) => value?.trim() || "",
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
    excelColumn: "Category",
    fieldName: "category",
    required: true,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Description",
    fieldName: "description",
    required: false,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Invoice ID",
    fieldName: "invoiceId",
    required: false,
    transformer: (value) => value?.trim() || "",
  },
  {
    excelColumn: "Status",
    fieldName: "status",
    required: true,
    validator: (value) =>
      ["Pending", "Completed", "Failed"].includes(value),
    transformer: (value) => value?.trim() || "Pending",
  },
];

/**
 * Process Excel data and convert to Finance format
 * This function takes raw Excel data (array of objects) and converts it to the proper format
 */
export function processFinanceData(rawData: any[]): FinanceProcessingResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const processedData: Omit<FrontendFinanceTransaction, "id">[] = [];

  if (!rawData || rawData.length === 0) {
    return {
      success: false,
      errors: ["No data found in the Excel file"],
      totalRows: 0,
      processedRows: 0,
    };
  }

  // Check for required columns
  const firstRow = rawData[0];
  const availableColumns = Object.keys(firstRow);
  const requiredColumns = FINANCE_COLUMN_MAPPINGS.filter(
    (mapping) => mapping.required
  );

  const missingRequiredColumns = requiredColumns
    .filter((mapping) => !availableColumns.includes(mapping.excelColumn))
    .map((mapping) => mapping.excelColumn);

  if (missingRequiredColumns.length > 0) {
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

  return {
    success: errors.length === 0 && processedData.length > 0,
    data: processedData,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    totalRows: rawData.length,
    processedRows: processedData.length,
  };
}

/**
 * Generate a CSV template with all the required and optional columns
 */
export function generateFinanceTemplate(): string {
  const headers = FINANCE_COLUMN_MAPPINGS.map((mapping) => mapping.excelColumn);

  // Sample data row
  const sampleData = [
    "TRX12345", // Transaction ID
    "1500.00", // Amount
    "Business Account", // Account
    "Acme Corp", // Client
    "Bank Transfer", // Payment Method
    "2025-08-15", // Date
    "Revenue", // Category
    "Monthly service fee", // Description
    "INV-2025-001", // Invoice ID
    "Completed", // Status
  ];

  return headers.join(",") + "\n" + sampleData.join(",");
}

/**
 * Convert an Excel row to a Finance Transaction
 */
export function convertExcelRowToFinance(row: any): Omit<FrontendFinanceTransaction, "id"> {
  const transaction: Partial<Omit<FrontendFinanceTransaction, "id">> = {};
  
  FINANCE_COLUMN_MAPPINGS.forEach((mapping) => {
    const rawValue = row[mapping.excelColumn];
    
    if (rawValue !== undefined && rawValue !== null) {
      let transformedValue = rawValue;
      if (mapping.transformer) {
        transformedValue = mapping.transformer(rawValue);
      }
      
      (transaction as any)[mapping.fieldName] = transformedValue;
    }
  });
  
  return transaction as Omit<FrontendFinanceTransaction, "id">;
}
