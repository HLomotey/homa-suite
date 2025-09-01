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
 * Read Excel file and convert to JSON data
 * Replaces XLSX.read and XLSX.utils.sheet_to_json
 */
export async function readExcelFile(fileData: ArrayBuffer): Promise<ExcelReadResult> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(fileData);
  
  const worksheet = workbook.getWorksheet(1); // Get first worksheet
  if (!worksheet) {
    throw new Error('No worksheet found in Excel file');
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
