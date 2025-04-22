/**
 * Format a number with a given decimal precision
 * @param {number|string} value - The number to format
 * @param {number} precision - Number of decimal places (default: 2)
 * @param {boolean} keepTrailingZeros - Whether to keep trailing zeros (default: true)
 * @returns {string} Formatted number as string
 */
export const formatNumber = (value, precision = 2, keepTrailingZeros = true) => {
  // Handle invalid inputs
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  
  const num = Number(value);
  
  if (keepTrailingZeros) {
    return num.toFixed(precision);
  } else {
    return parseFloat(num.toFixed(precision)).toString();
  }
};

/**
 * Format a number with K, M, B suffixes based on magnitude
 * @param {number|string} value - The number to format
 * @param {number} precision - Number of decimal places (default: 2)
 * @returns {string} Formatted number with appropriate suffix
 */
export const formatNumberWithUnit = (value, precision = 2) => {
  // Handle invalid inputs
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }
  
  const num = Number(value);
  
  if (num === 0) return '0';
  
  if (Math.abs(num) >= 1000000000) {
    return (num / 1000000000).toFixed(precision) + 'B';
  } else if (Math.abs(num) >= 1000000) {
    return (num / 1000000).toFixed(precision) + 'M';
  } else if (Math.abs(num) >= 1000) {
    return (num / 1000).toFixed(precision) + 'K';
  } else {
    return formatNumber(num, precision);
  }
}; 