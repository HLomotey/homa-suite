import { CreateExternalStaff } from '../integration/supabase/types/external-staff';

export interface ExternalStaffExcelProcessingResult {
  success: boolean;
  data?: CreateExternalStaff[];
  errors?: string[];
  warnings?: string[];
  totalRows: number;
  processedRows: number;
}

export interface ExternalStaffColumnMapping {
  excelColumn: string;
  fieldName: keyof CreateExternalStaff;
  required: boolean;
  validator?: (value: any) => boolean;
  transformer?: (value: any) => any;
}

/**
 * EXACT 31 columns matching external system structure
 * Column order MUST match external system - DO NOT REORDER
 */
export const EXTERNAL_STAFF_COLUMN_MAPPINGS: ExternalStaffColumnMapping[] = [
  // Column 2: FIRST_NAME
  {
    excelColumn: "FIRST_NAME",
    fieldName: "first_name",
    required: true,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 3: LAST_NAME
  {
    excelColumn: "LAST_NAME", 
    fieldName: "last_name",
    required: true,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 4: MIDDLE_NAME
  {
    excelColumn: "MIDDLE_NAME",
    fieldName: "middle_name",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 5: E_MAIL
  {
    excelColumn: "E_MAIL",
    fieldName: "e_mail",
    required: false,
    validator: (value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    transformer: (value) => value?.toString().trim().toLowerCase() || null,
  },
  // Column 6: DATE_OF_BIRTH
  {
    excelColumn: "DATE_OF_BIRTH",
    fieldName: "date_of_birth",
    required: false,
    transformer: (value) => {
      if (!value) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    },
  },
  // Column 7: PHONE_N
  {
    excelColumn: "PHONE_N",
    fieldName: "phone_n",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 8: ADDRESS
  {
    excelColumn: "ADDRESS",
    fieldName: "address",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 9: CITY
  {
    excelColumn: "CITY",
    fieldName: "city",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 10: STATE
  {
    excelColumn: "STATE",
    fieldName: "state",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 11: ZIP_CODE
  {
    excelColumn: "ZIP_CODE",
    fieldName: "zip_code",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 12: COUNTRY
  {
    excelColumn: "COUNTRY",
    fieldName: "country",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 13: GENDER
  {
    excelColumn: "GENDER",
    fieldName: "gender",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 14: MARITAL_STATUS
  {
    excelColumn: "MARITAL_STATUS",
    fieldName: "marital_status",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 15: DEPARTMENT
  {
    excelColumn: "DEPARTMENT",
    fieldName: "department",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 16: POSITION
  {
    excelColumn: "POSITION",
    fieldName: "position",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 17: EMPLOYMENT_STATUS
  {
    excelColumn: "EMPLOYMENT_STATUS",
    fieldName: "employment_status",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 18: HIRE_DATE
  {
    excelColumn: "HIRE_DATE",
    fieldName: "hire_date",
    required: false,
    transformer: (value) => {
      if (!value) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    },
  },
  // Column 19: TERMINATION_DATE
  {
    excelColumn: "TERMINATION_DATE",
    fieldName: "termination_date",
    required: false,
    transformer: (value) => {
      if (!value) return null;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
    },
  },
  // Column 20: SUPERVISOR
  {
    excelColumn: "SUPERVISOR",
    fieldName: "supervisor",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 21: WORK_LOCATION
  {
    excelColumn: "WORK_LOCATION",
    fieldName: "work_location",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 22: SALARY
  {
    excelColumn: "SALARY",
    fieldName: "salary",
    required: false,
    validator: (value) => !value || !isNaN(parseFloat(value)),
    transformer: (value) => {
      if (!value) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    },
  },
  // Column 23: HOURLY_RATE
  {
    excelColumn: "HOURLY_RATE",
    fieldName: "hourly_rate",
    required: false,
    validator: (value) => !value || !isNaN(parseFloat(value)),
    transformer: (value) => {
      if (!value) return null;
      const num = parseFloat(value);
      return isNaN(num) ? null : num;
    },
  },
  // Column 24: PAY_FREQUENCY
  {
    excelColumn: "PAY_FREQUENCY",
    fieldName: "pay_frequency",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 25: EMERGENCY_CONTACT_NAME
  {
    excelColumn: "EMERGENCY_CONTACT_NAME",
    fieldName: "emergency_contact_name",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 26: EMERGENCY_CONTACT_PHONE
  {
    excelColumn: "EMERGENCY_CONTACT_PHONE",
    fieldName: "emergency_contact_phone",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 27: EMERGENCY_CONTACT_RELATIONSHIP
  {
    excelColumn: "EMERGENCY_CONTACT_RELATIONSHIP",
    fieldName: "emergency_contact_relationship",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 28: ETHNICITY_RACE
  {
    excelColumn: "ETHNICITY_RACE",
    fieldName: "ethnicity_race",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 29: VETERAN_STATUS
  {
    excelColumn: "VETERAN_STATUS",
    fieldName: "veteran_status",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 30: DISABILITY_STATUS
  {
    excelColumn: "DISABILITY_STATUS",
    fieldName: "disability_status",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
  // Column 31: EXTERNAL_STAFF_ID
  {
    excelColumn: "EXTERNAL_STAFF_ID",
    fieldName: "external_staff_id",
    required: false,
    transformer: (value) => value?.toString().trim() || null,
  },
];

/**
 * Process Excel data for external staff import
 */
export const processExternalStaffExcelData = (
  excelData: any[]
): ExternalStaffExcelProcessingResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const processedData: CreateExternalStaff[] = [];

  if (!excelData || excelData.length === 0) {
    return {
      success: false,
      errors: ["No data found in Excel file"],
      totalRows: 0,
      processedRows: 0,
    };
  }

  // Skip header row if it exists
  const dataRows = excelData.slice(1);

  dataRows.forEach((row, index) => {
    const rowNumber = index + 2; // +2 because we skipped header and arrays are 0-indexed
    const staffRecord: CreateExternalStaff = {};
    const rowErrors: string[] = [];
    const rowWarnings: string[] = [];

    // Process each column mapping
    EXTERNAL_STAFF_COLUMN_MAPPINGS.forEach((mapping) => {
      const cellValue = row[mapping.excelColumn];

      // Check required fields
      if (mapping.required && (!cellValue || cellValue.toString().trim() === '')) {
        rowErrors.push(`Row ${rowNumber}: ${mapping.excelColumn} is required but empty`);
        return;
      }

      // Skip empty optional fields
      if (!cellValue || cellValue.toString().trim() === '') {
        return;
      }

      // Validate if validator exists
      if (mapping.validator && !mapping.validator(cellValue)) {
        rowErrors.push(`Row ${rowNumber}: Invalid ${mapping.excelColumn} value: ${cellValue}`);
        return;
      }

      // Transform the value
      try {
        const transformedValue = mapping.transformer 
          ? mapping.transformer(cellValue) 
          : cellValue;
        
        if (transformedValue !== null && transformedValue !== undefined) {
          (staffRecord as any)[mapping.fieldName] = transformedValue;
        }
      } catch (error) {
        rowErrors.push(`Row ${rowNumber}: Error processing ${mapping.excelColumn}: ${error}`);
      }
    });

    // Add row-level validation
    if (!staffRecord.first_name && !staffRecord.last_name) {
      rowWarnings.push(`Row ${rowNumber}: No name information provided`);
    }

    if (rowErrors.length === 0) {
      processedData.push(staffRecord);
    }

    errors.push(...rowErrors);
    warnings.push(...rowWarnings);
  });

  return {
    success: errors.length === 0,
    data: processedData,
    errors: errors.length > 0 ? errors : undefined,
    warnings: warnings.length > 0 ? warnings : undefined,
    totalRows: dataRows.length,
    processedRows: processedData.length,
  };
};

/**
 * Generate Excel template for external staff import
 */
export const generateExternalStaffExcelTemplate = () => {
  const headers = EXTERNAL_STAFF_COLUMN_MAPPINGS.map(mapping => mapping.excelColumn);
  
  // Sample data row
  const sampleData = {
    FIRST_NAME: "John",
    LAST_NAME: "Doe",
    MIDDLE_NAME: "Michael",
    E_MAIL: "john.doe@company.com",
    DATE_OF_BIRTH: "1990-01-15",
    PHONE_N: "+1-555-123-4567",
    ADDRESS: "123 Main Street",
    CITY: "New York",
    STATE: "NY",
    ZIP_CODE: "10001",
    COUNTRY: "USA",
    GENDER: "Male",
    MARITAL_STATUS: "Single",
    DEPARTMENT: "Engineering",
    POSITION: "Software Developer",
    EMPLOYMENT_STATUS: "Active",
    HIRE_DATE: "2023-01-15",
    TERMINATION_DATE: "",
    SUPERVISOR: "Jane Smith",
    WORK_LOCATION: "New York Office",
    SALARY: "75000",
    HOURLY_RATE: "",
    PAY_FREQUENCY: "Monthly",
    EMERGENCY_CONTACT_NAME: "Jane Doe",
    EMERGENCY_CONTACT_PHONE: "+1-555-987-6543",
    EMERGENCY_CONTACT_RELATIONSHIP: "Spouse",
    ETHNICITY_RACE: "Caucasian",
    VETERAN_STATUS: "No",
    DISABILITY_STATUS: "No",
    EXTERNAL_STAFF_ID: "EXT001",
  };

  return {
    headers,
    sampleData: headers.map(header => sampleData[header as keyof typeof sampleData] || ""),
  };
};

/**
 * Validate external staff Excel file structure
 */
export const validateExternalStaffExcelStructure = (headers: string[]): {
  isValid: boolean;
  missingColumns: string[];
  extraColumns: string[];
} => {
  const expectedHeaders = EXTERNAL_STAFF_COLUMN_MAPPINGS.map(mapping => mapping.excelColumn);
  const missingColumns = expectedHeaders.filter(header => !headers.includes(header));
  const extraColumns = headers.filter(header => !expectedHeaders.includes(header));

  return {
    isValid: missingColumns.length === 0,
    missingColumns,
    extraColumns,
  };
};
