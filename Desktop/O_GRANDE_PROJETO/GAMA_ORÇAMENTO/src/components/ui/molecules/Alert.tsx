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
        bg: 'bg-success/10',
        border: 'border-success/30',
        text: 'text-success',
        icon: '✓',
      },
      warning: {
        bg: 'bg-warning/10',
        border: 'border-warning/30',
        text: 'text-warning',
        icon: '⚠',
      },
      error: {
        bg: 'bg-error/10',
        border: 'border-error/30',
        text: 'text-error',
        icon: '✕',
      },
      info: {
        bg: 'bg-info/10',
        border: 'border-info/30',
        text: 'text-info',
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
