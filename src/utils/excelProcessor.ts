import { BillingStaff, FrontendBillingStaff } from "../integration/supabase/types/billing";

export interface ExcelProcessingResult {
  success: boolean;
  data?: Omit<FrontendBillingStaff, "id">[];
  errors?: string[];
  warnings?: string[];
  totalRows: number;
  processedRows: number;
}

export interface ColumnMapping {
  excelColumn: string;
  fieldName: keyof Omit<FrontendBillingStaff, "id">;
  required: boolean;
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
}

/**
 * Column mappings for staff Excel upload
 * Maps Excel column names to staff object field names
 * EXACT ORDINAL POSITION MATCHING EXTERNAL SYSTEM - DO NOT REORDER
 * Position 1 is ID (staff ID from external system, not a data field)
 */
export const STAFF_COLUMN_MAPPINGS: ColumnMapping[] = [
  // Position 2: FIRST_NAME
  {
    excelColumn: "FIRST_NAME",
    fieldName: "firstName",
    required: true,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 3: LAST_NAME
  {
    excelColumn: "LAST_NAME",
    fieldName: "lastName",
    required: true,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 4: MIDDLE_NAME
  {
    excelColumn: "MIDDLE_NAME",
    fieldName: "middleName",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 5: E_MAIL
  {
    excelColumn: "E_MAIL",
    fieldName: "email",
    required: true,
    validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    transformer: (value) => value?.trim().toLowerCase() || undefined,
  },
  // Position 6: DATE_OF_BIRTH
  {
    excelColumn: "DATE_OF_BIRTH",
    fieldName: "dateOfBirth",
    required: false,
    validator: (value) => !value || !isNaN(Date.parse(value)),
    transformer: (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
    },
  },
  // Position 7: PHONE_N
  {
    excelColumn: "PHONE_N",
    fieldName: "phoneNumber",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 8: ADDRESS
  {
    excelColumn: "ADDRESS",
    fieldName: "address",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 9: CITY
  {
    excelColumn: "CITY",
    fieldName: "city",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 10: STATE
  {
    excelColumn: "STATE",
    fieldName: "state",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 11: ZIP_CODE
  {
    excelColumn: "ZIP_CODE",
    fieldName: "zipCode",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 12: COUNTRY
  {
    excelColumn: "COUNTRY",
    fieldName: "country",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 13: GENDER
  {
    excelColumn: "GENDER",
    fieldName: "gender",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 14: MARITAL_STATUS
  {
    excelColumn: "MARITAL_STATUS",
    fieldName: "maritalStatus",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 15: DEPARTMENT
  {
    excelColumn: "DEPARTMENT",
    fieldName: "department",
    required: true,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 16: POSITION
  {
    excelColumn: "POSITION",
    fieldName: "jobTitle",
    required: true,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 17: EMPLOYMENT_STATUS
  {
    excelColumn: "EMPLOYMENT_STATUS",
    fieldName: "employmentStatus",
    required: true,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 18: HIRE_DATE
  {
    excelColumn: "HIRE_DATE",
    fieldName: "hireDate",
    required: true,
    validator: (value) => !value || !isNaN(Date.parse(value)),
    transformer: (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
    },
  },
  // Position 19: TERMINATION_DATE
  {
    excelColumn: "TERMINATION_DATE",
    fieldName: "terminationDate",
    required: false,
    validator: (value) => !value || !isNaN(Date.parse(value)),
    transformer: (value) => {
      if (!value) return undefined;
      const date = new Date(value);
      return isNaN(date.getTime()) ? undefined : date.toISOString().split('T')[0];
    },
  },
  // Position 20: SUPERVISOR
  {
    excelColumn: "SUPERVISOR",
    fieldName: "supervisor",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 21: WORK_LOCATION
  {
    excelColumn: "WORK_LOCATION",
    fieldName: "location",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 22: SALARY
  {
    excelColumn: "SALARY",
    fieldName: "salary",
    required: false,
    validator: (value) => !value || !isNaN(parseFloat(value)),
    transformer: (value) => {
      if (!value) return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    },
  },
  // Position 23: HOURLY_RATE
  {
    excelColumn: "HOURLY_RATE",
    fieldName: "hourlyRate",
    required: false,
    validator: (value) => !value || !isNaN(parseFloat(value)),
    transformer: (value) => {
      if (!value) return undefined;
      const num = parseFloat(value);
      return isNaN(num) ? undefined : num;
    },
  },
  // Position 24: PAY_FREQUENCY
  {
    excelColumn: "PAY_FREQUENCY",
    fieldName: "payFrequency",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 25: EMERGENCY_CONTACT_NAME
  {
    excelColumn: "EMERGENCY_CONTACT_NAME",
    fieldName: "emergencyContactName",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 26: EMERGENCY_CONTACT_PHONE
  {
    excelColumn: "EMERGENCY_CONTACT_PHONE",
    fieldName: "emergencyContactPhone",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 27: EMERGENCY_CONTACT_RELATIONSHIP
  {
    excelColumn: "EMERGENCY_CONTACT_RELATIONSHIP",
    fieldName: "emergencyContactRelationship",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 28: ETHNICITY_RACE
  {
    excelColumn: "ETHNICITY_RACE",
    fieldName: "ethnicityRace",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 29: VETERAN_STATUS
  {
    excelColumn: "VETERAN_STATUS",
    fieldName: "veteranStatus",
    required: false,
    transformer: (value) => value?.trim() || undefined,
  },
  // Position 30: DISABILITY_STATUS
  {
    excelColumn: "DISABILITY_STATUS",
    fieldName: "disabilityStatus",
    required: false,
    transformer: (value) => value?.trim() || undefined,
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
    const rowNumber = index + 1;
    const processedRow: Partial<FrontendBillingStaff> = {};
    let hasErrors = false;

    // Process each column mapping
    STAFF_COLUMN_MAPPINGS.forEach((mapping) => {
      const cellValue = row[mapping.excelColumn];

      // Skip empty optional fields
      if (!cellValue && !mapping.required) {
        return;
      }

      // Check required fields
      if (mapping.required && !cellValue) {
        errors.push(
          `Row ${rowNumber}: Missing required field '${mapping.excelColumn}'`
        );
        hasErrors = true;
        return;
      }

      // Validate field if validator exists
      if (mapping.validator && !mapping.validator(cellValue)) {
        errors.push(
          `Row ${rowNumber}: Invalid value '${cellValue}' for field '${mapping.excelColumn}'`
        );
        hasErrors = true;
        return;
      }

      // Transform the value
      const transformedValue = mapping.transformer
        ? mapping.transformer(cellValue)
        : cellValue;

      // Set the field value
      (processedRow as any)[mapping.fieldName] = transformedValue;
    });

    // Generate legal name from first and last name for backward compatibility
    if (processedRow.firstName && processedRow.lastName) {
      processedRow.legalName = `${processedRow.firstName} ${processedRow.lastName}`.trim();
    }

    // Only add row if no errors
    if (!hasErrors) {
      processedData.push(processedRow as Omit<FrontendBillingStaff, "id">);
    }
  });

  return {
    success: errors.length === 0,
    data: processedData,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    totalRows: rawData.length,
    processedRows: processedData.length,
  };
}

/**
 * Generate a CSV template with all the required and optional columns
 * EXACT ORDINAL POSITION MATCHING EXTERNAL SYSTEM
 * Position 1 is ID (staff ID from external system) - not included in template
 */
export function generateStaffTemplate(): string {
  // Add ID column header as position 1, then the mapped columns
  const headers = ["ID", ...STAFF_COLUMN_MAPPINGS.map((mapping) => mapping.excelColumn)];

  // Sample data row matching system format exactly
  // Position 1: ID (Staff ID)
  // Positions 2-30: Data fields
  const sampleData = [
    "1001", // ID (Position 1 - Staff ID)
    "John", // FIRST_NAME (Position 2)
    "Doe", // LAST_NAME (Position 3)
    "Michael", // MIDDLE_NAME (Position 4)
    "john.doe@company.com", // E_MAIL (Position 5)
    "1990-01-15", // DATE_OF_BIRTH (Position 6)
    "+1234567890", // PHONE_N (Position 7)
    "123 Main St", // ADDRESS (Position 8)
    "Anytown", // CITY (Position 9)
    "CA", // STATE (Position 10)
    "12345", // ZIP_CODE (Position 11)
    "USA", // COUNTRY (Position 12)
    "Male", // GENDER (Position 13)
    "Single", // MARITAL_STATUS (Position 14)
    "Engineering", // DEPARTMENT (Position 15)
    "Software Developer", // POSITION (Position 16)
    "Active", // EMPLOYMENT_STATUS (Position 17)
    "2023-01-01", // HIRE_DATE (Position 18)
    "", // TERMINATION_DATE (Position 19)
    "Jane Smith", // SUPERVISOR (Position 20)
    "Main Office", // WORK_LOCATION (Position 21)
    "75000", // SALARY (Position 22)
    "", // HOURLY_RATE (Position 23)
    "Monthly", // PAY_FREQUENCY (Position 24)
    "Jane Doe", // EMERGENCY_CONTACT_NAME (Position 25)
    "+1234567891", // EMERGENCY_CONTACT_PHONE (Position 26)
    "Spouse", // EMERGENCY_CONTACT_RELATIONSHIP (Position 27)
    "Caucasian", // ETHNICITY_RACE (Position 28)
    "No", // VETERAN_STATUS (Position 29)
    "No", // DISABILITY_STATUS (Position 30)
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

  // Required field validations
  if (!staff.firstName) errors.push("First name is required");
  if (!staff.lastName) errors.push("Last name is required");
  if (!staff.email) errors.push("Email is required");
  if (!staff.department) errors.push("Department is required");
  if (!staff.jobTitle) errors.push("Job title is required");
  if (!staff.employmentStatus) errors.push("Employment status is required");
  if (!staff.hireDate) errors.push("Hire date is required");

  // Email validation
  if (staff.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(staff.email)) {
    errors.push("Invalid email format");
  }

  // Date validations
  if (staff.hireDate && isNaN(Date.parse(staff.hireDate))) {
    errors.push("Invalid hire date format");
  }

  if (staff.terminationDate && isNaN(Date.parse(staff.terminationDate))) {
    errors.push("Invalid termination date format");
  }

  if (staff.dateOfBirth && isNaN(Date.parse(staff.dateOfBirth))) {
    errors.push("Invalid date of birth format");
  }

  // Numeric validations
  if (staff.salary && isNaN(Number(staff.salary))) {
    errors.push("Salary must be a number");
  }

  if (staff.hourlyRate && isNaN(Number(staff.hourlyRate))) {
    errors.push("Hourly rate must be a number");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
