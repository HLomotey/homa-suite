/**
 * Format a currency value with proper formatting
 */
export const formatCurrency = (value: string): string => {
  const num = parseFloat(value);
  return `$${num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
};

/**
 * Format a date string to a localized date format
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

/**
 * Get the appropriate badge variant based on invoice status
 */
export const getStatusVariant = (status: string) => {
  switch (status.toLowerCase()) {
    case "paid":
      return "default";
    case "pending":
      return "secondary";
    case "overdue":
      return "destructive";
    case "sent":
      return "outline";
    default:
      return "outline";
  }
};
