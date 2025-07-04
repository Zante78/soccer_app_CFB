import React from 'react';

interface CircularProgressProps {
  value: number;
  maxValue: number;
  size?: number;
  strokeWidth?: number;
  backgroundColor?: string;
  valueColor?: string;
  showValue?: boolean;
  label?: string;
  className?: string;
}

export function CircularProgress({
  value,
  maxValue,
  size = 140,
  strokeWidth = 8,
  backgroundColor = '#e5e7eb',
  valueColor,
  showValue = true,
  label,
  className = ''
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (value / maxValue) * circumference;
  const strokeDashoffset = circumference - progress;

  // Determine color based on value if not provided
  const getColor = () => {
    if (valueColor) return valueColor;
    
    const percentage = value / maxValue;
    if (percentage >= 0.8) return '#10b981'; // green-500
    if (percentage >= 0.6) return '#3b82f6'; // blue-500
    if (percentage >= 0.4) return '#f59e0b'; // amber-500
    return '#ef4444';                        // red-500
  };

  // Determine text color based on value
  const getTextColor = () => {
    const percentage = value / maxValue;
    if (percentage >= 0.8) return 'text-green-600';
    if (percentage >= 0.6) return 'text-blue-600';
    if (percentage >= 0.4) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Background circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke={backgroundColor} 
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={radius} 
          fill="none" 
          stroke={getColor()} 
          strokeWidth={strokeWidth} 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeLinecap="round"
        />
      </svg>
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${getTextColor()}`}>
            {value.toFixed(1)}
          </span>
          {label && <span className="text-xs text-gray-500">{label}</span>}
        </div>
      )}
    </div>
  );
}