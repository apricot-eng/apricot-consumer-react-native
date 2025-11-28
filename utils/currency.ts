/**
 * Format a number as Argentine peso currency
 * Uses dot as thousands separator
 * Example: 2300 -> "$2.300"
 */
export const formatArgentinePeso = (price: string | number): string => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  
  if (isNaN(numPrice)) {
    return '$0';
  }
  
  // Format with dot as thousands separator
  const formatted = Math.round(numPrice).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  
  return `$${formatted}`;
};

