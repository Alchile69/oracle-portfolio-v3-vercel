import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';

interface CardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  subtitle?: string;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  className = '',
  onRefresh,
  isLoading = false,
  subtitle,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`card ${className}`}
    >
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-semibold text-lg text-white">{title}</h3>
          {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-1.5 rounded-full hover:bg-gray-700 transition-colors"
            disabled={isLoading}
            title="Refresh data"
          >
            <RefreshCw
              size={16}
              className={`text-gray-400 ${isLoading ? 'animate-spin' : ''}`}
            />
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-t-4 border-primary-500 border-solid rounded-full animate-spin"></div>
        </div>
      ) : (
        children
      )}
    </motion.div>
  );
};

export default Card;