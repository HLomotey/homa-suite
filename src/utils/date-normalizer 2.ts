/**
 * Date normalizer utility for handling various date formats
 * Especially for birth dates that may be missing year information
 */

/**
 * Normalizes date strings to ISO format (YYYY-MM-DD)
 * Handles cases where year is missing by using a default year
 * 
 * @param dateString The date string to normalize
 * @param defaultYear The year to use if missing (defaults to current year - 30)
 * @returns Normalized ISO date string or null if invalid
 */
export function normalizeDate(dateString: string | null | undefined, defaultYear?: number): string | null {
  if (!dateString) return null;
  
  // Default year (30 years ago if not specified)
  const thisYear = new Date().getFullYear();
  const year = defaultYear || thisYear - 30;
  
  // Try to parse the date
  try {
    // Check if it's already in ISO format (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Check if it's MM/DD format without year
    const mmddMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (mmddMatch) {
      const month = mmddMatch[1].padStart(2, '0');
      const day = mmddMatch[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Check if it's MM/DD/XXXX format (where XXXX represents missing year)
    const mmddxxxxMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/X+$/);
    if (mmddxxxxMatch) {
      const month = mmddxxxxMatch[1].padStart(2, '0');
      const day = mmddxxxxMatch[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    
    // Check if it's MM/DD/YYYY format
    const mmddyyyyMatch = dateString.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (mmddyyyyMatch) {
      const month = mmddyyyyMatch[1].padStart(2, '0');
      const day = mmddyyyyMatch[2].padStart(2, '0');
      const year = mmddyyyyMatch[3];
      return `${year}-${month}-${day}`;
    }
    
    // Try to parse with Date object as fallback
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error normalizing date:', error);
    return null;
  }
}

/**
 * Formats a date string for display
 * 
 * @param dateString ISO date string (YYYY-MM-DD)
 * @param format Format to use (default: 'MM/DD/YYYY')
 * @returns Formatted date string or empty string if invalid
 */
export function formatDate(dateString: string | null | undefined, format: 'MM/DD/YYYY' | 'MM/DD' = 'MM/DD/YYYY'): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return format === 'MM/DD' ? `${month}/${day}` : `${month}/${day}/${year}`;
  } catch (error) {
    return '';
  }
}
