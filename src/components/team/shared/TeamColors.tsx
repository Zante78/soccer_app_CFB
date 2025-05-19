import React from 'react';

interface TeamColorsProps {
  colors: {
    primary: string;
    secondary: string;
  };
  className?: string;
}

export function TeamColors({ colors, className = '' }: TeamColorsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: colors.primary }}
      />
      <div 
        className="w-3 h-3 rounded-full" 
        style={{ backgroundColor: colors.secondary }}
      />
    </div>
  );
}