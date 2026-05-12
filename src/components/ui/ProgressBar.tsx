import React from 'react';
import { cn } from '../../lib/utils';

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  percentage: number;
  variant?: 'linear' | 'circular';
  size?: number; // Only for circular, defines width/height in px
  strokeWidth?: number; // Only for circular
}

export function ProgressBar({ 
  percentage, 
  variant = 'linear', 
  size = 64, 
  strokeWidth = 6, 
  className, 
  ...props 
}: ProgressBarProps) {
  const safePercentage = Math.min(Math.max(percentage, 0), 100);
  
  // Dynamic color based on percentage
  let colorClass = 'bg-green-500';
  let strokeColorClass = 'text-green-500';
  
  if (safePercentage > 80) {
    colorClass = 'bg-red-500';
    strokeColorClass = 'text-red-500';
  } else if (safePercentage > 50) {
    colorClass = 'bg-yellow-500';
    strokeColorClass = 'text-yellow-500';
  }

  if (variant === 'circular') {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (safePercentage / 100) * circumference;

    return (
      <div 
        className={cn('relative inline-flex items-center justify-center', className)} 
        style={{ width: size, height: size }}
        {...props}
      >
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            className="text-gray-200"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress circle */}
          <circle
            className={cn('transition-all duration-500 ease-in-out', strokeColorClass)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
        </svg>
        <span className="absolute text-sm font-semibold text-gray-700">
          {Math.round(safePercentage)}%
        </span>
      </div>
    );
  }

  // Linear variant
  return (
    <div className={cn('w-full', className)} {...props}>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium text-gray-700">Progresso</span>
        <span className="text-sm font-medium text-gray-700">{Math.round(safePercentage)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div 
          className={cn('h-2.5 rounded-full transition-all duration-500 ease-in-out', colorClass)} 
          style={{ width: `${safePercentage}%` }}
        ></div>
      </div>
    </div>
  );
}
