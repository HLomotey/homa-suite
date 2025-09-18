/**
 * Staff Transaction Log types for Supabase integration
 * These types define the staff transaction log structure and related interfaces
 */

/**
 * Transaction types enum
 */
export type TransactionType = 'billing' | 'payroll' | 'assignment' | 'profile_update' | 'system_activity';

/**
 * Transaction categories enum
 */
export type TransactionCategory = 'created' | 'updated' | 'deleted' | 'payment' | 'assignment_change';

/**
 * Staff Transaction Log interface representing the staff_transaction_log table in Supabase
 */
export interface StaffTransactionLog {
  id: string;
  staff_id: string;
  staff_name: string;
  transaction_type: TransactionType;
  transaction_category: TransactionCategory;
  description: string;
  amount: number | null;
  reference_id: string | null;
  reference_table: string | null;
  metadata: Record<string, any> | null;
  performed_by: string | null;
  performed_by_name: string;
  timestamp: string;
  created_at: string;
}

/**
 * Frontend staff transaction log type that matches the structure used in components
 */
export interface FrontendStaffTransactionLog {
  id: string;
  staffId: string;
  staffName: string;
  transactionType: TransactionType;
  transactionCategory: TransactionCategory;
  description: string;
  amount: number | null;
  referenceId: string | null;
  referenceTable: string | null;
  metadata: Record<string, any> | null;
  performedBy: string | null;
  performedByName: string;
  timestamp: string;
  createdAt: string;
}

/**
 * Transaction log entry for creating new logs
 */
export interface CreateStaffTransactionLog {
  staffId: string;
  staffName: string;
  transactionType: TransactionType;
  transactionCategory: TransactionCategory;
  description: string;
  amount?: number | null;
  referenceId?: string | null;
  referenceTable?: string | null;
  metadata?: Record<string, any> | null;
  performedBy?: string | null;
  performedByName?: string;
}

/**
 * Transaction log filters for querying
 */
export interface StaffTransactionLogFilters {
  staffId?: string;
  transactionType?: TransactionType;
  transactionCategory?: TransactionCategory;
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * Transaction log summary for dashboard/stats
 */
export interface StaffTransactionLogSummary {
  staffId: string;
  staffName: string;
  totalTransactions: number;
  totalAmount: number;
  lastActivity: string;
  transactionsByType: Record<TransactionType, number>;
  transactionsByCategory: Record<TransactionCategory, number>;
}

/**
 * Maps a database staff transaction log to the frontend format
 */
export const mapDatabaseStaffTransactionLogToFrontend = (dbLog: StaffTransactionLog): FrontendStaffTransactionLog => {
  return {
    id: dbLog.id,
    staffId: dbLog.staff_id,
    staffName: dbLog.staff_name,
    transactionType: dbLog.transaction_type,
    transactionCategory: dbLog.transaction_category,
    description: dbLog.description,
    amount: dbLog.amount,
    referenceId: dbLog.reference_id,
    referenceTable: dbLog.reference_table,
    metadata: dbLog.metadata,
    performedBy: dbLog.performed_by,
    performedByName: dbLog.performed_by_name,
    timestamp: dbLog.timestamp,
    createdAt: dbLog.created_at,
  };
};

/**
 * Maps frontend staff transaction log to database format
 */
export const mapFrontendStaffTransactionLogToDatabase = (frontendLog: CreateStaffTransactionLog): Omit<StaffTransactionLog, 'id' | 'timestamp' | 'created_at'> => {
  return {
    staff_id: frontendLog.staffId,
    staff_name: frontendLog.staffName,
    transaction_type: frontendLog.transactionType,
    transaction_category: frontendLog.transactionCategory,
    description: frontendLog.description,
    amount: frontendLog.amount || null,
    reference_id: frontendLog.referenceId || null,
    reference_table: frontendLog.referenceTable || null,
    metadata: frontendLog.metadata || null,
    performed_by: frontendLog.performedBy || null,
    performed_by_name: frontendLog.performedByName || 'System',
  };
};

/**
 * Get transaction type display name
 */
export const getTransactionTypeDisplayName = (type: TransactionType): string => {
  const displayNames: Record<TransactionType, string> = {
    billing: 'Billing',
    payroll: 'Payroll',
    assignment: 'Room Assignment',
    profile_update: 'Profile Update',
    system_activity: 'System Activity',
  };
  return displayNames[type] || type;
};

/**
 * Get transaction category display name
 */
export const getTransactionCategoryDisplayName = (category: TransactionCategory): string => {
  const displayNames: Record<TransactionCategory, string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    payment: 'Payment',
    assignment_change: 'Assignment Change',
  };
  return displayNames[category] || category;
};

/**
 * Get transaction type color for UI
 */
export const getTransactionTypeColor = (type: TransactionType): string => {
  const colors: Record<TransactionType, string> = {
    billing: 'text-blue-600',
    payroll: 'text-green-600',
    assignment: 'text-purple-600',
    profile_update: 'text-orange-600',
    system_activity: 'text-gray-600',
  };
  return colors[type] || 'text-gray-600';
};

/**
 * Get transaction category badge color for UI
 */
export const getTransactionCategoryBadgeColor = (category: TransactionCategory): string => {
  const colors: Record<TransactionCategory, string> = {
    created: 'bg-green-100 text-green-800',
    updated: 'bg-blue-100 text-blue-800',
    deleted: 'bg-red-100 text-red-800',
    payment: 'bg-yellow-100 text-yellow-800',
    assignment_change: 'bg-purple-100 text-purple-800',
  };
  return colors[category] || 'bg-gray-100 text-gray-800';
};
