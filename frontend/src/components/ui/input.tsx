import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-lg border bg-[var(--bg-elevated)] px-4 text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/50",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
