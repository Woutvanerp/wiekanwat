/**
 * Format a number as currency in Dutch format
 * @param {string|number} value - The value to format
 * @returns {string} Formatted currency string (e.g., €450.000)
 */
export function formatCurrency(value) {
  if (!value) return 'N/A'
  
  // If already formatted (contains €), return as is
  if (typeof value === 'string' && value.includes('€')) {
    return value
  }
  
  // Remove all non-numeric characters
  const numericValue = String(value).replace(/[^\d]/g, '')
  
  // If no numeric value, return N/A
  if (!numericValue) return 'N/A'
  
  // Format with thousands separator (dots) and euro sign
  return '€' + parseInt(numericValue, 10).toLocaleString('nl-NL')
}

