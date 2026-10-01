"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import { AnimatedSection } from "@/components/common/animated-section";
import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { ExperienceInterface } from "@/config/experience";
import { cn } from "@/lib/utils";

interface TimelineProps {
  experiences: ExperienceInterface[];
}

// Helper to format date ranges and compute duration
const formatDateDetails = (startDate: Date, endDate: Date | "Present") => {
  const start = new Date(startDate);
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const startYear = start.getFullYear();

  if (endDate === "Present") {
    return {
      years: `${startYear} — Present`,
      fullRange: `${startMonth} ${startYear} — Present`,
      duration: "Ongoing",
      isCurrent: true,
    };
  }

  const end = new Date(endDate);
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const endYear = end.getFullYear();

  // Compute duration in months
  const totalMonths =
    (endYear - startYear) * 12 + (end.getMonth() - start.getMonth()) + 1;
  const durationText = totalMonths > 0 ? `${totalMonths} mos` : "";

  return {
    years: startYear === endYear ? `${startYear}` : `${startYear} — ${endYear}`,
    fullRange: `${startMonth} ${startYear} — ${endMonth} ${endYear}`,
    duration: durationText,
    isCurrent: false,
  };
};

const Timeline: React.FC<TimelineProps> = ({ experiences }) => {
  // Sort experiences by date (most recent first)
  const sortedExperiences = [...experiences].sort((a, b) => {
    const dateA = a.endDate === "Present" ? new Date() : a.endDate;
    const dateB = b.endDate === "Present" ? new Date() : b.endDate;
    return dateB.getTime() - dateA.getTime();
  });

  return (
    <div className="relative w-full max-w-5xl mx-auto py-6">
      {/* 1. Cyber Timeline Stream Status Bar */}
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-border/60 text-xs font-mono text-muted-foreground/80">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
          </span>
          <span className="tracking-wider uppercase text-foreground font-semibold">
            CAREER TIMELINE TRACK
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-cyan-400/80 text-[11px]">
          <span>[REVERSE CHRONOLOGICAL]</span>
          <span>•</span>
          <span>{sortedExperiences.length} MILESTONES</span>
        </div>
      </div>

      {/* 2. Timeline Track with Continuous Vertical Laser Line */}
      <div className="relative">
        {/* Continuous Laser Guide Line (Runs through center of nodes) */}
        {/* Mobile: left is 19px (center of 40px node). Desktop: left is 219px (176px + 24px + 20px) */}
        <div
          className="pointer-events-none absolute left-[19px] md:left-[219px] top-5 bottom-8 w-[2px] bg-gradient-to-b from-cyan-400 via-cyan-500/40 to-cyan-500/10 shadow-[0_0_10px_rgba(0,240,255,0.4)]"
          aria-hidden="true"
        />

        {/* 3. Timeline Items */}
        <div className="space-y-8 sm:space-y-12">
          {sortedExperiences.map((experience, index) => {
            const { years, fullRange, duration, isCurrent } = formatDateDetails(
              experience.startDate,
              experience.endDate
            );

            return (
              <AnimatedSection
                key={experience.id}
                delay={0.12 * (index + 1)}
                direction="up"
              >
                <div className="group relative flex items-start gap-4 md:gap-6">
                  {/* --- Left Column: Timestamp & Status (Desktop md+) --- */}
                  <div className="hidden md:flex flex-col items-end w-44 shrink-0 pt-2 text-right">
                    <div className="flex items-center gap-2 font-mono text-base font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                      )}
                      <span>{years}</span>
                    </div>

                    <span className="text-xs font-mono text-muted-foreground mt-0.5">
                      {fullRange}
                    </span>

                    {duration && (
                      <span className="text-[11px] font-mono text-muted-foreground/70 mt-0.5">
                        ({duration})
                      </span>
                    )}

                    <div className="mt-2.5">
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.25)]">
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                          ACTIVE ROLE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono text-muted-foreground bg-muted/40 border border-border/70">
                          COMPLETED
                        </span>
                      )}
                    </div>
                  </div>

                  {/* --- Center Column: Milestone Node (40x40px) --- */}
                  <div className="relative shrink-0 flex items-center justify-center">
                    {/* Glowing Milestone Circle Node */}
                    <div
                      className={cn(
                        "relative z-10 w-10 h-10 rounded-full border-2 bg-background flex items-center justify-center transition-all duration-300",
                        isCurrent
                          ? "border-cyan-400 text-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.6)] group-hover:scale-110"
                          : "border-border/80 text-muted-foreground group-hover:border-cyan-500/60 group-hover:text-cyan-400 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                      )}
                    >
                      {isCurrent ? (
                        <>
                          <span className="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-cyan-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-400 shadow-[0_0_8px_rgba(0,240,255,1)]" />
                        </>
                      ) : (
                        <Icons.check className="w-4 h-4 text-cyan-400/90 group-hover:text-cyan-400 transition-colors" />
                      )}
                    </div>

                    {/* Horizontal Branch Connector Line (Desktop) */}
                    <div
                      className="hidden md:block absolute left-10 top-5 w-6 h-[2px] bg-gradient-to-r from-cyan-400 to-cyan-500/30 group-hover:from-cyan-400 group-hover:to-cyan-400 group-hover:shadow-[0_0_8px_rgba(0,240,255,0.6)] transition-all"
                      aria-hidden="true"
                    />
                  </div>

                  {/* --- Right Column: Cyber Experience Card --- */}
                  <div className="flex-1 min-w-0">
                    {/* Mobile-only Timestamp Bar (< md) */}
                    <div className="md:hidden flex items-center justify-between gap-2 mb-2 px-1">
                      <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-foreground">
                        {isCurrent && (
                          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
                        )}
                        <span>{years}</span>
                        <span className="text-xs text-muted-foreground font-normal">
                          ({fullRange})
                        </span>
                      </div>
                      {isCurrent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                          ACTIVE
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono text-muted-foreground bg-muted/40 border border-border/70">
                          DONE
                        </span>
                      )}
                    </div>

                    {/* Main Cyber Card */}
                    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md p-5 sm:p-6 transition-all duration-300 hover:border-cyan-500/60 hover:bg-cyan-500/[0.03] hover:shadow-[0_0_30px_rgba(0,240,255,0.12)]">
                      {/* Top Header: Logo + Position + Company + View Details */}
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-3.5 sm:gap-4 flex-1 min-w-0">
                          {/* Company Logo in Cyber Frame */}
                          {experience.logo && (
                            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-border/80 bg-white/95 overflow-hidden flex-shrink-0 flex items-center justify-center p-2 shadow-sm group-hover:border-cyan-500/40 group-hover:shadow-[0_0_15px_rgba(0,240,255,0.2)] transition-all">
                              <Image
                                src={experience.logo}
                                alt={experience.company}
                                width={56}
                                height={56}
                                className="w-full h-full object-contain"
                              />
                            </div>
                          )}

                          {/* Titles */}
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-heading font-bold text-foreground group-hover:text-cyan-400 transition-colors">
                              {experience.position}
                            </h3>

                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-sm text-muted-foreground">
                              <span className="font-medium text-foreground/90">
                                {experience.company}
                              </span>
                              {experience.companyUrl && (
                                <a
                                  href={experience.companyUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-muted-foreground hover:text-cyan-400 transition-colors inline-flex items-center"
                                  aria-label={`Visit ${experience.company}`}
                                >
                                  <Icons.externalLink className="w-3.5 h-3.5" />
                                </a>
                              )}
                              <span>•</span>
                              <span className="text-xs sm:text-sm">
                                {experience.location}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* View Details Action Button */}
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl border-border/70 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 shrink-0 self-start sm:self-auto w-full sm:w-auto"
                          asChild
                        >
                          <Link href={`/experience/${experience.id}`}>
                            View Details
                            <Icons.chevronRight className="ml-1.5 h-4 w-4 text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                          </Link>
                        </Button>
                      </div>

                      {/* Description List / Summary */}
                      <div className="mt-4 pt-4 border-t border-border/50 space-y-2">
                        {experience.description.slice(0, 2).map((desc, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-2 text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            <span className="text-cyan-400 font-mono mt-0.5 select-none">
                              ▹
                            </span>
                            <span>{desc}</span>
                          </div>
                        ))}
                      </div>

                      {/* Key Milestone / Achievement Callout Box */}
                      {experience.achievements && experience.achievements.length > 0 && (
                        <div className="mt-3.5 p-3 rounded-xl border border-cyan-500/20 bg-cyan-500/[0.04] text-xs sm:text-sm">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold block mb-1">
                            ★ KEY MILESTONE / OUTCOME
                          </span>
                          <p className="text-foreground/85 leading-relaxed">
                            {experience.achievements[0]}
                          </p>
                        </div>
                      )}

                      {/* Skills Chips */}
                      {experience.skills && experience.skills.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-border/40 flex flex-wrap items-center gap-1.5">
                          <span className="text-[10px] font-mono text-muted-foreground uppercase mr-1">
                            TECH:
                          </span>
                          {experience.skills.map((skill, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-background/80 text-foreground/80 border border-border/70 hover:border-cyan-500/40 hover:text-cyan-400 transition-colors"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Cyber Reticle Corner Accents on Card */}
                      <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-transparent group-hover:border-cyan-400/80 transition-colors pointer-events-none" />
                      <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-transparent group-hover:border-cyan-400/80 transition-colors pointer-events-none" />
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        {/* 4. Bottom Genesis Milestone Cap */}
        <div className="flex items-center gap-3 pt-8 pl-5 md:pl-56 text-xs font-mono text-muted-foreground/60 select-none">
          <div className="w-2 h-2 rounded-full bg-cyan-500/30 border border-cyan-400/40" />
          <span>[◆ CAREER GENESIS // 2024 INITIALIZATION]</span>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
