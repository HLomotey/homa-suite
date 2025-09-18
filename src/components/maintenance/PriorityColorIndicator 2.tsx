import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";

interface PriorityColorIndicatorProps {
  color?: string;
  className?: string;
}

export function PriorityColorIndicator({ color, className }: PriorityColorIndicatorProps) {
  // Default styling for the indicator
  const baseStyles = "h-3 w-3 rounded-full";
  const indicatorRef = useRef<HTMLDivElement>(null);
  
  // Use useEffect to set the CSS variable directly on the DOM element
  useEffect(() => {
    if (indicatorRef.current && color) {
      indicatorRef.current.style.setProperty("--priority-color", color);
    }
  }, [color]);
  
  return (
    <div 
      ref={indicatorRef}
      className={cn(
        baseStyles, 
        color ? "priority-color-indicator" : "",
        className
      )}
    />
  );
}
