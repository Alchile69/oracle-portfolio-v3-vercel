import React from 'react';

interface StatusIndicatorProps {
  status: string;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status, className = '' }) => {
  const getStatusColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case 'FAIBLE':
        return 'bg-green-500';
      case 'MODÉRÉ':
        return 'bg-yellow-500';
      case 'ÉLEVÉ':
        return 'bg-orange-500';
      case 'EXTRÊME':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <div 
        className={`w-3 h-3 rounded-full ${getStatusColor(status)}`}
        title={`Status: ${status}`}
      />
    </div>
  );
};

export default StatusIndicator;

