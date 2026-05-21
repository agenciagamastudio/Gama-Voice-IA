import React from 'react';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  title?: string;
  onClose?: () => void;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({
    className = "",
    variant = 'info',
    icon,
    title,
    onClose,
    children,
    ...props
  }, ref) => {
    const variants = {
      success: {
        bg: 'bg-gama-success/10',
        border: 'border-gama-success/30',
        text: 'text-gama-success',
        icon: '✓',
      },
      warning: {
        bg: 'bg-gama-warning/10',
        border: 'border-gama-warning/30',
        text: 'text-gama-warning',
        icon: '⚠',
      },
      error: {
        bg: 'bg-gama-error/10',
        border: 'border-gama-error/30',
        text: 'text-gama-error',
        icon: '✕',
      },
      info: {
        bg: 'bg-gama-info/10',
        border: 'border-gama-info/30',
        text: 'text-gama-info',
        icon: 'ℹ',
      },
    };

    const style = variants[variant];

    return (
      <div
        ref={ref}
        className={`
          ${style.bg}
          ${style.border}
          border
          rounded-lg
          p-4
          ${className}
        `}
        {...props}
      >
        <div className="flex gap-3">
          {icon && (
            <div className={`${style.text} font-bold text-lg flex-shrink-0 mt-0.5`}>
              {icon}
            </div>
          )}
          <div className="flex-1">
            {title && (
              <h4 className={`${style.text} font-semibold mb-1`}>
                {title}
              </h4>
            )}
            <p className={`${style.text} text-sm`}>
              {children}
            </p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className={`${style.text} flex-shrink-0 hover:opacity-75 text-lg`}
              aria-label="Close alert"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export { Alert };
