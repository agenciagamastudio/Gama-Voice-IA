import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", error, label, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gama-text mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`
            w-full
            px-3 py-2
            text-sm
            rounded-md
            border
            ${error ? 'border-gama-error' : 'border-gama-border'}
            bg-gama-surface
            text-gama-text
            placeholder:text-gama-text-muted
            focus:outline-none
            focus:ring-2
            focus:ring-gama-primary
            focus:ring-offset-2
            focus:ring-offset-gama-bg
            disabled:opacity-50
            disabled:cursor-not-allowed
            transition-colors
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
