import { useState } from "react";
import { DeleteConfirmationDialog } from "../DeleteConfirmationDialog";
import { useInvoices } from "./hooks/useInvoices";
import { useExportInvoices } from "./hooks/useExportInvoices";
import { useSummaryMetrics } from "./hooks/useSummaryMetrics";
import { SummaryCards } from "./components/SummaryCards";
import { SearchControls } from "./components/SearchControls";
import { ActionButtons } from "./components/ActionButtons";
import { InvoiceTable } from "./components/InvoiceTable";

export function FinanceTransactions() {
  const {
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
  } = useInvoices();

  const { handleExport } = useExportInvoices();
  const summaryMetrics = useSummaryMetrics(invoices, totalCount);

  return (
    <div className="space-y-4">
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemCount={selectedIds.length}
        isDeleting={deleteMutation.isPending}
      />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Financial Transactions
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage invoices and financial transactions ({totalCount} total)
          </p>
        </div>
        
        <ActionButtons
          selectedIds={selectedIds}
          onDelete={handleDelete}
          onExport={() => handleExport(searchTerm)}
          isDeleting={deleteMutation.isPending}
        />
      </div>

      {/* Summary Cards */}
      <SummaryCards metrics={summaryMetrics} />

      {/* Search and Controls */}
      <SearchControls
        searchTerm={searchTerm}
        itemsPerPage={itemsPerPage}
        onSearchChange={handleSearchChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Invoice Table */}
      <InvoiceTable
        invoices={invoices}
        totalCount={totalCount}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalPages={totalPages}
        selectedIds={selectedIds}
        isLoading={isLoading}
        error={error}
        onSelectAll={handleSelectAll}
        onSelectItem={handleSelectItem}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
