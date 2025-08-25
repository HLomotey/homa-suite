import { supabase } from "@/integration/supabase/client";
import { toast } from "sonner";
import { formatDate } from "../utils";

export function useExportInvoices() {
  const handleExport = async (searchTerm: string) => {
    try {
      // Fetch all data for export (without pagination)
      let query = supabase
        .from("finance_invoices")
        .select("*")
        .order("date_issued", { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(
          `invoice_number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,invoice_status.ilike.%${searchTerm}%,item_description.ilike.%${searchTerm}%`
        );
      }

      const { data, error } = await query;
      if (error) throw error;

      // Convert to CSV
      const headers = [
        "Client Name",
        "Invoice #",
        "Date",
        "Invoice Status",
        "Item Description",
        "Quantity",
        "Tax 1 Type",
        "Line Total",
        "Currency",
      ];
      const csvContent = [
        headers.join(","),
        ...data.map((invoice) =>
          [
            `"${invoice.client_name}"`,
            `"${invoice.invoice_number}"`,
            `"${formatDate(invoice.date_issued)}"`,
            `"${invoice.invoice_status}"`,
            `"${invoice.item_description}"`,
            `"${invoice.quantity}"`,
            `"${invoice.tax_1_type || "N/A"}"`,
            `"${invoice.line_total}"`,
            `"${invoice.currency}"`,
          ].join(",")
        ),
      ].join("\n");

      // Download CSV
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `finance_transactions_${new Date().toISOString().split("T")[0]}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("Transactions exported successfully");
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };

  return { handleExport };
}
