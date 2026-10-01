"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { CyberBackgroundIcons } from "@/components/common/cyber-background-icons";

interface CyberPageSpotlightProps {
  children: ReactNode;
  className?: string;
}

export function CyberPageSpotlight({
  children,
  className = "",
}: CyberPageSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let lastClientX = window.innerWidth / 2;
    let lastClientY = window.innerHeight / 3;

    const updateMouseVars = (clientX: number, clientY: number) => {
      lastClientX = clientX;
      lastClientY = clientY;

      const x = `${clientX}px`;
      const y = `${clientY}px`;
      const pageX = `${clientX + window.scrollX}px`;
      const pageY = `${clientY + window.scrollY}px`;

      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", x);
        containerRef.current.style.setProperty("--mouse-y", y);
        containerRef.current.style.setProperty("--mouse-page-x", pageX);
        containerRef.current.style.setProperty("--mouse-page-y", pageY);
      }
      if (spotlightRef.current) {
        spotlightRef.current.style.setProperty("--mouse-x", x);
        spotlightRef.current.style.setProperty("--mouse-y", y);
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      updateMouseVars(e.clientX, e.clientY);
      if (!isHovering) {
        setIsHovering(true);
      }
    };

    const handleScroll = () => {
      updateMouseVars(lastClientX, lastClientY);
    };

    const handlePointerLeave = () => {
      setIsHovering(false);
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    document.addEventListener("mouseleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mouseleave", handlePointerLeave);
    };
  }, [isHovering]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden ${className}`}
    >
      {/* 1. Global Viewport-Fixed Cyber Spotlight Beam (Follows cursor smoothly across all sections) */}
      <div
        ref={spotlightRef}
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0.65,
          background: `
            radial-gradient(650px circle at var(--mouse-x, 50vw) var(--mouse-y, 35vh), rgba(0, 240, 255, 0.13), transparent 75%),
            radial-gradient(950px circle at var(--mouse-x, 50vw) var(--mouse-y, 35vh), rgba(14, 165, 233, 0.06), transparent 80%)
          `,
        }}
      />

      {/* 2. Unified Seamless Cyber Coordinate Grid (Fixed across the entire viewport) */}
      <div
        className="pointer-events-none fixed inset-0 -z-20 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(0, 240, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 240, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "48px 48px",
        }}
      />

      {/* 3. Deep Ambient Glowing Cyber Orbs distributed through the page scroll */}
      <div className="pointer-events-none absolute top-[5%] -left-40 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[130px] -z-10" />
      <div className="pointer-events-none absolute top-[25%] -right-40 w-[650px] h-[650px] bg-sky-500/[0.04] rounded-full blur-[140px] -z-10" />
      <div className="pointer-events-none absolute top-[55%] -left-40 w-[600px] h-[600px] bg-cyan-500/[0.04] rounded-full blur-[130px] -z-10" />
      <div className="pointer-events-none absolute top-[80%] -right-40 w-[600px] h-[600px] bg-blue-500/[0.05] rounded-full blur-[140px] -z-10" />

      {/* 4. Cyber Security & IT Background Ambient Glyphs */}
      <CyberBackgroundIcons isHovering={isHovering} />

      {/* 5. Page Content Layer */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
