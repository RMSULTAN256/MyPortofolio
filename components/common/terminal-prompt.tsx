"use client";

import * as React from "react";

const ROLES = ["Fullstack Dev", "RHCSA", "Cyber Security"];

interface TerminalPromptProps {
  className?: string;
}

export function TerminalPrompt({ className = "" }: TerminalPromptProps) {
  const [roleIndex, setRoleIndex] = React.useState(0);
  const [displayedText, setDisplayedText] = React.useState("");
  const [isDeleting, setIsDeleting] = React.useState(false);

  React.useEffect(() => {
    const currentRole = ROLES[roleIndex];
    let timer: NodeJS.Timeout;

    if (!isDeleting) {
      // Typing mode
      if (displayedText.length < currentRole.length) {
        timer = setTimeout(() => {
          setDisplayedText(currentRole.slice(0, displayedText.length + 1));
        }, 110);
      } else {
        // Finished typing word, pause before backspacing
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 1900);
      }
    } else {
      // Deleting mode
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(currentRole.slice(0, displayedText.length - 1));
        }, 55);
      } else {
        // Finished deleting, transition to next role
        setIsDeleting(false);
        setRoleIndex((prev) => (prev + 1) % ROLES.length);
      }
    }

    return () => clearTimeout(timer);
  }, [displayedText, isDeleting, roleIndex]);

  return (
    <span
      className={`inline-flex items-center font-mono text-xs sm:text-sm tracking-tight select-none ${className}`}
    >
      <span className="text-cyan-400 font-bold">sultan</span>
      <span className="text-muted-foreground/60">@</span>
      <span className="text-emerald-400 font-bold">fulldev</span>
      <span className="text-muted-foreground/60">:</span>
      <span className="text-sky-400 font-semibold">~</span>
      <span className="text-foreground/90 font-bold mr-1.5">$</span>
      {/* Fixed-width slot reserving space for longest text so navbar menu never shifts */}
      <span className="inline-flex items-center w-[120px] sm:w-[138px] flex-shrink-0">
        <span className="text-cyan-200 dark:text-cyan-300 font-medium drop-shadow-[0_0_8px_rgba(0,240,255,0.35)]">
          {displayedText}
        </span>
        <span className="inline-block w-1.5 sm:w-2 h-3.5 sm:h-4 bg-cyan-400 animate-pulse ml-0.5 shadow-[0_0_8px_rgba(0,240,255,0.8)] flex-shrink-0" />
      </span>
    </span>
  );
}
