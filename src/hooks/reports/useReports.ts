import { useState, useCallback } from 'react';
import { supabase } from '@/integration/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export function useReports() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateHousingReport = useCallback(async (filters: ReportFilters): Promise<ReportData> => {
    const { dateRange, status, reportType } = filters;
    
    // Check if this is the comprehensive housing report
    if (reportType === 'comprehensive_housing') {
      // Use the housing report view for comprehensive data
      let query = supabase
        .from('housing_report_view')
        .select('*');

      // Filter by date range (year and month)
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      query = query
        .gte('report_year', startDate.getFullYear())
        .lte('report_year', endDate.getFullYear());

      if (startDate.getFullYear() === endDate.getFullYear()) {
        query = query
          .gte('report_month_num', startDate.getMonth() + 1)
          .lte('report_month_num', endDate.getMonth() + 1);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Comprehensive housing report query error:', error);
        throw new Error(`Failed to fetch comprehensive housing data: ${error.message}`);
      }

      const reportData = (data as any[])?.map((row: any) => ({
        'State': row.state || '',
        'Housing Capacity': row.housing_capacity || 0,
        'Housing Occupancy': row.housing_occupancy || 0,
        'Rent Per Employee': `$${(row.rent_per_employee || 0).toFixed(2)}`,
        'Property': row.property || '',
        'Propane': `$${(row.propane || 0).toFixed(2)}`,
        'Water/Sewer & Disposal': `$${(row.water_sewer_disposal || 0).toFixed(2)}`,
        'Electricity': `$${(row.electricity || 0).toFixed(2)}`,
        'Total Utilities': `$${(row.total_utilities || 0).toFixed(2)}`,
        'Monthly Rent Charges': `$${(row.monthly_rent_charges || 0).toFixed(2)}`,
        'Housing Maintenance': `$${(row.housing_maintenance || 0).toFixed(2)}`,
        'Total Cost (TC)': `$${(row.total_cost || 0).toFixed(2)}`,
        'Expected Rent - Occupancy (RTC)': `$${(row.expected_rent_occupancy || 0).toFixed(2)}`,
        'Expected Rent - Capacity (RRO)': `$${(row.expected_rent_capacity || 0).toFixed(2)}`,
        'Actual Payroll Deductions (APD)': `$${(row.actual_payroll_deductions || 0).toFixed(2)}`,
        'Variance - APD vs RTC': `$${(row.variance_apd_rtc || 0).toFixed(2)}`,
        'Variance - APD vs RRO': `$${(row.variance_apd_rro || 0).toFixed(2)}`
      })) || [];

      return {
        title: 'Comprehensive Housing Report with Billing & Utilities',
        data: reportData,
        columns: [
          'State', 'Housing Capacity', 'Housing Occupancy', 'Rent Per Employee', 'Property',
          'Propane', 'Water/Sewer & Disposal', 'Electricity', 'Total Utilities',
          'Monthly Rent Charges', 'Housing Maintenance', 'Total Cost (TC)',
          'Expected Rent - Occupancy (RTC)', 'Expected Rent - Capacity (RRO)',
          'Actual Payroll Deductions (APD)', 'Variance - APD vs RTC', 'Variance - APD vs RRO'
        ],
        summary: {
          totalProperties: reportData.length,
          totalCapacity: reportData.reduce((sum, item) => sum + (parseInt(item['Housing Capacity']) || 0), 0),
          totalOccupancy: reportData.reduce((sum, item) => sum + (parseInt(item['Housing Occupancy']) || 0), 0),
          totalUtilities: reportData.reduce((sum, item) => sum + (parseFloat(item['Total Utilities'].replace('$', '')) || 0), 0),
          totalRentCharges: reportData.reduce((sum, item) => sum + (parseFloat(item['Monthly Rent Charges'].replace('$', '')) || 0), 0)
        }
      };
    }

    // Default assignment-based housing report
    let query = supabase
      .from('assignments')
      .select(`
        *,
        security_deposits(
          id,
          total_amount,
          payment_status
        )
      `)
      .gte('start_date', dateRange.startDate)
      .lte('start_date', dateRange.endDate);

    if (status.length > 0 && !status.includes('all')) {
      query = query.in('status', status);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Housing report query error:', error);
      throw new Error(`Failed to fetch housing data: ${error.message}`);
    }

    const reportData = (data as any[])?.map((assignment: any) => ({
      'Tenant Name': assignment.tenant_name || '',
      'Property': assignment.property_name || '',
      'Room': assignment.room_name || '',
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
      .select('*')
      .eq('transportation_agreement', true)
      .gte('start_date', dateRange.startDate)
      .lte('start_date', dateRange.endDate);
    
    if (error) throw error;

    const reportData = (data as any[])?.map((assignment: any) => ({
      'Staff Name': assignment.staff_name || assignment.tenant_name || '',
      'Property': assignment.property_name || '',
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

  const exportToExcel = useCallback((reportData: ReportData, filename: string) => {
    const workbook = XLSX.utils.book_new();
    
    // Create main data sheet
    const worksheet = XLSX.utils.json_to_sheet(reportData.data);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Create summary sheet if available
    if (reportData.summary) {
      const summaryData = Object.entries(reportData.summary).map(([key, value]) => ({
        Metric: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        Value: value
      }));
      const summarySheet = XLSX.utils.json_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    }
    
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  }, []);

  const exportToPDF = useCallback((reportData: ReportData, filename: string) => {
    try {
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
      autoTable(doc, {
        head: [reportData.columns],
        body: reportData.data.map(row => reportData.columns.map(col => row[col] || '')),
        startY: yPosition,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        theme: 'striped'
      });
      
      doc.save(`${filename}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
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
        exportToExcel(reportData, filename);
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
  }, [generateHousingReport, generateTransportationReport, generateFinanceReport, generateHRReport, generateOperationsReport, exportToExcel, exportToPDF]);

  return {
    generateReport,
    isGenerating,
    error,
    clearError: () => setError(null)
  };
}
