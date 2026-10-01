"use client";

import * as React from "react";
import { Shield, Server, Layout, Database, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import SkillsCard from "@/components/skills/skills-card";
import { SkillCategory, skills as allSkills, skillsInterface } from "@/config/skills";
import { cn } from "@/lib/utils";

interface SkillsViewProps {
  skills?: skillsInterface[];
}

const CATEGORIES: Array<{
  id: SkillCategory;
  label: string;
  icon: any;
}> = [
  { id: "All", label: "All Skills", icon: Layers },
  { id: "Security & DevOps", label: "Security & DevOps", icon: Shield },
  { id: "Backend", label: "Backend Architecture", icon: Server },
  { id: "Frontend", label: "Frontend & UI", icon: Layout },
  { id: "Database", label: "Databases", icon: Database },
];

export function SkillsView({ skills = allSkills }: SkillsViewProps) {
  const [activeCategory, setActiveCategory] = React.useState<SkillCategory>("All");

  const filteredSkills = React.useMemo(() => {
    if (activeCategory === "All") return skills;
    return skills.filter((s) => s.category === activeCategory);
  }, [skills, activeCategory]);

  return (
    <div className="space-y-8 w-full">
      {/* Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-card/40 border border-border/70 backdrop-blur-md max-w-3xl mx-auto shadow-sm">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          const count =
            cat.id === "All"
              ? skills.length
              : skills.filter((s) => s.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.25)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <Icon className="w-3.5 h-3.5 text-cyan-400" />
              <span>{cat.label}</span>
              <span
                className={cn(
                  "text-[10px] font-mono px-1.5 py-0.2 rounded-full",
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

      {/* Animated Grid with AnimatePresence */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="w-full"
        >
          <SkillsCard skills={filteredSkills} variant="detailed" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
