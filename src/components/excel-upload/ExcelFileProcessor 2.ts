/**
 * Excel file processing utilities
 */

import { readExcelFile } from '@/utils/excelJSHelper';

export interface ProcessedExcelData {
  data: any[];
  rowCount: number;
  isLargeDataset: boolean;
}

export class ExcelFileProcessor {
  static async processFile(file: File): Promise<ProcessedExcelData> {
    // Read and parse Excel file
    const data = await file.arrayBuffer();
    const { data: jsonData } = await readExcelFile(data);

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
