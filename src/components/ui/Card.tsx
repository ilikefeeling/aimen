import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
}

export function Card({ children, className = '', hover = false }: CardProps) {
    return (
        <div
            className={`
        bg-navy-light rounded-xl p-6 shadow-lg border border-gold/20
        ${hover ? 'hover:shadow-2xl hover:scale-105 transition-all duration-300' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
