import Image from "next/image";
import Link from "next/link";
import React from "react";

import { Icons } from "@/components/common/icons";
import { Button } from "@/components/ui/button";
import { ValidProjectStatus } from "@/config/constants";
import { ProjectInterface } from "@/config/projects";
import { cn } from "@/lib/utils";

export function ProjectStatusBadge({
  status,
  className,
}: {
  status?: ValidProjectStatus;
  className?: string;
}) {
  if (!status) return null;

  const statusConfig: Record<
    ValidProjectStatus,
    { label: string; container: string; dot: string; ping?: boolean }
  > = {
    Done: {
      label: "Done",
      container:
        "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 bg-background/80",
      dot: "bg-emerald-400",
      ping: false,
    },
    "In Progress": {
      label: "In Progress",
      container:
        "bg-amber-500/15 text-amber-400 border-amber-500/30 bg-background/80",
      dot: "bg-amber-400",
      ping: true,
    },
    Maintained: {
      label: "Maintained",
      container:
        "bg-sky-500/15 text-sky-400 border-sky-500/30 bg-background/80",
      dot: "bg-sky-400",
      ping: false,
    },
    Planned: {
      label: "Planned",
      container:
        "bg-slate-500/15 text-slate-400 border-slate-500/30 bg-background/80",
      dot: "bg-slate-400",
      ping: false,
    },
  };

  const current = statusConfig[status] || statusConfig.Done;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium border backdrop-blur-md shadow-sm select-none",
        current.container,
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        {current.ping && (
          <span
            className={cn(
              "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
              current.dot
            )}
          />
        )}
        <span
          className={cn(
            "relative inline-flex rounded-full h-2 w-2",
            current.dot
          )}
        />
      </span>
      {current.label}
    </span>
  );
}

// Specialized Project Banner Preview (Solves generic placeholder logos)
function ProjectCardBanner({ project }: { project: ProjectInterface }) {
  // 1. Bash Script / Automation Project: Cyber Terminal Preview
  if (
    project.id === "Automate-backup" ||
    project.techStack.includes("Bash") ||
    project.techStack.includes("Shell Scripting")
  ) {
    return (
      <div className="relative w-full h-[180px] bg-slate-950/95 rounded-xl overflow-hidden border border-border/80 flex flex-col font-mono text-[11px] p-3 select-none group-hover:border-cyan-500/40 transition-colors">
        {/* Terminal Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40 text-muted-foreground/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[10px] text-muted-foreground">backup_daemon.sh</span>
          <span className="text-[10px] text-cyan-400 font-bold">BASH</span>
        </div>

        {/* Console Execution Preview */}
        <div className="pt-2.5 space-y-1 text-xs">
          <div className="text-muted-foreground">
            <span className="text-cyan-400">sultan@box:~$</span> ./backup_cron.sh
          </div>
          <div className="text-emerald-400/90 text-[11px]">
            [OK] Syncing /var/critical_data/
          </div>
          <div className="text-muted-foreground/80 text-[11px]">
            &gt; Protocol: rsync -avz --delete
          </div>
          <div className="text-cyan-300 font-semibold text-[11px]">
            &gt; [SUCCESS] Verified checksum OK
          </div>
        </div>

        {/* Scanline Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/[0.03] to-transparent pointer-events-none" />
      </div>
    );
  }

  // 2. Happy Tour & Rent Car: Modern Web Platform Preview
  if (project.id === "happytour") {
    return (
      <div className="relative w-full h-[180px] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 rounded-xl overflow-hidden border border-border/80 flex flex-col p-3 select-none group-hover:border-cyan-500/40 transition-colors">
        {/* Browser Header Bar */}
        <div className="flex items-center justify-between pb-2 border-b border-border/40 text-muted-foreground/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="bg-background/60 border border-border/60 rounded px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
            happytour.app/catalog
          </div>
          <span className="text-[10px] font-mono text-cyan-400 font-bold">NEXT.JS</span>
        </div>

        {/* Web Mock Content */}
        <div className="pt-3 flex flex-col justify-between flex-1">
          <div>
            <span className="text-[10px] font-mono uppercase text-cyan-400 tracking-wider font-semibold">
              FLEET & TOURISM PORTAL
            </span>
            <p className="text-sm font-bold text-foreground mt-0.5">
              Online Fleet & Travel Reservation
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-muted-foreground">
            <div className="p-1.5 rounded bg-background/60 border border-border/60 flex items-center justify-between">
              <span>Booking</span>
              <span className="text-emerald-400">Live</span>
            </div>
            <div className="p-1.5 rounded bg-background/60 border border-border/60 flex items-center justify-between">
              <span>Security</span>
              <span className="text-cyan-400">Active</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. Real Screenshot Banner (e.g. Kabil webapp)
  if (project.companyLogoImg && project.companyLogoImg !== "/logo.png") {
    return (
      <div className="relative w-full h-[180px] overflow-hidden rounded-xl border border-border/80 bg-background/90 group-hover:border-cyan-500/40 transition-colors">
        <Image
          src={project.companyLogoImg}
          alt={project.companyName}
          fill
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // 4. Default High-Tech Fallback Banner
  return (
    <div className="relative w-full h-[180px] bg-card/60 rounded-xl overflow-hidden border border-border/80 flex items-center justify-center p-4">
      <div className="text-center space-y-1">
        <Icons.laptop className="w-8 h-8 text-cyan-400 mx-auto" />
        <span className="text-xs font-mono text-muted-foreground uppercase">
          PROJECT REPOSITORY
        </span>
      </div>
    </div>
  );
}

interface ProjectCardProps {
  project: ProjectInterface;
  showImage?: boolean;
}

export default function ProjectCard({
  project,
  showImage = true,
}: ProjectCardProps) {
  return (
    <div className="group relative p-5 rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md flex flex-col justify-between hover:border-cyan-500/50 hover:bg-cyan-500/[0.02] hover:shadow-[0_0_28px_rgba(0,240,255,0.1)] transition-all duration-300 h-full">
      {/* Banner + Badges */}
      {showImage ? (
        <div className="relative mb-4">
          <ProjectCardBanner project={project} />

          {/* Floating Status Badge (Top Left) */}
          {project.status && (
            <div className="absolute top-2.5 left-2.5 z-10">
              <ProjectStatusBadge status={project.status} />
            </div>
          )}

          {/* Floating Type Badge (Top Right) */}
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-background/85 text-muted-foreground border border-border/80 backdrop-blur-md">
              {project.type}
            </span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 mb-4">
          {project.status && <ProjectStatusBadge status={project.status} />}
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-background/80 text-muted-foreground border border-border/80">
            {project.type}
          </span>
        </div>
      )}

      {/* Card Info */}
      <div className="flex-1 flex flex-col min-w-0">
        <h3 className="font-heading font-bold text-lg sm:text-xl text-foreground tracking-tight group-hover:text-cyan-400 transition-colors line-clamp-1">
          {project.companyName}
        </h3>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed my-2.5 flex-grow">
          {project.shortDescription}
        </p>

        {/* Categories Chips */}
        <div className="flex flex-wrap gap-1.5 my-3">
          {project.category.map((cat, idx) => (
            <span
              key={idx}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/25"
            >
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Action Row: View Project Button + Direct External Links */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-border/50">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-border/70 hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:text-cyan-400 text-xs"
          asChild
        >
          <Link href={`/projects/${project.id}`}>
            View Details
            <Icons.chevronRight className="w-3.5 h-3.5 ml-1 text-cyan-400" />
          </Link>
        </Button>

        <div className="flex items-center gap-1.5">
          {project.githubLink && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border/70 bg-background/50 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10 text-muted-foreground transition-all"
              aria-label="GitHub Repository"
              title="View Source on GitHub"
            >
              <Icons.gitHub className="w-4 h-4" />
            </a>
          )}
          {project.websiteLink && (
            <a
              href={project.websiteLink}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-border/70 bg-background/50 hover:border-cyan-500/50 hover:text-cyan-400 hover:bg-cyan-500/10 text-muted-foreground transition-all"
              aria-label="Live Website"
              title="Visit Live Application"
            >
              <Icons.externalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>

      {/* Cyber Reticle Corner Accents on Hover */}
      <div className="absolute top-1.5 right-1.5 w-1.5 h-1.5 border-t border-r border-transparent group-hover:border-cyan-400/80 transition-colors pointer-events-none" />
      <div className="absolute bottom-1.5 left-1.5 w-1.5 h-1.5 border-b border-l border-transparent group-hover:border-cyan-400/80 transition-colors pointer-events-none" />
    </div>
  );
}
