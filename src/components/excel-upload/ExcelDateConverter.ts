/**
 * Utility functions for converting Excel date formats to database-compatible dates
 */

export const convertExcelDate = (value: any): string | null => {
  if (!value) return null;
  
  // If it's already a proper date string, return it
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.split('T')[0]; // Extract date part only
  }
  
  // If it's an Excel serial number (like 45688.99990740741)
  if (typeof value === 'number' || (typeof value === 'string' && /^\d+\.?\d*$/.test(value))) {
    const excelEpoch = new Date(1900, 0, 1); // Excel epoch starts at 1900-01-01
    const serialNumber = parseFloat(value.toString());
    
    // Excel incorrectly treats 1900 as a leap year, so we need to adjust
    const adjustedSerial = serialNumber > 59 ? serialNumber - 2 : serialNumber - 1;
    const jsDate = new Date(excelEpoch.getTime() + adjustedSerial * 24 * 60 * 60 * 1000);
    
    return jsDate.toISOString().split('T')[0];
  }
  
  // Try to parse as a regular date
  try {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0];
    }
  } catch (e) {
    console.warn('Could not parse date:', value);
  }
  
  return null;
};
