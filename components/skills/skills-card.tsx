"use client";

import { motion } from "framer-motion";

import Rating from "@/components/skills/rating";
import { featuredSkills, skillsInterface } from "@/config/skills";

interface SkillsCardProps {
  skills?: skillsInterface[];
  variant?: "compact" | "detailed";
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: "easeOut" as const,
    },
  },
};

export default function SkillsCard({
  skills = featuredSkills,
  variant = "compact",
}: SkillsCardProps) {
  // 1. Compact Variant (For dashboard: simple, clean, no description)
  if (variant === "compact") {
    return (
      <div className="mx-auto grid justify-center gap-3.5 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl w-full">
        {skills.map((skill, id) => (
          <div
            key={id}
            className="group relative flex items-center gap-4 p-4 rounded-xl border border-border/70 bg-card/40 backdrop-blur-md hover:border-cyan-500/50 hover:bg-cyan-500/5 hover:shadow-[0_0_20px_rgba(0,240,255,0.08)] transition-all duration-300"
          >
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-xl bg-background/80 border border-border/80 text-foreground group-hover:text-cyan-400 group-hover:border-cyan-500/30 group-hover:scale-105 transition-all duration-300">
              <skill.icon size={26} />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-sm sm:text-base text-foreground tracking-tight group-hover:text-cyan-400 transition-colors truncate">
                {skill.name}
              </h4>
              <div className="mt-1">
                <Rating stars={skill.rating} />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 2. Detailed Cyber Matrix Variant with Framer Motion Animation (For /skills page)
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid justify-center gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 w-full"
    >
      {skills.map((skill) => {
        const percentage = Math.round((skill.rating / 5) * 100);
        const levelLabel =
          percentage >= 85
            ? "Expert"
            : percentage >= 75
            ? "Advanced"
            : percentage >= 65
            ? "Proficient"
            : "Familiar";

        return (
          <motion.div
            key={skill.name}
            variants={cardVariants}
            className="group relative flex flex-col justify-between p-5 rounded-2xl border border-border/70 bg-card/40 backdrop-blur-md hover:border-cyan-500/50 hover:bg-cyan-500/[0.03] hover:shadow-[0_0_25px_rgba(0,240,255,0.12)] transition-colors duration-300 h-full"
          >
            <div>
              {/* Header: Icon + Name + Category / Level Badge */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-background/80 border border-border/80 text-foreground group-hover:text-cyan-400 group-hover:border-cyan-500/40 group-hover:shadow-[0_0_12px_rgba(0,240,255,0.25)] transition-all duration-300 flex-shrink-0">
                    <skill.icon size={26} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-foreground tracking-tight group-hover:text-cyan-400 transition-colors truncate">
                      {skill.name}
                    </h3>
                    {skill.category && (
                      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground/80 block">
                        {skill.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Level Badge */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium border bg-cyan-500/10 text-cyan-400 border-cyan-500/25 shadow-sm flex-shrink-0">
                  {levelLabel}
                </span>
              </div>

              {/* Description Body */}
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3 my-2.5">
                {skill.description}
              </p>
            </div>

            {/* Footer: Animated Cyber Proficiency Meter Bar */}
            <div className="pt-4 mt-2 border-t border-border/50">
              <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
                <span className="tracking-wider">PROFICIENCY</span>
                <span className="text-cyan-400 font-semibold">{percentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-background/90 rounded-full overflow-hidden border border-border/60">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.65, delay: 0.1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full group-hover:shadow-[0_0_8px_rgba(0,240,255,0.6)]"
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
