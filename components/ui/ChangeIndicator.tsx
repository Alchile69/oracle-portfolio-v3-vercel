import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { formatPercent } from '../../utils/formatters';
import { ChangeIndicatorProps } from '../../types';

const ChangeIndicator: React.FC<ChangeIndicatorProps> = ({
  value,
  showArrow = true,
  showPercent = true,
  className = '',
}) => {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const isZero = value === 0;
  
  let colorClass = 'text-gray-400';
  if (isPositive) colorClass = 'text-green-500';
  if (isNegative) colorClass = 'text-secondary-500';

  return (
    <div className={`flex items-center ${colorClass} ${className}`}>
      {showArrow && !isZero && (
        <>
          {isPositive && <ArrowUp size={16} className="mr-1" />}
          {isNegative && <ArrowDown size={16} className="mr-1" />}
        </>
      )}
      <span className="font-medium">
        {value > 0 ? '+' : ''}
        {showPercent ? formatPercent(value) : value.toFixed(2)}
      </span>
    </div>
  );
};

export default ChangeIndicator;