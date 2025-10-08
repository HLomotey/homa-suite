import { useState, useCallback } from 'react';
import { supabase } from '@/integration/supabase';
import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface ReportFilters {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  // Common filters
  status: string[];
  location: string[];
  reportType: string;
  exportFormat: 'excel' | 'pdf';
  
  // Housing-specific filters
  housingAgreement?: boolean;
  transportationAgreement?: boolean;
  flightAgreement?: boolean;
  busCardAgreement?: boolean;
  rentAmountRange?: { min: number; max: number };
  
  // Transportation-specific filters
  maintenanceCategory?: string[];
  vehicleStatus?: string[];
  routeStatus?: string[];
  
  // HR-specific filters
  positionStatus?: string[];
  department?: string[];
  jobTitle?: string[];
  workerCategory?: string[];
  
  // Finance-specific filters
  paymentStatus?: string[];
  billingType?: string[];
  amountRange?: { min: number; max: number };
  
  // Operations-specific filters
  jobOrderStatus?: string[];
  priority?: string[];
  assignedTo?: string[];
}

interface ReportData {
  title: string;
  data: any[];
  columns: string[];
  summary?: Record<string, any>;
}

export function useReportsSecure() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateHousingReport = useCallback(async (filters: ReportFilters): Promise<ReportData> => {
    const { dateRange, status } = filters;
    
    let query = supabase
      .from('assignments')
      .select(`
        *,
        properties!inner(
          id,
          title,
          address,
          rent_amount
        ),
        rooms!inner(
          id,
          name,
          rent_amount
        ),
        security_deposits(
          id,
          total_amount,
          payment_status,
          security_deposit_deductions(
            id,
            amount,
            status,
            scheduled_date
          )
        )
      `)
      .gte('start_date', dateRange.startDate)
      .lte('start_date', dateRange.endDate);

    if (status.length > 0 && !status.includes('all')) {
      query = query.in('status', status);
    }

    const { data, error } = await query;
    
    if (error) throw error;

    const reportData = (data as any[])?.map((assignment: any) => ({
      'Tenant Name': assignment.tenant_name || '',
      'Property': assignment.properties?.title || '',
      'Room': assignment.rooms?.name || '',
      'Status': assignment.status || '',
      'Start Date': assignment.start_date || '',
      'End Date': assignment.end_date || 'Current',
      'Rent Amount': assignment.rent_amount || 0,
      'Security Deposit': assignment.security_deposits?.[0]?.total_amount || 0,
      'Deposit Status': assignment.security_deposits?.[0]?.payment_status || 'N/A'
    })) || [];

    return {
      title: 'Housing Assignment Report',
      data: reportData,
      columns: ['Tenant Name', 'Property', 'Room', 'Status', 'Start Date', 'End Date', 'Rent Amount', 'Security Deposit', 'Deposit Status'],
      summary: {
        totalAssignments: reportData.length,
        totalRentAmount: reportData.reduce((sum, item) => sum + (item['Rent Amount'] || 0), 0),
        totalDeposits: reportData.reduce((sum, item) => sum + (item['Security Deposit'] || 0), 0)
      }
    };
  }, []);

  const generateTransportationReport = useCallback(async (filters: ReportFilters): Promise<ReportData> => {
    const { dateRange } = filters;
    
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        properties!inner(title)
      `)
      .eq('transportation_agreement', true)
      .gte('start_date', dateRange.startDate)
      .lte('start_date', dateRange.endDate);
    
    if (error) throw error;

    const reportData = (data as any[])?.map((assignment: any) => ({
      'Staff Name': assignment.staff_name || assignment.tenant_name || '',
      'Property': assignment.properties?.title || '',
      'Transport Amount': assignment.transport_amount || 0,
      'Bus Card Amount': assignment.bus_card_amount || 0,
      'Status': assignment.status || '',
      'Start Date': assignment.start_date || ''
    })) || [];

    return {
      title: 'Transportation Report',
      data: reportData,
      columns: ['Staff Name', 'Property', 'Transport Amount', 'Bus Card Amount', 'Status', 'Start Date'],
      summary: {
        totalStaff: reportData.length,
        totalTransportAmount: reportData.reduce((sum, item) => sum + (item['Transport Amount'] || 0), 0),
        totalBusCardAmount: reportData.reduce((sum, item) => sum + (item['Bus Card Amount'] || 0), 0)
      }
    };
  }, []);

  const generateFinanceReport = useCallback(async (filters: ReportFilters): Promise<ReportData> => {
    const { dateRange } = filters;
    
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .gte('start_date', dateRange.startDate)
      .lte('start_date', dateRange.endDate);
    
    if (error) throw error;

    const reportData = (data as any[])?.map((assignment: any) => ({
      'Property ID': assignment.property_id || '',
      'Tenant': assignment.tenant_name || '',
      'Rent Amount': assignment.rent_amount || 0,
      'Security Deposit': assignment.rent_deposit_amount || 0,
      'Transport Amount': assignment.transport_amount || 0,
      'Bus Card Amount': assignment.bus_card_amount || 0,
      'Total Revenue': (assignment.rent_amount || 0) + (assignment.transport_amount || 0) + (assignment.bus_card_amount || 0),
      'Status': assignment.status || ''
    })) || [];

    return {
      title: 'Financial Summary Report',
      data: reportData,
      columns: ['Property ID', 'Tenant', 'Rent Amount', 'Security Deposit', 'Transport Amount', 'Bus Card Amount', 'Total Revenue', 'Status'],
      summary: {
        totalRevenue: reportData.reduce((sum, item) => sum + (item['Total Revenue'] || 0), 0),
        totalRent: reportData.reduce((sum, item) => sum + (item['Rent Amount'] || 0), 0),
        totalDeposits: reportData.reduce((sum, item) => sum + (item['Security Deposit'] || 0), 0)
      }
    };
  }, []);

  const generateHRReport = useCallback(async (filters: ReportFilters): Promise<ReportData> => {
    const { data, error } = await supabase
      .from('external_staff')
      .select('*')
      .is('TERMINATION DATE', null); // Active staff only
    
    if (error) throw error;

    const reportData = (data as any[])?.map((staff: any) => ({
      'Associate ID': staff['ASSOCIATE ID'] || '',
      'First Name': staff['PAYROLL FIRST NAME'] || '',
      'Last Name': staff['PAYROLL LAST NAME'] || '',
      'Job Title': staff['JOB TITLE'] || '',
      'Department': staff['HOME DEPARTMENT'] || '',
      'Email': staff['WORK E-MAIL'] || '',
      'Hire Date': staff['HIRE DATE'] || '',
      'Location': staff['LOCATION'] || '',
      'Housing Benefit': staff['HOUSING'] || 'No',
      'Transportation Benefit': staff['TRANSPORTATION'] || 'No',
      'Flight Benefit': staff['FLIGHT_BENEFIT'] || 'No'
    })) || [];

    return {
      title: 'HR Staff Report',
      data: reportData,
      columns: ['Associate ID', 'First Name', 'Last Name', 'Job Title', 'Department', 'Email', 'Hire Date', 'Location', 'Housing Benefit', 'Transportation Benefit', 'Flight Benefit'],
      summary: {
        totalStaff: reportData.length,
        housingBenefits: reportData.filter(s => s['Housing Benefit'] === 'Yes').length,
        transportBenefits: reportData.filter(s => s['Transportation Benefit'] === 'Yes').length,
        flightBenefits: reportData.filter(s => s['Flight Benefit'] === 'Yes').length
      }
    };
  }, []);

  const generateOperationsReport = useCallback(async (filters: ReportFilters): Promise<ReportData> => {
    const { dateRange } = filters;
    
    const { data, error } = await supabase
      .from('job_orders')
      .select('*')
      .gte('created_at', dateRange.startDate)
      .lte('created_at', dateRange.endDate);
    
    if (error) throw error;

    const reportData = (data as any[])?.map((jobOrder: any) => ({
      'Job Order ID': jobOrder.id || '',
      'Title': jobOrder.title || '',
      'Description': jobOrder.description || '',
      'Status': jobOrder.status || '',
      'Priority': jobOrder.priority || '',
      'Created Date': jobOrder.created_at || '',
      'Due Date': jobOrder.due_date || '',
      'Assigned To': jobOrder.assigned_to || '',
      'Location': jobOrder.location || ''
    })) || [];

    return {
      title: 'Operations Job Orders Report',
      data: reportData,
      columns: ['Job Order ID', 'Title', 'Description', 'Status', 'Priority', 'Created Date', 'Due Date', 'Assigned To', 'Location'],
      summary: {
        totalJobOrders: reportData.length,
        completedOrders: reportData.filter(j => j.Status === 'completed').length,
        pendingOrders: reportData.filter(j => j.Status === 'pending').length,
        inProgressOrders: reportData.filter(j => j.Status === 'in_progress').length
      }
    };
  }, []);

  const exportToExcelSecure = useCallback(async (reportData: ReportData, filename: string) => {
    const workbook = new ExcelJS.Workbook();
    
    // Create main data sheet
    const worksheet = workbook.addWorksheet('Data');
    
    // Add headers
    const headers = reportData.columns;
    worksheet.addRow(headers);
    
    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' }
    };
    
    // Add data rows
    reportData.data.forEach(row => {
      const values = headers.map(header => row[header] || '');
      worksheet.addRow(values);
    });
    
    // Auto-fit columns
    worksheet.columns.forEach(column => {
      column.width = 15;
    });
    
    // Create summary sheet if available
    if (reportData.summary) {
      const summarySheet = workbook.addWorksheet('Summary');
      summarySheet.addRow(['Metric', 'Value']);
      
      const summaryHeaderRow = summarySheet.getRow(1);
      summaryHeaderRow.font = { bold: true };
      summaryHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
      };
      
      Object.entries(reportData.summary).forEach(([key, value]) => {
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        summarySheet.addRow([label, value]);
      });
      
      summarySheet.columns.forEach(column => {
        column.width = 20;
      });
    }
    
    // Generate buffer and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.xlsx`;
    link.click();
    window.URL.revokeObjectURL(url);
  }, []);

  const exportToPDF = useCallback((reportData: ReportData, filename: string) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(16);
    doc.text(reportData.title, 20, 20);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);
    
    // Add summary if available
    let yPosition = 40;
    if (reportData.summary) {
      doc.setFontSize(12);
      doc.text('Summary:', 20, yPosition);
      yPosition += 10;
      
      Object.entries(reportData.summary).forEach(([key, value]) => {
        doc.setFontSize(10);
        const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
        doc.text(`${label}: ${value}`, 20, yPosition);
        yPosition += 6;
      });
      yPosition += 10;
    }
    
    // Add table
    (doc as any).autoTable({
      head: [reportData.columns],
      body: reportData.data.map(row => reportData.columns.map(col => row[col] || '')),
      startY: yPosition,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save(`${filename}.pdf`);
  }, []);

  const generateReport = useCallback(async (module: string, reportType: string, filters: ReportFilters) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      let reportData: ReportData;
      
      switch (module) {
        case 'housing':
          reportData = await generateHousingReport(filters);
          break;
        case 'transportation':
          reportData = await generateTransportationReport(filters);
          break;
        case 'finance':
          reportData = await generateFinanceReport(filters);
          break;
        case 'hr':
          reportData = await generateHRReport(filters);
          break;
        case 'operations':
          reportData = await generateOperationsReport(filters);
          break;
        default:
          throw new Error(`Unsupported module: ${module}`);
      }
      
      const filename = `${module}_${reportType}_${new Date().toISOString().split('T')[0]}`;
      
      if (filters.exportFormat === 'excel') {
        await exportToExcelSecure(reportData, filename);
      } else {
        exportToPDF(reportData, filename);
      }
      
      return reportData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, [generateHousingReport, generateTransportationReport, generateFinanceReport, generateHRReport, generateOperationsReport, exportToExcelSecure, exportToPDF]);

  return {
    generateReport,
    isGenerating,
    error,
    clearError: () => setError(null)
  };
}
