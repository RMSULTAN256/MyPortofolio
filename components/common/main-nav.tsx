"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Menu, X } from "lucide-react";

import { MobileNav } from "@/components/common/mobile-nav";
import { ModeToggle } from "@/components/common/mode-toggle";
import { TerminalPrompt } from "@/components/common/terminal-prompt";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface MainNavProps {
  items?: Array<{
    title: string;
    href: string;
    disabled?: boolean;
  }>;
  children?: React.ReactNode;
}

export function MainNav({ items, children }: MainNavProps) {
  const [showMobileMenu, setShowMobileMenu] = React.useState<boolean>(false);
  const pathname = usePathname();

  React.useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  return (
    <div className="pointer-events-auto flex items-center justify-between w-full max-w-5xl h-14 px-3.5 sm:px-5 rounded-full border border-cyan-500/30 bg-background/80 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_20px_rgba(0,240,255,0.08)] transition-all duration-300">
      {/* 1. Left: Brand Logo (Linux Terminal Style with Role Typewriter) */}
      <Link
        href="/"
        className="flex items-center group flex-shrink-0 px-2 py-1 rounded-lg hover:bg-cyan-500/10 transition-colors"
        aria-label="Home"
      >
        <TerminalPrompt />
      </Link>

      {/* 2. Center: Desktop Nav Links */}
      {items?.length ? (
        <nav className="hidden md:flex items-center gap-0.5 lg:gap-1">
          {items.map((item, index) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={index}
                href={item.disabled ? "#" : item.href}
                className={cn(
                  "relative px-2.5 lg:px-3 py-1 rounded-full text-xs lg:text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400 font-semibold border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  item.disabled && "cursor-not-allowed opacity-50"
                )}
              >
                {item.title}
              </Link>
            );
          })}
        </nav>
      ) : null}

      {/* 3. Right: Controls & Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <ModeToggle />

        {/* Mobile Hamburger Trigger */}
        <button
          className="flex md:hidden items-center justify-center w-8 h-8 rounded-full border border-border/80 text-muted-foreground hover:text-foreground hover:border-cyan-500/40 transition-colors"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-label={showMobileMenu ? "Close menu" : "Open menu"}
        >
          {showMobileMenu ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer / Popup */}
      {showMobileMenu && items && (
        <MobileNav
          items={items}
          onClose={() => setShowMobileMenu(false)}
        >
          {children}
        </MobileNav>
      )}
    </div>
  );
}
