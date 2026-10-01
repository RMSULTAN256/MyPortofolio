import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AnimatedSection } from "@/components/common/animated-section";
import { ClientPageWrapper } from "@/components/common/client-page-wrapper";
import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { experiences } from "@/config/experience";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

interface ExperienceDetailPageProps {
  params: Promise<{
    expId: string;
  }>;
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
  const durationText = totalMonths > 0 ? `${totalMonths} months` : "";

  return {
    years: startYear === endYear ? `${startYear}` : `${startYear} — ${endYear}`,
    fullRange: `${startMonth} ${startYear} — ${endMonth} ${endYear}`,
    duration: durationText,
    isCurrent: false,
  };
};

export async function generateMetadata({
  params,
}: ExperienceDetailPageProps): Promise<Metadata> {
  const { expId } = await params;
  const experience = experiences.find((c) => c.id === expId);

  if (!experience) {
    return {
      title: "Experience Not Found",
    };
  }

  return {
    title: `${experience.position} at ${experience.company} | Experience Dossier`,
    description: `Detailed career record of ${experience.position} at ${experience.company}.`,
    alternates: {
      canonical: `${siteConfig.url}/experience/${expId}`,
    },
  };
}

export default async function ExperienceDetailPage({
  params,
}: ExperienceDetailPageProps) {
  const { expId } = await params;
  const experience = experiences.find((c) => c.id === expId);

  if (!experience) {
    redirect("/experience");
  }

  const { years, fullRange, duration, isCurrent } = formatDateDetails(
    experience.startDate,
    experience.endDate
  );

  // Other experiences for the bottom navigation
  const otherExperiences = experiences.filter((e) => e.id !== expId);

  return (
    <ClientPageWrapper>
      <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
        {/* 1. Cyber Navigation Bar & Telemetry Breadcrumb */}
        <AnimatedSection className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="w-fit -ml-2 text-muted-foreground hover:text-cyan-400 hover:bg-cyan-500/10 transition-colors"
            asChild
          >
            <Link href="/experience">
              <Icons.chevronLeft className="mr-1.5 h-4 w-4 text-cyan-400" />
              Back to Timeline
            </Link>
          </Button>

          <div className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground/80">
            <span className="text-cyan-400">&gt;_ SYS // EXP_DOSSIER //</span>
            <span className="uppercase text-foreground font-semibold">
              {experience.id}
            </span>
            <span>•</span>
            {isCurrent ? (
              <span className="text-cyan-400 font-medium">[STATUS: ACTIVE]</span>
            ) : (
              <span className="text-muted-foreground">[STATUS: VERIFIED]</span>
            )}
          </div>
        </AnimatedSection>

        {/* 2. Main Cyber Dossier Hero Card */}
        <AnimatedSection delay={0.15}>
          <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md p-6 sm:p-8 shadow-[0_0_30px_rgba(0,240,255,0.06)] hover:border-cyan-500/50 transition-all duration-300">
            {/* Tactical Reticle Corners */}
            <div className="absolute top-2 left-2 w-2 h-2 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute top-2 right-2 w-2 h-2 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-2 h-2 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-2 h-2 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

            {/* Header: Logo + Position + Dates */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pb-6 border-b border-border/50">
              <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0">
                {/* Logo Frame */}
                {experience.logo && (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl border border-border/80 bg-white/95 overflow-hidden flex-shrink-0 flex items-center justify-center p-3 shadow-md">
                    <Image
                      src={experience.logo}
                      alt={experience.company}
                      width={80}
                      height={80}
                      className="w-full h-full object-contain"
                      priority
                    />
                  </div>
                )}

                {/* Role Titles */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold text-foreground tracking-tight leading-tight">
                    {experience.position}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-sm sm:text-base text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {experience.company}
                    </span>

                    {experience.companyUrl && (
                      <a
                        href={experience.companyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-cyan-400 transition-colors inline-flex items-center gap-1 text-xs sm:text-sm"
                        aria-label={`Visit ${experience.company}`}
                      >
                        <Icons.externalLink className="w-3.5 h-3.5" />
                        <span className="underline underline-offset-2">Visit Website</span>
                      </a>
                    )}

                    <span>•</span>
                    <span className="text-xs sm:text-sm">
                      {experience.location}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp & Status Badge (Unbreakable layout) */}
              <div className="shrink-0 flex flex-col items-start sm:items-end gap-1.5 self-start sm:self-auto">
                <div className="flex items-center gap-2 whitespace-nowrap">
                  <span className="font-mono text-sm sm:text-base font-bold text-foreground">
                    {years}
                  </span>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 shadow-[0_0_12px_rgba(0,240,255,0.25)] whitespace-nowrap">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      ACTIVE ROLE
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-mono font-medium text-muted-foreground bg-muted/50 border border-border/80 whitespace-nowrap">
                      COMPLETED
                    </span>
                  )}
                </div>

                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  {fullRange} {duration ? `(${duration})` : ""}
                </span>
              </div>
            </div>

            {/* 3. Quick Telemetry Metrics Strip */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
              <div className="p-3.5 rounded-xl border border-border/60 bg-background/50">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
                  TIMEFRAME / DURATION
                </span>
                <span className="text-sm font-mono font-semibold text-foreground mt-0.5 block">
                  {duration || "Active Role"}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {fullRange}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-background/50">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
                  ORGANIZATION
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block truncate">
                  {experience.company}
                </span>
                <span className="text-[11px] text-muted-foreground">
                  {experience.location}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-border/60 bg-background/50">
                <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider block">
                  PRIMARY FOCUS
                </span>
                <span className="text-sm font-semibold text-cyan-400 mt-0.5 block">
                  {experience.id === "rhcsa"
                    ? "RHEL Hardening & Systems"
                    : "DevSecOps & Fullstack"}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">
                  Enterprise Infrastructure
                </span>
              </div>
            </div>

            {/* 4. Core Responsibilities & Workflow */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
                  01 // CORE RESPONSIBILITIES & WORKFLOW
                </span>
              </div>

              <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-background/40 space-y-3">
                {experience.description.map((desc, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm sm:text-base leading-relaxed text-foreground/90">
                    <span className="text-cyan-400 font-mono mt-1 select-none">
                      ▹
                    </span>
                    <span>{desc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Key Milestones & Certified Outcomes */}
            {experience.achievements && experience.achievements.length > 0 && (
              <div className="space-y-3.5 pt-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
                    02 // CERTIFIED MILESTONES & OUTCOMES
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {experience.achievements.map((achievement, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.04] flex items-start gap-3.5 hover:border-cyan-500/40 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-400/30 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5">
                        <Icons.star className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                          MILESTONE 0{idx + 1}
                        </span>
                        <p className="text-sm sm:text-base text-foreground/95 leading-relaxed font-medium">
                          {achievement}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 6. Technologies, Tools & Methodologies */}
            {experience.skills && experience.skills.length > 0 && (
              <div className="space-y-3.5 pt-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-semibold bg-cyan-500/10 border border-cyan-500/25 px-2.5 py-0.5 rounded-full">
                    03 // TECHNOLOGIES & TOOLS DEPLOYED
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-xl border border-border/60 bg-background/40">
                  <div className="flex flex-wrap items-center gap-2">
                    {experience.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-mono font-medium bg-background border border-border/80 hover:border-cyan-500/50 hover:text-cyan-400 hover:shadow-[0_0_12px_rgba(0,240,255,0.15)] transition-all"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mr-2" />
                        {skill}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3.5 text-xs text-muted-foreground font-mono">
                    Verified tooling utilized in production environments for {experience.company}.
                  </p>
                </div>
              </div>
            )}
          </div>
        </AnimatedSection>

        {/* 7. Other Career Milestones Navigation */}
        {otherExperiences.length > 0 && (
          <AnimatedSection delay={0.25} className="space-y-4 pt-2">
            <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
              <span className="uppercase tracking-wider">OTHER CAREER MILESTONES</span>
              <span>[SWITCH DOSSIER]</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {otherExperiences.map((other) => (
                <Link
                  key={other.id}
                  href={`/experience/${other.id}`}
                  className="group relative p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md hover:border-cyan-500/50 hover:bg-cyan-500/[0.04] hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {other.logo && (
                      <div className="w-10 h-10 rounded-lg border border-border/80 bg-white/95 p-1.5 shrink-0">
                        <Image
                          src={other.logo}
                          alt={other.company}
                          width={40}
                          height={40}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h4 className="font-heading font-semibold text-sm text-foreground group-hover:text-cyan-400 transition-colors truncate">
                        {other.position}
                      </h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {other.company}
                      </p>
                    </div>
                  </div>

                  <Icons.chevronRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform shrink-0" />
                </Link>
              ))}
            </div>
          </AnimatedSection>
        )}

        {/* 8. Bottom Center Action Button */}
        <AnimatedSection delay={0.3} className="flex justify-center pt-4">
          <Button
            variant="outline"
            className="rounded-xl border-border/80 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400"
            asChild
          >
            <Link href="/experience">
              <Icons.chevronLeft className="mr-2 h-4 w-4 text-cyan-400" />
              View Full Career Timeline
            </Link>
          </Button>
        </AnimatedSection>
      </div>
    </ClientPageWrapper>
  );
}
