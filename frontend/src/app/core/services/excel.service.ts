import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

export interface ExcelPreview {
  headers: string[];
  rows: any[][];
  sheetName: string;
  totalRows: number;
}

export interface ColumnMapping {
  excelColumn: string;
  fieldName: string;
  required: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  /**
   * Read Excel file and return preview data
   */
  async previewFile(file: File, sheetIndex: number = 0): Promise<ExcelPreview> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          const sheetName = workbook.SheetNames[sheetIndex];
          const worksheet = workbook.Sheets[sheetName];

          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: '',
          }) as any[][];

          if (jsonData.length === 0) {
            reject(new Error('Excel file is empty'));
            return;
          }

          // First row is headers
          const headers = jsonData[0].map((h: any) => String(h || '').trim());
          const rows = jsonData.slice(1).filter((row) => row.some((cell) => cell !== ''));

          resolve({
            headers,
            rows,
            sheetName,
            totalRows: rows.length,
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Get all sheet names from Excel file
   */
  async getSheetNames(file: File): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          resolve(workbook.SheetNames);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Generate Excel file from data
   */
  generateExcel(data: any[], headers: string[], filename: string = 'export.xlsx'): void {
    const worksheet = XLSX.utils.json_to_sheet(data, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Write file
    XLSX.writeFile(workbook, filename);
  }

  /**
   * Generate template Excel file with headers
   */
  generateTemplate(headers: string[], filename: string = 'template.xlsx'): void {
    const worksheet = XLSX.utils.aoa_to_sheet([headers]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    XLSX.writeFile(workbook, filename);
  }

  /**
   * Map Excel columns to field names using mapping configuration
   */
  mapData(preview: ExcelPreview, mappings: ColumnMapping[]): any[] {
    const mappedData: any[] = [];

    for (const row of preview.rows) {
      const mappedRow: any = {};

      for (const mapping of mappings) {
        const columnIndex = preview.headers.indexOf(mapping.excelColumn);
        if (columnIndex >= 0) {
          mappedRow[mapping.fieldName] = row[columnIndex];
        } else if (mapping.required) {
          // Skip row if required field is missing
          return mappedData;
        }
      }

      mappedData.push(mappedRow);
    }

    return mappedData;
  }
}

