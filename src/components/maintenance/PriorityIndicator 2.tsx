import React from 'react';
import { cn } from '@/lib/utils';

interface PriorityIndicatorProps {
  color?: string;
  className?: string;
}

export const PriorityIndicator: React.FC<PriorityIndicatorProps> = ({ 
  color, 
  className 
}) => {
  // Define a set of predefined color classes
  const getColorClass = () => {
    if (!color) return 'bg-gray-300';
    
    const lowerColor = color.toLowerCase();
    
    if (lowerColor.includes('red')) return 'bg-red-500';
    if (lowerColor.includes('orange')) return 'bg-orange-500';
    if (lowerColor.includes('yellow')) return 'bg-yellow-500';
    if (lowerColor.includes('green')) return 'bg-green-500';
    if (lowerColor.includes('blue')) return 'bg-blue-500';
    if (lowerColor.includes('purple')) return 'bg-purple-500';
    if (lowerColor.includes('pink')) return 'bg-pink-500';
    
    // For hex colors or other named colors, we'll use a data attribute
    // and define specific colors in CSS
    return 'bg-custom-priority';
  };

  return (
    <div 
      className={cn('h-3 w-3 rounded-full', getColorClass(), className)}
      data-color={!getColorClass().includes('bg-') ? color : undefined}
      aria-hidden="true"
    />
  );
};
