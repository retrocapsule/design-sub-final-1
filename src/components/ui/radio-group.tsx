"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

// Simple radio group implementation without Radix UI
const RadioGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value?: string; onValueChange?: (value: string) => void }
>(({ className, children, ...props }, ref) => {
  // Extract these props to prevent passing them to the div
  const { value, onValueChange, ...otherProps } = props;

  // Inject value and onChange to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { 
        groupValue: value,
        onGroupValueChange: onValueChange
      });
    }
    return child;
  });

  return (
    <div
      className={cn("grid gap-2", className)}
      ref={ref}
      {...otherProps}
    >
      {childrenWithProps}
    </div>
  );
});
RadioGroup.displayName = "RadioGroup";

// Simple radio group item implementation without Radix UI
const RadioGroupItem = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> & { 
    value: string; 
    groupValue?: string; 
    onGroupValueChange?: (value: string) => void;
  }
>(({ className, children, id, value, groupValue, onGroupValueChange, ...props }, ref) => {
  return (
    <div className="flex items-center space-x-2">
      <input
        ref={ref}
        type="radio"
        id={id}
        className={cn(
          "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        checked={value === groupValue}
        onChange={() => onGroupValueChange?.(value)}
        value={value}
        {...props}
      />
      {children}
    </div>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem } 