import React from 'react';

interface ProgressBarProps {
    progress: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    className?: string;
}

export function ProgressBar({
    progress,
    label,
    showPercentage = true,
    className = '',
}: ProgressBarProps) {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className={`w-full ${className}`}>
            {label && (
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gold">{label}</span>
                    {showPercentage && (
                        <span className="text-sm font-semibold text-gold">{Math.round(clampedProgress)}%</span>
                    )}
                </div>
            )}
            <div className="w-full h-3 bg-navy-lighter rounded-full overflow-hidden">
                <div
                    className="h-full bg-gradient-gold transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${clampedProgress}%` }}
                />
            </div>
        </div>
    );
}
