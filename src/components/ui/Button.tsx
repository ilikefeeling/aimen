import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    isLoading?: boolean;
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    isLoading = false,
    className = '',
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = 'rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-gradient-gold text-navy hover:shadow-lg hover:scale-105 active:scale-95',
        secondary: 'bg-navy-light text-gold border border-gold hover:bg-navy hover:shadow-lg',
        outline: 'bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-navy',
        danger: 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg',
    };

    const sizes = {
        sm: 'px-4 py-2 text-sm',
        md: 'px-6 py-3 text-base',
        lg: 'px-8 py-4 text-lg',
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    <span>처리중...</span>
                </div>
            ) : (
                children
            )}
        </button>
    );
}
