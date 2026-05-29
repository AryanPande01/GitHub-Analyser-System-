"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  BarChart3,
  GitCompare,
  LayoutDashboard,
  MessageSquare,
  Moon,
  Route,
  Search,
  Sun,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/analyze", label: "Analyze", icon: Search, desc: "Scan profiles" },
  { href: "/recruiter", label: "Recruiter", icon: Users, desc: "Rank candidates" },
  { href: "/compare", label: "Compare", icon: GitCompare, desc: "Side by side" },
  { href: "/roadmap", label: "Roadmap", icon: Route, desc: "Learning paths" },
  { href: "/chat", label: "AI Chat", icon: MessageSquare, desc: "Career coach" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r glass">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--accent)] text-black">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">Career Analyzer</p>
          <p className="mt-0.5 text-[11px] text-[var(--text-dim)]">GitHub Intelligence</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {nav.map(({ href, label, icon: Icon, desc }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all",
                active
                  ? "bg-[var(--accent-glow)] text-[var(--accent)] ring-1 ring-[var(--accent)]/30"
                  : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-[var(--accent)]")} />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">{label}</p>
                <p className="mt-0.5 truncate text-[11px] text-[var(--text-dim)]">{desc}</p>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--text-muted)] transition hover:bg-[var(--bg-hover)] hover:text-[var(--text)]"
        >
          {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          Toggle theme
        </button>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t glass md:hidden">
      {nav.slice(0, 4).map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            "flex flex-1 flex-col items-center gap-1 py-2 text-[10px]",
            pathname.startsWith(href) ? "text-[var(--accent)]" : "text-[var(--text-dim)]"
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 text-[var(--text-dim)]">
          <LayoutDashboard className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wider">Dashboard</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-[var(--text-muted)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}
