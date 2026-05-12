import React from 'react';
import { Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

interface AlertBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
}

const variantConfig = {
  info: {
    icon: Info,
    containerClass: 'bg-blue-50 border-blue-200',
    iconClass: 'text-blue-500',
    titleClass: 'text-blue-800',
    textClass: 'text-blue-700',
  },
  warning: {
    icon: AlertTriangle,
    containerClass: 'bg-yellow-50 border-yellow-200',
    iconClass: 'text-yellow-500',
    titleClass: 'text-yellow-800',
    textClass: 'text-yellow-700',
  },
  error: {
    icon: AlertCircle,
    containerClass: 'bg-red-50 border-red-200',
    iconClass: 'text-red-500',
    titleClass: 'text-red-800',
    textClass: 'text-red-700',
  },
  success: {
    icon: CheckCircle,
    containerClass: 'bg-green-50 border-green-200',
    iconClass: 'text-green-500',
    titleClass: 'text-green-800',
    textClass: 'text-green-700',
  },
};

export function AlertBanner({ variant = 'info', title, children, className, ...props }: AlertBannerProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  return (
    <div
      className={cn('flex p-4 border rounded-lg', config.containerClass, className)}
      role="alert"
      {...props}
    >
      <Icon className={cn('h-5 w-5 shrink-0 mr-3', config.iconClass)} />
      <div>
        {title && <h3 className={cn('text-sm font-medium mb-1', config.titleClass)}>{title}</h3>}
        <div className={cn('text-sm', config.textClass)}>{children}</div>
      </div>
    </div>
  );
}
