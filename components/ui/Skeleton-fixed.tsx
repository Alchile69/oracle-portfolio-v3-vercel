import React from 'react';

interface SkeletonProps {
  height?: string;
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ height = 'h-4', className = '' }) => {
  return (
    <div 
      className={`animate-pulse bg-gray-700 rounded ${height} ${className}`}
    />
  );
};

export default Skeleton;

