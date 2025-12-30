import * as React from "react"

import { cn } from "@/lib/utils"

interface Props extends React.ComponentProps<"input"> {
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, Props>(
  ({ className, type, hasError, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          hasError ? "border-destructive ring-1 ring-destructive" : undefined,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
