/**
 * ExcelJS utility functions to replace XLSX functionality
 * Provides secure Excel file processing without vulnerabilities
 */
import * as ExcelJS from 'exceljs';

export interface ExcelReadResult {
  data: any[];
  sheetNames: string[];
}

/**
 * Parse CSV file and convert to JSON data
 * Fallback for files that appear to be CSV format
 */
async function parseCSVFile(fileData: ArrayBuffer): Promise<ExcelReadResult> {
  const textDecoder = new TextDecoder();
  const csvContent = textDecoder.decode(fileData);
  
  const lines = csvContent.split('\n').filter(line => line.trim().length > 0);
  if (lines.length === 0) {
    throw new Error('No data found in CSV file');
  }
  
  // Parse headers from first line
  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  
  // Parse data rows
  const data: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(value => value.trim().replace(/"/g, ''));
    const rowData: any = {};
    
    headers.forEach((header, index) => {
      if (header && values[index] !== undefined) {
        rowData[header] = values[index];
      }
    });
    
    if (Object.keys(rowData).length > 0) {
      data.push(rowData);
    }
  }
  
  return {
    data,
    sheetNames: ['Sheet1']
  };
}

/**
 * Read Excel file and convert to JSON data
 * Replaces XLSX.read and XLSX.utils.sheet_to_json
 */
export async function readExcelFile(fileData: ArrayBuffer): Promise<ExcelReadResult> {
  // Validate file size
  if (fileData.byteLength === 0) {
    throw new Error('File is empty');
  }

  // First try to detect if it's a CSV file by checking content
  const textDecoder = new TextDecoder();
  const fileContent = textDecoder.decode(fileData.slice(0, 1000)); // Check first 1KB
  
  // If it looks like CSV (contains commas and no binary data), try CSV parsing
  if (fileContent.includes(',') && !fileContent.includes('\x00') && fileContent.split('\n').length > 1) {
    try {
      return await parseCSVFile(fileData);
    } catch (csvError) {
      console.warn('CSV parsing failed, trying Excel format:', csvError);
    }
  }

  let workbook: ExcelJS.Workbook;
  let worksheet: ExcelJS.Worksheet;

  try {
    workbook = new ExcelJS.Workbook();
    
    // Try to load as Excel file
    await workbook.xlsx.load(fileData);
    
    worksheet = workbook.getWorksheet(1); // Get first worksheet
    if (!worksheet) {
      throw new Error('No worksheet found in Excel file');
    }
  } catch (error: any) {
    // Try CSV as fallback
    try {
      return await parseCSVFile(fileData);
    } catch (csvError) {
      // If both Excel and CSV parsing fail, provide helpful error
      if (error.message.includes('central directory')) {
        throw new Error('File format not supported. Please upload a valid .xlsx, .xls, or .csv file.');
      }
      if (error.message.includes('signature')) {
        throw new Error('File does not appear to be a valid Excel or CSV file. Please check the file format.');
      }
      throw new Error(`Failed to read file: ${error.message}. Supported formats: .xlsx, .xls, .csv`);
    }
  }
  
  const data: any[] = [];
  const headers: string[] = [];
  
  // Get headers from first row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell, colNumber) => {
    headers[colNumber - 1] = cell.text;
  });
  
  // Process data rows
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // Skip header row
    
    const rowData: any = {};
    row.eachCell((cell, colNumber) => {
      const header = headers[colNumber - 1];
      if (header) {
        rowData[header] = cell.value;
      }
    });
    
    if (Object.keys(rowData).length > 0) {
      data.push(rowData);
    }
  });
  
  return {
    data,
    sheetNames: workbook.worksheets.map(ws => ws.name)
  };
}

/**
 * Create Excel file from JSON data
 * Replaces XLSX.utils.json_to_sheet and XLSX.write
 */
export async function createExcelFile(data: any[], sheetName: string = 'Sheet1'): Promise<ArrayBuffer> {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);
  
  if (data.length === 0) {
    throw new Error('No data provided for Excel file');
  }
  
  // Add headers
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);
  
  // Add data rows
  data.forEach(row => {
    const values = headers.map(header => row[header]);
    worksheet.addRow(values);
  });
  
  // Auto-fit columns
  worksheet.columns.forEach(column => {
    column.width = 15;
  });
  
  return await workbook.xlsx.writeBuffer();
}

/**
 * Download Excel file
 * Replaces XLSX.writeFile
 */
export async function downloadExcelFile(data: any[], filename: string, sheetName: string = 'Sheet1'): Promise<void> {
  const buffer = await createExcelFile(data, sheetName);
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
