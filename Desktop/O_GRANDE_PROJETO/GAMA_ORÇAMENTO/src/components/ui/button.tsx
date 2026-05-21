import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';

    const variants = {
      primary: 'bg-gama-primary text-gama-bg hover:bg-gama-primary hover:opacity-90 focus-visible:ring-gama-primary',
      secondary: 'bg-gama-surface text-gama-text hover:bg-gama-surface-2 focus-visible:ring-gama-primary border border-gama-border',
      outline: 'border border-gama-border bg-transparent text-gama-text hover:bg-gama-surface/50 focus-visible:ring-gama-primary',
      ghost: 'text-gama-text hover:bg-gama-surface/30 focus-visible:ring-gama-primary',
      destructive: 'bg-gama-error text-white hover:opacity-90 focus-visible:ring-gama-error',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 py-2 text-sm',
      lg: 'h-12 px-6 text-base',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
