import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integration/supabase/client";
import { toast } from "sonner";
import { Invoice } from "../types";

export function useInvoices() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch invoices with pagination and search
  const {
    data: invoicesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["finance-invoices", currentPage, itemsPerPage, searchTerm],
    queryFn: async () => {
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;

      let query = supabase
        .from("finance_invoices")
        .select("*", { count: "exact" })
        .order("date_issued", { ascending: false });

      // Apply search filter if search term exists
      if (searchTerm.trim()) {
        query = query.or(
          `invoice_number.ilike.%${searchTerm}%,client_name.ilike.%${searchTerm}%,invoice_status.ilike.%${searchTerm}%,item_description.ilike.%${searchTerm}%`
        );
      }

      const { data, error, count } = await query.range(start, end);

      if (error) throw error;
      return { invoices: data as Invoice[], totalCount: count || 0 };
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      const { error } = await supabase
        .from("finance_invoices")
        .delete()
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["finance-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["finance-analytics"] });
      queryClient.invalidateQueries({ queryKey: ["revenue-metrics"] });
      setSelectedIds([]);
      toast.success(`Successfully deleted ${selectedIds.length} invoice(s)`);
    },
    onError: (error) => {
      toast.error(`Failed to delete invoices: ${error.message}`);
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked && invoicesData?.invoices) {
      setSelectedIds(invoicesData.invoices.map((inv) => inv.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) return;
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedIds);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Extract data safely regardless of loading/error state
  const { invoices = [], totalCount = 0 } = invoicesData || {};
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return {
    invoices,
    totalCount,
    totalPages,
    currentPage,
    itemsPerPage,
    searchTerm,
    selectedIds,
    isLoading,
    error,
    isDeleteDialogOpen,
    deleteMutation,
    setCurrentPage,
    setIsDeleteDialogOpen,
    handleSelectAll,
    handleSelectItem,
    handleDelete,
    confirmDelete,
    handleItemsPerPageChange,
    handleSearchChange,
  };
}
