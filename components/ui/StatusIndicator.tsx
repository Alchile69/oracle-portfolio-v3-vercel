import React from 'react';
import { getStatusColor, getStatusBgColor } from '../../utils/formatters';
import { StatusIndicatorProps } from '../../types';

const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  showDot = true,
  className = '',
}) => {
  const statusLower = typeof status === 'string' ? status.toLowerCase() : '';
  const colorClass = getStatusColor(statusLower);
  const bgColorClass = getStatusBgColor(statusLower);

  return (
    <div className={`flex items-center ${className}`}>
      {showDot && (
        <div className={`${bgColorClass} w-2.5 h-2.5 rounded-full mr-2`}></div>
      )}
      <span className={`font-medium ${colorClass}`}>
        {typeof status === 'string' ? status.charAt(0).toUpperCase() + status.slice(1) : status}
      </span>
    </div>
  );
};

export default StatusIndicator;