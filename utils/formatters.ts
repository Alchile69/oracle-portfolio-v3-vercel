import { format, parseISO } from 'date-fns';

// Format a number with thousand separators and specified decimals
export const formatNumber = (
  value: number,
  decimals: number = 0,
  prefix: string = '',
  suffix: string = ''
): string => {
  if (value === undefined || value === null) return '--';
  
  return `${prefix}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}${suffix}`;
};

// Format currency with thousand separators and specified decimals
export const formatCurrency = (
  value: number,
  decimals: number = 0,
  currency: string = '$'
): string => {
  return formatNumber(value, decimals, currency, '');
};

// Format percentage with a percent sign
export const formatPercent = (
  value: number,
  decimals: number = 2
): string => {
  return formatNumber(value, decimals, '', '%');
};

// Format date string to a readable format
export const formatDate = (
  dateString: string,
  formatStr: string = 'MMM d, yyyy'
): string => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    return dateString;
  }
};

// Format time string
export const formatTime = (
  dateString: string,
  formatStr: string = 'h:mm a'
): string => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    return dateString;
  }
};

// Format ISO date for display (date and time)
export const formatDateTime = (
  dateString: string,
  formatStr: string = 'MMM d, yyyy h:mm a'
): string => {
  try {
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    return dateString;
  }
};

// Get color for change value (positive = green, negative = red)
export const getChangeColor = (
  value: number
): string => {
  if (value > 0) return 'text-green-500';
  if (value < 0) return 'text-secondary-500';
  return 'text-gray-400';
};

// Get color for status
export const getStatusColor = (
  status: string
): string => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'low':
      return 'text-green-500';
    case 'moderate':
      return 'text-blue-500';
    case 'elevated':
      return 'text-yellow-500';
    case 'high':
      return 'text-orange-500';
    case 'extreme':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
};

// Get background color for status
export const getStatusBgColor = (
  status: string
): string => {
  const statusLower = status.toLowerCase();
  
  switch (statusLower) {
    case 'low':
      return 'bg-green-500';
    case 'moderate':
      return 'bg-blue-500';
    case 'elevated':
      return 'bg-yellow-500';
    case 'high':
      return 'bg-orange-500';
    case 'extreme':
      return 'bg-red-500';
    default:
      return 'bg-gray-400';
  }
};

// Get label for market stress level
export const getStressLabel = (
  value: number
): string => {
  if (value < 20) return 'Low';
  if (value < 40) return 'Moderate';
  if (value < 60) return 'Elevated';
  if (value < 80) return 'High';
  return 'Extreme';
};

// Get abbreviated large numbers (K, M, B)
export const abbreviateNumber = (
  value: number
): string => {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B';
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  return value.toString();
};