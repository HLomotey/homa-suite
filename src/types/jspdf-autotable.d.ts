declare module 'jspdf-autotable' {
  import { jsPDF } from 'jspdf';

  interface AutoTableOptions {
    head?: any[][];
    body?: any[][];
    startY?: number;
    styles?: {
      fontSize?: number;
      cellPadding?: number;
      overflow?: string;
      valign?: string;
      halign?: string;
    };
    headStyles?: {
      fillColor?: number[] | string;
      textColor?: number[] | string;
      fontSize?: number;
      fontStyle?: string;
    };
    bodyStyles?: {
      fillColor?: number[] | string;
      textColor?: number[] | string;
    };
    alternateRowStyles?: {
      fillColor?: number[] | string;
    };
    columnStyles?: {
      [key: number]: {
        cellWidth?: number | string;
        halign?: string;
      };
    };
    margin?: {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };
    pageBreak?: string;
    showHead?: string;
    showFoot?: string;
    tableWidth?: string | number;
    theme?: string;
  }

  function autoTable(doc: jsPDF, options: AutoTableOptions): void;
  export default autoTable;
}
