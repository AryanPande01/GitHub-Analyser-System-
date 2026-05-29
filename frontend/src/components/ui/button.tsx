import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" | "lg" }
>(({ className, variant = "primary", size = "md", ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg)] disabled:pointer-events-none disabled:opacity-50",
      size === "sm" && "h-8 px-3 text-xs",
      size === "md" && "h-10 px-4 text-sm",
      size === "lg" && "h-12 px-6 text-base",
      variant === "primary" && "bg-[var(--accent)] text-black hover:bg-[var(--accent-dim)] shadow-lg shadow-emerald-500/20",
      variant === "secondary" && "border bg-[var(--bg-elevated)] text-[var(--text)] hover:bg-[var(--bg-hover)]",
      variant === "ghost" && "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]",
      className
    )}
    {...props}
  />
));
Button.displayName = "Button";
