"use client";

import React, { useRef, useEffect } from "react";
import Rating from "@/components/skills/rating";
import { skills as allSkills, skillsInterface } from "@/config/skills";

interface MarqueeTrackProps {
  items: skillsInterface[];
  speed?: number; // pixels per second
  initialOffset?: number;
}

function SkillMarqueeCard({ skill }: { skill: skillsInterface }) {
  const IconComponent = skill.icon;

  return (
    <div className="group relative flex items-center gap-3.5 px-4 py-3 sm:py-3.5 rounded-xl border border-border/70 bg-card/50 backdrop-blur-md hover:border-cyan-500/60 hover:bg-cyan-500/10 hover:shadow-[0_0_20px_rgba(0,240,255,0.12)] transition-all duration-300 w-[230px] sm:w-[250px] shrink-0 select-none">
      {/* Icon */}
      <div className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-background/80 border border-border/80 text-foreground group-hover:text-cyan-400 group-hover:border-cyan-500/40 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.2)] transition-all duration-300">
        <IconComponent size={24} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-heading font-semibold text-sm sm:text-base text-foreground tracking-tight group-hover:text-cyan-400 transition-colors truncate">
          {skill.name}
        </h4>
        <div className="flex items-center justify-between mt-1">
          {skill.category && (
            <span className="text-[10px] font-mono text-muted-foreground/80 tracking-wide uppercase truncate max-w-[90px]">
              {skill.category.replace("Security & DevOps", "DevOps")}
            </span>
          )}
          <div className="shrink-0 scale-90 origin-right">
            <Rating stars={skill.rating} />
          </div>
        </div>
      </div>

      {/* Cyber Corner Accent */}
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-transparent group-hover:border-cyan-400/80 transition-colors pointer-events-none" />
    </div>
  );
}

function MarqueeTrack({
  items,
  speed = 32,
  initialOffset = 0,
}: MarqueeTrackProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);

  const xRef = useRef(initialOffset);
  const isDraggingRef = useRef(false);
  const isHoveredRef = useRef(false);
  const hasMovedRef = useRef(false);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const singleWidthRef = useRef(0);

  useEffect(() => {
    const track = trackRef.current;
    const firstSet = setRef.current;
    if (!track || !firstSet) return;

    const measureWidth = () => {
      const gap = parseFloat(getComputedStyle(track).gap) || 16;
      singleWidthRef.current = firstSet.offsetWidth + gap;
    };

    measureWidth();

    const resizeObserver = new ResizeObserver(() => {
      measureWidth();
    });
    resizeObserver.observe(firstSet);

    let animationFrameId: number;
    let lastFrameTime = performance.now();

    const animate = (now: number) => {
      let dt = (now - lastFrameTime) / 1000;
      lastFrameTime = now;

      // Clamp delta time to avoid large jumps when returning to tab
      if (dt > 0.1) dt = 0.016;

      const singleWidth = singleWidthRef.current;

      if (singleWidth > 0 && trackRef.current) {
        if (!isDraggingRef.current) {
          // Coasting inertia decay if user flung the track
          if (Math.abs(velocityRef.current) > 15) {
            xRef.current += velocityRef.current * dt;
            velocityRef.current *= Math.pow(0.08, dt); // smooth friction
          } else {
            velocityRef.current = 0;
            // Normal continuous auto-scroll to the left
            if (!isHoveredRef.current) {
              xRef.current -= speed * dt;
            }
          }

          // Seamless infinite wrap-around
          while (xRef.current <= -singleWidth) {
            xRef.current += singleWidth;
          }
          while (xRef.current > 0) {
            xRef.current -= singleWidth;
          }

          trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [speed]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only respond to main button or touch
    if (e.button !== 0 && e.pointerType === "mouse") return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.clientX;
    lastXRef.current = e.clientX;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Ignored if capture unsupported
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const currentX = e.clientX;
    const deltaX = currentX - lastXRef.current;
    const now = performance.now();
    const dt = (now - lastTimeRef.current) / 1000;

    if (Math.abs(currentX - startXRef.current) > 5) {
      hasMovedRef.current = true;
    }

    lastXRef.current = currentX;
    lastTimeRef.current = now;

    xRef.current += deltaX;

    const singleWidth = singleWidthRef.current;
    if (singleWidth > 0) {
      while (xRef.current <= -singleWidth) {
        xRef.current += singleWidth;
      }
      while (xRef.current > 0) {
        xRef.current -= singleWidth;
      }
    }

    // Measure drag velocity (px/s) with exponential smoothing
    if (dt > 0.001) {
      const instantVelocity = deltaX / dt;
      velocityRef.current = velocityRef.current * 0.4 + instantVelocity * 0.6;
    }

    if (trackRef.current) {
      trackRef.current.style.transform = `translate3d(${xRef.current}px, 0, 0)`;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // Ignored
    }

    // Clamp launch velocity to prevent extreme spin
    if (Math.abs(velocityRef.current) > 1600) {
      velocityRef.current = Math.sign(velocityRef.current) * 1600;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden select-none cursor-grab active:cursor-grabbing touch-pan-y py-1.5"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerEnter={() => {
        isHoveredRef.current = true;
      }}
      onPointerLeave={() => {
        isHoveredRef.current = false;
      }}
      onClickCapture={(e) => {
        if (hasMovedRef.current) {
          e.stopPropagation();
        }
      }}
    >
      <div
        ref={trackRef}
        className="flex gap-4 w-max will-change-transform"
        style={{ transform: `translate3d(${initialOffset}px, 0, 0)` }}
      >
        {/* Set 1: Measured reference */}
        <div ref={setRef} className="flex gap-4 shrink-0">
          {items.map((skill, idx) => (
            <SkillMarqueeCard key={`s1-${idx}-${skill.name}`} skill={skill} />
          ))}
        </div>

        {/* Set 2: Duplicate for seamless loop */}
        <div className="flex gap-4 shrink-0" aria-hidden="true">
          {items.map((skill, idx) => (
            <SkillMarqueeCard key={`s2-${idx}-${skill.name}`} skill={skill} />
          ))}
        </div>

        {/* Set 3: Extra padding for wide monitors */}
        <div className="flex gap-4 shrink-0" aria-hidden="true">
          {items.map((skill, idx) => (
            <SkillMarqueeCard key={`s3-${idx}-${skill.name}`} skill={skill} />
          ))}
        </div>

        {/* Set 4: Full viewport coverage guarantee */}
        <div className="flex gap-4 shrink-0" aria-hidden="true">
          {items.map((skill, idx) => (
            <SkillMarqueeCard key={`s4-${idx}-${skill.name}`} skill={skill} />
          ))}
        </div>
      </div>
    </div>
  );
}

interface SkillsMarqueeProps {
  skills?: skillsInterface[];
  rows?: 1 | 2;
}

export default function SkillsMarquee({
  skills = allSkills,
  rows = 2,
}: SkillsMarqueeProps) {
  // Curate 2 rows if requested:
  // Row 1: Core Engine, Security, DevOps, Backend & Database
  // Row 2: Frontend, Languages & Web Frameworks
  const row1Skills =
    rows === 2
      ? skills.filter(
          (s) =>
            s.category === "Security & DevOps" ||
            s.category === "Backend" ||
            s.category === "Database"
        )
      : skills;

  const row2Skills =
    rows === 2
      ? skills.filter((s) => s.category === "Frontend")
      : [];

  // Fallback to even/odd split if categories aren't populated
  const finalRow1 =
    row1Skills.length > 0
      ? row1Skills
      : skills.filter((_, i) => i % 2 === 0);

  const finalRow2 =
    row2Skills.length > 0
      ? row2Skills
      : skills.filter((_, i) => i % 2 !== 0);

  return (
    <div className="relative w-full max-w-6xl mx-auto space-y-3 sm:space-y-4">
      {/* High-tech HUD Feed Header */}
      <div className="flex items-center justify-between px-2 text-[11px] font-mono text-muted-foreground/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="tracking-wider uppercase text-foreground/90 font-medium">
            TECH STACK STREAM
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-cyan-400/80 text-[10px] sm:text-[11px]">
          <span className="tracking-widest uppercase">◄◄ DRAG / SWIPE TO EXPLORE ►►</span>
        </div>
      </div>

      {/* Marquee Wrapper with Cyber Gradient Edge Masks */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/20 p-2 sm:p-3">
        {/* Left Gradient Edge Fade */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-background via-background/70 to-transparent z-10" />

        {/* Right Gradient Edge Fade */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-background via-background/70 to-transparent z-10" />

        {/* Row 1: Continual left movement */}
        <MarqueeTrack items={finalRow1} speed={32} initialOffset={0} />

        {/* Row 2: Continual left movement with offset and slight speed variation for organic cyber flow */}
        {rows === 2 && finalRow2.length > 0 && (
          <MarqueeTrack items={finalRow2} speed={27} initialOffset={-140} />
        )}
      </div>
    </div>
  );
}
