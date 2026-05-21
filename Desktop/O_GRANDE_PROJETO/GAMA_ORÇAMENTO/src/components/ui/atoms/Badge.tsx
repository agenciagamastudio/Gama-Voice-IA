import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className = "", variant = 'default', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-full whitespace-nowrap';

    const variants = {
      default: 'bg-gama-surface text-gama-text border border-gama-border',
      success: 'bg-gama-success/10 text-gama-success border border-gama-success/30',
      warning: 'bg-gama-warning/10 text-gama-warning border border-gama-warning/30',
      error: 'bg-gama-error/10 text-gama-error border border-gama-error/30',
      info: 'bg-gama-info/10 text-gama-info border border-gama-info/30',
    };

    const sizes = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1.5 text-sm',
    };

    return (
      <div
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
