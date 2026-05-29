import { cn } from "@/lib/utils";

export function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "muted";
  className?: string;
}) {
  const variants = {
    default: "bg-[var(--bg-hover)] text-[var(--text-muted)]",
    success: "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20",
    info: "bg-blue-500/10 text-blue-400 ring-1 ring-blue-500/20",
    muted: "bg-zinc-500/10 text-[var(--text-dim)]",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
