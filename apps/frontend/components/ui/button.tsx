import { ButtonHTMLAttributes, forwardRef } from 'react';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size, children, ...props }, ref) => {
    const variantClasses = {
      primary: 'btn-primary',
      secondary: 'btn-secondary',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 rounded-lg px-4 py-2 font-medium transition-colors',
      ghost: 'text-gray-700 hover:bg-gray-100 rounded-lg px-4 py-2 font-medium transition-colors',
    };

    const sizeClasses = size === 'sm' ? 'text-sm px-3 py-1.5' : size === 'lg' ? 'text-lg px-6 py-3' : '';

    return (
      <button
        ref={ref}
        className={`${variantClasses[variant]} ${sizeClasses} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
