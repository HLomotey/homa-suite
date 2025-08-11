import { FrontendBillingStaff } from "../integration/supabase/types/billing";

export interface ExcelProcessingResult {
  success: boolean;
  data?: Omit<FrontendBillingStaff, "id">[];
  errors?: string[];
  warnings?: string[];
  totalRows?: number;
  processedRows?: number;
}

export interface ColumnMapping {
  excelColumn: string;
  fieldName: keyof Omit<FrontendBillingStaff, "id">;
  required: boolean;
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
}

// Define the column mappings for Excel to BillingStaff conversion
export const STAFF_COLUMN_MAPPINGS: ColumnMapping[] = [
  // Personal Information
  {
    excelColumn: "Legal Name",
    fieldName: "legalName",
    required: true,
    validator: (value) => typeof value === "string" && value.trim().length > 0,
  },
  {
    excelColumn: "Preferred Name",
    fieldName: "preferredName",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Birth Name",
    fieldName: "birthName",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Email",
    fieldName: "email",
    required: false,
    validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    transformer: (value) => value?.trim().toLowerCase() || undefined,
  },
  {
    excelColumn: "Phone Number",
    fieldName: "phoneNumber",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Address",
    fieldName: "address",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Marital Status",
    fieldName: "maritalStatus",
    required: false,
    validator: (value) =>
      !value ||
      [
        "Single",
        "Married",
        "Divorced",
        "Widowed",
        "Separated",
        "Prefer not to say",
      ].includes(value),
    transformer: (value) => value?.trim() || undefined,
  },

  // Emergency Contacts
  {
    excelColumn: "Emergency Contact Name",
    fieldName: "emergencyContactName",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Emergency Contact Phone",
    fieldName: "emergencyContactPhone",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Emergency Contact Relationship",
    fieldName: "emergencyContactRelationship",
    required: false,
    validator: (value) =>
      !value ||
      ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"].includes(
        value
      ),
    transformer: (value) => value?.trim() || undefined,
  },

  // Work Information
  {
    excelColumn: "Employee ID",
    fieldName: "employeeId",
    required: true,
    validator: (value) => typeof value === "string" && value.trim().length > 0,
    transformer: (value) => value?.trim(),
  },
  {
    excelColumn: "Job Title",
    fieldName: "jobTitle",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Department",
    fieldName: "department",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Location",
    fieldName: "location",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Employment Status",
    fieldName: "employmentStatus",
    required: false,
    validator: (value) =>
      !value ||
      ["Full-time", "Part-time", "Contractor", "Temporary", "Intern"].includes(
        value
      ),
    transformer: (value) => value?.trim() || "Full-time",
  },
  {
    excelColumn: "Hire Date",
    fieldName: "hireDate",
    required: false,
    validator: (value) => !value || !isNaN(Date.parse(value)),
    transformer: (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      return isNaN(date.getTime())
        ? undefined
        : date.toISOString().split("T")[0];
    },
  },
  {
    excelColumn: "Termination Date",
    fieldName: "terminationDate",
    required: false,
    validator: (value) => !value || !isNaN(Date.parse(value)),
    transformer: (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      return isNaN(date.getTime())
        ? undefined
        : date.toISOString().split("T")[0];
    },
  },

  // EEO Data
  {
    excelColumn: "Gender",
    fieldName: "gender",
    required: false,
    validator: (value) => !value || ["Male", "Female"].includes(value),
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Ethnicity/Race",
    fieldName: "ethnicityRace",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Veteran Status",
    fieldName: "veteranStatus",
    required: false,
    validator: (value) =>
      !value ||
      [
        "Not a veteran",
        "Veteran",
        "Disabled veteran",
        "Recently separated veteran",
        "Prefer not to say",
      ].includes(value),
    transformer: (value) => value?.trim() || undefined,
  },
  {
    excelColumn: "Disability Status",
    fieldName: "disabilityStatus",
    required: false,
    validator: (value) =>
      !value ||
      ["No disability", "Has a disability", "Prefer not to say"].includes(
        value
      ),
    transformer: (value) => value?.trim() || undefined,
  },

  // Compensation
  {
    excelColumn: "Annual Salary",
    fieldName: "salary",
    required: false,
    validator: (value) =>
      !value || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0),
    transformer: (value) => {
      if (!value) return undefined;
      const num = parseFloat(value.toString().replace(/[,$]/g, ""));
      return isNaN(num) ? undefined : num;
    },
  },
  {
    excelColumn: "Hourly Rate",
    fieldName: "hourlyRate",
    required: false,
    validator: (value) =>
      !value || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0),
    transformer: (value) => {
      if (!value) return undefined;
      const num = parseFloat(value.toString().replace(/[,$]/g, ""));
      return isNaN(num) ? undefined : num;
    },
  },
];

/**
 * Process Excel data and convert to BillingStaff format
 * This function takes raw Excel data (array of objects) and converts it to the proper format
 */
export function processExcelData(rawData: any[]): ExcelProcessingResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const processedData: Omit<FrontendBillingStaff, "id">[] = [];

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
  const requiredColumns = STAFF_COLUMN_MAPPINGS.filter(
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
    const staffMember: Partial<Omit<FrontendBillingStaff, "id">> = {};
    const rowErrors: string[] = [];
    const rowWarnings: string[] = [];

    // Process each column mapping
    STAFF_COLUMN_MAPPINGS.forEach((mapping) => {
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
        (staffMember as any)[mapping.fieldName] = transformedValue;
      }
    });

    // Check for duplicate employee IDs within the file
    if (staffMember.employeeId) {
      const duplicateIndex = processedData.findIndex(
        (existing) => existing.employeeId === staffMember.employeeId
      );
      if (duplicateIndex !== -1) {
        rowWarnings.push(
          `Row ${rowNumber}: Duplicate Employee ID '${
            staffMember.employeeId
          }' (also found in row ${duplicateIndex + 2})`
        );
      }
    }

    // Add row-specific errors and warnings
    errors.push(...rowErrors);
    warnings.push(...rowWarnings);

    // Only add to processed data if no errors
    if (rowErrors.length === 0) {
      processedData.push(staffMember as Omit<FrontendBillingStaff, "id">);
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
      `${processedData.length} staff members processed successfully`
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
export function generateStaffTemplate(): string {
  const headers = STAFF_COLUMN_MAPPINGS.map((mapping) => mapping.excelColumn);

  // Sample data row
  const sampleData = [
    "John Doe", // Legal Name
    "John", // Preferred Name
    "", // Birth Name
    "john.doe@company.com", // Email
    "+1 (555) 123-4567", // Phone Number
    "123 Main St, City, State 12345", // Address
    "Single", // Marital Status
    "Jane Doe", // Emergency Contact Name
    "+1 (555) 999-8888", // Emergency Contact Phone
    "Spouse", // Emergency Contact Relationship
    "EMP001", // Employee ID
    "Software Engineer", // Job Title
    "IT", // Department
    "New York", // Location
    "Full-time", // Employment Status
    "2023-01-15", // Hire Date
    "", // Termination Date
    "Male", // Gender
    "White", // Ethnicity/Race
    "Not a veteran", // Veteran Status
    "No disability", // Disability Status
    "75000", // Annual Salary
    "", // Hourly Rate
  ];

  return headers.join(",") + "\n" + sampleData.join(",");
}

/**
 * Validate a single staff record
 */
export function validateStaffRecord(staff: Partial<FrontendBillingStaff>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check required fields
  if (!staff.legalName?.trim()) {
    errors.push("Legal Name is required");
  }

  if (!staff.employeeId?.trim()) {
    errors.push("Employee ID is required");
  }

  // Validate email format if provided
  if (staff.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staff.email)) {
    errors.push("Invalid email format");
  }

  // Validate date formats
  if (staff.hireDate && isNaN(Date.parse(staff.hireDate))) {
    errors.push("Invalid hire date format");
  }

  if (staff.terminationDate && isNaN(Date.parse(staff.terminationDate))) {
    errors.push("Invalid termination date format");
  }

  // Validate numeric fields
  if (
    staff.salary !== undefined &&
    (isNaN(Number(staff.salary)) || Number(staff.salary) < 0)
  ) {
    errors.push("Salary must be a valid positive number");
  }

  if (
    staff.hourlyRate !== undefined &&
    (isNaN(Number(staff.hourlyRate)) || Number(staff.hourlyRate) < 0)
  ) {
    errors.push("Hourly rate must be a valid positive number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
