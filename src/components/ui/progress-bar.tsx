import React from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  size?: "sm" | "md" | "lg";
  color?: "blue" | "purple" | "green" | "red" | "yellow" | "orange";
  label?: string;
}

const sizeClasses = {
  sm: "h-1",
  md: "h-2", 
  lg: "h-3"
};

const colorClasses = {
  blue: "bg-blue-500",
  purple: "bg-purple-500",
  green: "bg-green-500",
  red: "bg-red-500",
  yellow: "bg-yellow-500",
  orange: "bg-orange-500"
};

export function ProgressBar({ 
  value, 
  max = 100, 
  className, 
  barClassName,
  size = "md",
  color = "blue",
  label
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const progressId = React.useId();
  
  const ariaProps = {
    "aria-valuenow": Math.round(value),
    "aria-valuemin": 0,
    "aria-valuemax": Math.round(max),
    "aria-label": label || `Progress: ${Math.round(value)} of ${Math.round(max)}`
  };

  return (
    <div 
      className={cn("w-full bg-muted rounded-full", sizeClasses[size], className)}
      role="progressbar"
      {...ariaProps}
      id={progressId}
    >
      <div 
        className={cn(
          "rounded-full transition-all duration-300 ease-out progress-bar-fill",
          sizeClasses[size],
          colorClasses[color],
          barClassName
        )}
        style={{ 
          "--progress-width": `${percentage}%`,
          width: `${percentage}%`
        } as React.CSSProperties}
      />
    </div>
  );
}
