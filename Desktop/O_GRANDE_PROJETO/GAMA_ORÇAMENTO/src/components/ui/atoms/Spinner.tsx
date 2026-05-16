import React from 'react';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'text' | 'white';
}

const Spinner = React.forwardRef<HTMLDivElement, SpinnerProps>(
  ({ className = "", size = 'md', color = 'primary', ...props }, ref) => {
    const sizeClasses = {
      sm: 'w-4 h-4',
      md: 'w-6 h-6',
      lg: 'w-8 h-8',
    };

    const colorClasses = {
      primary: 'border-primary',
      text: 'border-text',
      white: 'border-white',
    };

    return (
      <div
        ref={ref}
        className={`
          ${sizeClasses[size]}
          ${colorClasses[color]}
          border-2
          border-r-transparent
          rounded-full
          animate-spin
          ${className}
        `}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner };
