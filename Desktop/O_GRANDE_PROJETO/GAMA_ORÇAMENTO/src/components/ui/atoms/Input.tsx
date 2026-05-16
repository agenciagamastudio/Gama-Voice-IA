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
          <label className="block text-sm font-medium text-text mb-2">
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
            ${error ? 'border-error' : 'border-border'}
            bg-surface
            text-text
            placeholder:text-text-2
            focus:outline-none
            focus:ring-2
            focus:ring-primary
            focus:ring-offset-2
            focus:ring-offset-bg
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
