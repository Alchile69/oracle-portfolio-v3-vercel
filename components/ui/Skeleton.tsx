import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  rounded?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = 'rounded',
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-700 ${height} ${width} ${rounded} ${className}`}
    ></div>
  );
};

export default Skeleton;