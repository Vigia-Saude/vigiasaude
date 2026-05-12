import React from 'react';
import { cn } from '../../lib/utils';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string;
  colors?: { bg: string; text: string };
  variant?: 'green' | 'yellow' | 'orange' | 'red' | 'blue' | 'purple' | 'gray';
}

const colorMap = {
  green: { bg: 'bg-[#0E9F6E]/10', text: 'text-[#0E9F6E]' },
  yellow: { bg: 'bg-[#FACA15]/10', text: 'text-[#FACA15]' },
  orange: { bg: 'bg-[#F59E0B]/10', text: 'text-[#F59E0B]' },
  red: { bg: 'bg-[#F05252]/10', text: 'text-[#F05252]' },
  blue: { bg: 'bg-[#1A56DB]/10', text: 'text-[#1A56DB]' },
  purple: { bg: 'bg-[#6B21A8]/10', text: 'text-[#6B21A8]' },
  gray: { bg: 'bg-[#6B7280]/10', text: 'text-[#6B7280]' },
};

export function StatusBadge({ status, colors, variant = 'gray', className, ...props }: StatusBadgeProps) {
  const defaultColors = colorMap[variant];
  
  const bgClass = colors?.bg || defaultColors.bg;
  const textClass = colors?.text || defaultColors.text;

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        bgClass,
        textClass,
        className
      )}
      {...props}
    >
      {status}
    </span>
  );
}
