/**
 * Excel file processing utilities
 */

import * as XLSX from 'xlsx';

export interface ProcessedExcelData {
  data: any[];
  rowCount: number;
  isLargeDataset: boolean;
}

export class ExcelFileProcessor {
  static async processFile(file: File): Promise<ProcessedExcelData> {
    // Read and parse Excel file
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Processing ${jsonData.length} rows from Excel file`);
    
    // Validate data structure
    if (jsonData.length === 0) {
      throw new Error('No data found in the uploaded file');
    }

    const isLargeDataset = jsonData.length > 1000;
    if (isLargeDataset) {
      console.warn(`Large dataset detected: ${jsonData.length} rows. Processing in batches...`);
    }

    return {
      data: jsonData,
      rowCount: jsonData.length,
      isLargeDataset
    };
  }
}
