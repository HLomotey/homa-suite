export interface Invoice {
  id: string;
  client_name: string;
  invoice_number: string;
  date_issued: string;
  invoice_status: string;
  item_description: string;
  quantity: number;
  tax_1_type: string | null;
  line_total: string;
  currency: string;
}

export interface SummaryMetrics {
  totalInvoiceCount: number;
  totalQuantity: number;
  totalLineAmount: number;
}
