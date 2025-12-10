/**
 * Format amount to always show 7 decimals
 * @param {string|number} amount - The amount to format
 * @returns {string} Formatted amount with 7 decimals
 */
export function formatAmount(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return '0.0000000'
  }
  
  // Convert to number if it's a string
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return '0.0000000'
  }
  
  // Format with 7 decimals, remove trailing zeros but keep at least one decimal place
  return numAmount.toFixed(7).replace(/\.?0+$/, '') || '0.0000000'
}

/**
 * Format large numbers with commas for readability
 * @param {string|number} amount - The amount to format
 * @returns {string} Formatted amount with commas
 */
export function formatAmountWithCommas(amount) {
  const formatted = formatAmount(amount)
  const parts = formatted.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return parts.join('.')
}

/**
 * Format percentage with 2 decimals
 * @param {number} value - The percentage value
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return '0.00%'
  }
  return `${value.toFixed(2)}%`
}

