"use client";

import * as React from "react";
import { Layers, Laptop, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ProjectCard from "@/components/projects/project-card";
import { Projects as allProjects, ProjectInterface } from "@/config/projects";
import { cn } from "@/lib/utils";

type ProjectFilterType = "all" | "personal" | "professional";

interface TabItem {
  id: ProjectFilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PROJECT_TABS: TabItem[] = [
  { id: "all", label: "All Projects", icon: Layers },
  { id: "personal", label: "Personal Projects", icon: Laptop },
  { id: "professional", label: "Freelance & Client", icon: Building },
];

export function ProjectsView({
  projects = allProjects,
}: {
  projects?: ProjectInterface[];
}) {
  const [activeTab, setActiveTab] = React.useState<ProjectFilterType>("all");

  const filteredProjects = React.useMemo(() => {
    if (activeTab === "all") return projects;
    if (activeTab === "personal") {
      return projects.filter((p) => p.type === "Personal");
    }
    if (activeTab === "professional") {
      return projects.filter(
        (p) => p.type === "Professional" || p.type === "Freelance"
      );
    }
    return projects;
  }, [projects, activeTab]);

  const getCount = (tabId: ProjectFilterType) => {
    if (tabId === "all") return projects.length;
    if (tabId === "personal") {
      return projects.filter((p) => p.type === "Personal").length;
    }
    if (tabId === "professional") {
      return projects.filter(
        (p) => p.type === "Professional" || p.type === "Freelance"
      ).length;
    }
    return 0;
  };

  return (
    <div className="space-y-8 w-full">
      {/* 1. Cyber Filter Bar */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-card/40 border border-border/70 backdrop-blur-md max-w-xl mx-auto shadow-sm">
        {PROJECT_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const count = getCount(tab.id);

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 select-none",
                isActive
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{tab.label}</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.5 rounded-full font-semibold",
                  isActive
                    ? "bg-cyan-500/30 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 2. Animated Projects Grid */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="w-full"
        >
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full">
            {filteredProjects.map((project) => (
              <ProjectCard project={project} key={project.id} showImage={true} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-16 text-muted-foreground font-mono text-sm">
              [NO PROJECTS FOUND IN THIS CATEGORY]
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
