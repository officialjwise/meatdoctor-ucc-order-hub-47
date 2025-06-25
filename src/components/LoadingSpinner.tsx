
import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  text = 'Loading...' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className="flex items-center justify-center gap-2 p-4">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-food-primary`} />
      {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
