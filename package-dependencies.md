# Required Dependencies for Reports Module

## ⚠️ Security Notice
The `xlsx` package has known security vulnerabilities. Consider using `exceljs` as a safer alternative.

## Option 1: Safer Alternative (Recommended)
```bash
npm install exceljs jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

## Option 2: Current Implementation (Security Risk)
```bash
npm install xlsx jspdf jspdf-autotable
npm install --save-dev @types/jspdf
```

These packages provide:
- `exceljs`: Secure Excel file generation and manipulation (recommended)
- `xlsx`: Excel file generation (has security vulnerabilities)
- `jspdf`: PDF generation
- `jspdf-autotable`: Table generation for PDFs
- `@types/jspdf`: TypeScript types for jsPDF

## Migration to ExcelJS
If switching to ExcelJS, update the useReports hook to use ExcelJS API instead of xlsx.
