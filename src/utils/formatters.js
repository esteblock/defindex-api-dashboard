/**
 * Convert Stellar amount (stroops) to actual amount (divide by 10^7)
 * @param {string|number} amount - The amount in stroops
 * @returns {number} The actual amount
 */
function convertFromStroops(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return 0
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return 0
  }
  
  // Stellar uses 7 decimal places, so divide by 10^7
  return numAmount / 10000000
}

/**
 * Format a number with up to 2 decimals, removing trailing zeros
 * @param {number} value - The number to format
 * @returns {string} Formatted number
 */
function formatNumber(value) {
  if (value === 0) {
    return '0'
  }
  
  // Format with up to 2 decimals, remove trailing zeros
  const formatted = value.toFixed(2).replace(/\.?0+$/, '')
  return formatted
}

/**
 * Format amount with 2 decimals but only show if significant
 * For amounts already in decimal format (like PPS)
 * @param {string|number} amount - The amount to format (already in decimal)
 * @returns {string} Formatted amount
 */
export function formatAmount(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return '0'
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount) || numAmount === 0) {
    return '0'
  }
  
  return formatNumber(numAmount)
}

/**
 * Format amount (already in decimal) with commas, with 2 decimals but only show if significant
 * @param {string|number} amount - The amount to format (already in decimal)
 * @returns {string} Formatted amount with commas
 */
export function formatAmountWithCommasDecimal(amount) {
  if (amount === null || amount === undefined || amount === '') {
    return '0'
  }
  
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount) || numAmount === 0) {
    return '0'
  }
  
  const formatted = formatNumber(numAmount)
  
  // Split into integer and decimal parts
  const parts = formatted.split('.')
  
  // Add commas to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // Join back, only include decimal part if it exists
  return parts.length > 1 && parts[1] ? parts.join('.') : parts[0]
}

/**
 * Format Stellar amount (stroops) with commas, with 2 decimals but only show if significant
 * @param {string|number} amount - The amount to format (in stroops)
 * @returns {string} Formatted amount with commas
 */
export function formatAmountWithCommas(amount) {
  const actualAmount = convertFromStroops(amount)
  
  if (actualAmount === 0) {
    return '0'
  }
  
  const formatted = formatNumber(actualAmount)
  
  // Split into integer and decimal parts
  const parts = formatted.split('.')
  
  // Add commas to integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  
  // Join back, only include decimal part if it exists
  return parts.length > 1 && parts[1] ? parts.join('.') : parts[0]
}

/**
 * Format number in compact notation (K, M, B)
 * @param {number} value - The number to format
 * @returns {string} Formatted number with suffix
 */
export function formatCompactNumber(value) {
  if (value === null || value === undefined || isNaN(value) || value === 0) {
    return '0'
  }

  const absValue = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (absValue >= 1000000000) {
    // Billions
    const formatted = (absValue / 1000000000).toFixed(1)
    return `${sign}${formatted.replace(/\.0$/, '')}B`
  } else if (absValue >= 1000000) {
    // Millions
    const formatted = (absValue / 1000000).toFixed(1)
    return `${sign}${formatted.replace(/\.0$/, '')}M`
  } else if (absValue >= 1000) {
    // Thousands - show as whole number if no decimals, otherwise 1 decimal
    const divided = absValue / 1000
    if (divided % 1 === 0) {
      return `${sign}${divided.toFixed(0)}K`
    } else {
      const formatted = divided.toFixed(1)
      return `${sign}${formatted.replace(/\.0$/, '')}K`
    }
  } else {
    // Less than 1000, show with up to 2 decimals
    return `${sign}${formatNumber(absValue)}`
  }
}

/**
 * Format Stellar amount (stroops) in compact notation
 * @param {string|number} amount - The amount to format (in stroops)
 * @returns {string} Formatted amount in compact notation
 */
export function formatAmountCompact(amount) {
  const actualAmount = convertFromStroops(amount)
  return formatCompactNumber(actualAmount)
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

