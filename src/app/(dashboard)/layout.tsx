"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Skull,
  Home,
  List,
  BarChart3,
  DollarSign,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils/index";

const navItems = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/queue", label: "Content Queue", icon: List },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/revenue", label: "Revenue", icon: DollarSign },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-60 md:fixed md:inset-y-0 bg-[#1a1a1a] border-r border-border z-30">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <Skull className="h-8 w-8 text-[#8B0000]" />
          <span className="text-xl font-bold tracking-tight text-[#e0e0e0]">
            Horror Factory
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  active
                    ? "bg-[#8B0000]/15 text-[#ff4444] border-l-2 border-[#8B0000]"
                    : "text-muted-foreground hover:text-[#e0e0e0] hover:bg-[#ffffff08]"
                )}
              >
                <item.icon className={cn("h-5 w-5", active && "text-[#ff4444]")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            v1.0.0 &middot; Automated Content
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-6">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-[#1a1a1a] border-t border-border z-30">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-1 text-xs transition-colors",
                  active
                    ? "text-[#ff4444]"
                    : "text-muted-foreground hover:text-[#e0e0e0]"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate max-w-[60px]">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
