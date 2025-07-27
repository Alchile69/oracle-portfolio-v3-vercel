import React from 'react';

interface CardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  onRefresh?: () => void;
  isLoading?: boolean;
  className?: string;
}

const Card: React.FC<CardProps> = ({ 
  title, 
  subtitle, 
  children, 
  onRefresh, 
  isLoading,
  className = ''
}) => {
  return (
    <div className={`bg-background-card rounded-xl p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            disabled={isLoading}
            className={`
              px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${isLoading 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-primary-600 text-white hover:bg-primary-700'
              }
            `}
          >
            {isLoading ? 'Loading...' : 'Refresh'}
          </button>
        )}
      </div>
      {children}
    </div>
  );
};

export default Card;

