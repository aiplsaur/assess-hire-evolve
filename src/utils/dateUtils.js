import { format, isValid, parseISO } from 'date-fns';

/**
 * Safely formats a date string using date-fns
 * 
 * @param {string|Date|null|undefined} dateValue - The date to format
 * @param {string} formatStr - The format string (date-fns format)
 * @param {string} fallback - Value to return if date is invalid
 * @returns {string} Formatted date or fallback value
 */
export const formatDate = (dateValue, formatStr = 'MMM d, yyyy', fallback = 'N/A') => {
  if (!dateValue) return fallback;
  
  try {
    // Handle string dates
    if (typeof dateValue === 'string') {
      // Try to parse ISO format first for better accuracy
      const parsedDate = parseISO(dateValue);
      if (isValid(parsedDate)) {
        return format(parsedDate, formatStr);
      }
      
      // Fallback to regular Date constructor
      const date = new Date(dateValue);
      if (isValid(date)) {
        return format(date, formatStr);
      }
    } 
    // Handle Date objects
    else if (dateValue instanceof Date && isValid(dateValue)) {
      return format(dateValue, formatStr);
    }
    
    console.warn(`Invalid date format: ${dateValue}`);
    return fallback;
  } catch (error) {
    console.error(`Error formatting date: ${dateValue}`, error);
    return fallback;
  }
};

/**
 * Formats a date with time
 * 
 * @param {string|Date} dateValue - The date to format
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (dateValue) => {
  return formatDate(dateValue, 'MMM d, yyyy h:mm a');
};

/**
 * Formats a time only
 * 
 * @param {string|Date} dateValue - The date to format
 * @returns {string} Formatted time
 */
export const formatTime = (dateValue) => {
  return formatDate(dateValue, 'h:mm a');
}; 