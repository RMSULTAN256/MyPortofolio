"use client";

import Link from "next/link";
import * as React from "react";
import { X, ChevronRight } from "lucide-react";

import { TerminalPrompt } from "@/components/common/terminal-prompt";
import { useLockBody } from "@/hooks/use-lock-body";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  items: Array<{
    title: string;
    href: string;
    disabled?: boolean;
  }>;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function MobileNav({ items, onClose, children }: MobileNavProps) {
  useLockBody();

  return (
    <>
      {/* Dimmed backdrop with subtle blur */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Floating Cyber HUD Dropdown Card */}
      <div className="fixed top-20 inset-x-4 max-w-sm mx-auto z-50 rounded-2xl border border-cyan-500/30 bg-background/95 backdrop-blur-2xl p-5 shadow-2xl animate-in slide-in-from-top-4 duration-200 md:hidden">
        <div className="flex items-center justify-between pb-3 border-b border-border/50">
          <TerminalPrompt />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <nav className="grid gap-1 py-3">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.disabled ? "#" : item.href}
              onClick={onClose}
              className={cn(
                "flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-cyan-500/10 hover:text-cyan-400",
                item.disabled && "cursor-not-allowed opacity-60"
              )}
            >
              <span>{item.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-cyan-400/50" />
            </Link>
          ))}
        </nav>

        {children ? <div className="pt-2 border-t border-border/50">{children}</div> : null}
      </div>
    </>
  );
}
