/**
 * Formats a date string to avoid timezone issues that cause dates to appear one day earlier
 * @param dateString - The date string to format
 * @param options - Optional formatting options for toLocaleDateString
 * @returns Formatted date string
 */
export function formatDate(dateString: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString);
  
  // Create a new date using UTC components to avoid timezone conversion issues
  const utcDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  );
  
  return utcDate.toLocaleDateString('en-US', options);
}

/**
 * Formats a date for display with year, month, and day
 * @param dateString - The date string to format
 * @returns Formatted date string (e.g., "July 12, 2025")
 */
export function formatFullDate(dateString: string | Date): string {
  return formatDate(dateString, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

/**
 * Formats a date for short display
 * @param dateString - The date string to format
 * @returns Formatted date string (e.g., "7/12/2025")
 */
export function formatShortDate(dateString: string | Date): string {
  return formatDate(dateString);
} 