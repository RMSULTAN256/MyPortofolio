"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

import { AnimatedText } from "@/components/common/animated-text";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/common/icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import {
  Shield,
  Server,
  Cpu,
  Terminal,
  Network,
  X,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";

interface SkillNode {
  id: string;
  name: string;
  role: string;
  category: string;
  icon: any;
  color: string;
  description: string;
  highlights: string[];
}

const SKILL_NODES: SkillNode[] = [
  {
    id: "laravel",
    name: "Laravel",
    role: "Backend & Web Architecture",
    category: "Fullstack",
    icon: Server,
    color: "#F05340",
    description:
      "Enterprise fullstack web development featuring secure MVC structure, CSRF mitigation, Eloquent ORM sanitization, and robust session management.",
    highlights: ["MFA & WhatsApp OTP Integration", "Custom Middleware Access Control", "REST API Security Hardening"],
  },
  {
    id: "docker",
    name: "Docker",
    role: "Container Isolation & Sandboxing",
    category: "DevOps",
    icon: Cpu,
    color: "#2496ED",
    description:
      "Isolated container deployments for vulnerable CTF testing environments, rootless containers, and production container hardening.",
    highlights: ["Custom Bridge Network Isolation", "Alpine Minimal Security Images", "Non-Root Daemon Constraints"],
  },
  {
    id: "kali",
    name: "Kali Linux",
    role: "Offensive Security & Pen-Testing",
    category: "Security",
    icon: Terminal,
    color: "#557C94",
    description:
      "Vulnerability assessment, reconnaissance, and penetration testing methodologies tailored against OWASP Top 10 and MITRE ATT&CK vectors.",
    highlights: ["Burp Suite / Nmap / Metasploit", "Vulnerability Scanning & Exploit Analysis", "Traffic Packet Capture & Sniffing"],
  },
  {
    id: "golang",
    name: "Golang",
    role: "High-Performance Backend & Security Tools",
    category: "Backend",
    icon: Terminal,
    color: "#00ADD8",
    description:
      "Developing high-throughput concurrent backend services, custom network scanners, fast packet analyzers, and automated security monitoring systems.",
    highlights: ["Concurrent Goroutine Scanners", "Fast Socket & Packet Tooling", "Memory-Safe Backend Services"],
  },
  {
    id: "redhat",
    name: "Red Hat (RHEL)",
    role: "Enterprise Linux & Hardening (RHCSA)",
    category: "RHCSA",
    icon: Icons.redhat,
    color: "#EE0000",
    description:
      "Red Hat Certified System Administrator (RHCSA). Hardening enterprise Linux servers, enforcing SELinux policies, firewalld administration, and storage management (LVM).",
    highlights: ["RHCSA Certified System Admin (EX200)", "SELinux Enforcing Security", "LVM & Storage Administration"],
  },
  {
    id: "devsecops",
    name: "DevSecOps",
    role: "Automated Security & CI/CD Hardening",
    category: "SecOps",
    icon: Shield,
    color: "#10B981",
    description:
      "Integrating automated security into CI/CD pipelines: SAST/DAST vulnerability scanning, container image verification (Trivy), and secure deployment workflows.",
    highlights: ["Automated Security Pipelines", "Container Image Vulnerability Audits", "Secure SDLC Implementation"],
  },
  {
    id: "siem",
    name: "SIEM / SOC",
    role: "Threat Detection & Incident Response",
    category: "Monitoring",
    icon: Network,
    color: "#00F0FF",
    description:
      "Security Information and Event Management (SIEM). Centralized log analysis, anomaly detection, threat hunting, and incident response telemetry.",
    highlights: ["Log Telemetry & Aggregation", "Anomaly & Intrusion Detection", "Real-Time Security Alerting"],
  },
];

export function CyberSpotlightHero() {
  const [activeNode, setActiveNode] = useState<SkillNode | null>(null);

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] py-12 md:py-16 overflow-hidden select-none">

      {/* 3. Central Holographic Cyber Shield Vector */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none -z-10 w-[340px] sm:w-[440px] md:w-[520px] aspect-square flex items-center justify-center opacity-30 sm:opacity-40">
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-[0_0_35px_rgba(0,240,255,0.35)] animate-pulse"
          style={{ animationDuration: "5s" }}
        >
          <defs>
            <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0284c7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00f0ff" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="coreGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Outer Rotating Radar Ring */}
          <circle
            cx="200"
            cy="200"
            r="185"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="1.2"
            strokeDasharray="8 12"
            opacity="0.35"
            className="origin-center animate-spin"
            style={{ animationDuration: "40s" }}
          />
          <circle
            cx="200"
            cy="200"
            r="165"
            fill="none"
            stroke="#0284c7"
            strokeWidth="1"
            strokeDasharray="4 8"
            opacity="0.25"
            className="origin-center animate-spin"
            style={{ animationDuration: "25s", animationDirection: "reverse" }}
          />

          {/* Procedural Hexagonal Shield Outer Rim */}
          <polygon
            points="200,45 320,110 320,260 200,345 80,260 80,110"
            fill="none"
            stroke="url(#shieldGrad)"
            strokeWidth="2.5"
            filter="url(#glowEffect)"
          />

          {/* Mid Layer Hexagon Plate */}
          <polygon
            points="200,75 295,128 295,248 200,315 105,248 105,128"
            fill="rgba(2, 132, 199, 0.04)"
            stroke="#00f0ff"
            strokeWidth="1.5"
            strokeDasharray="16 8"
            opacity="0.6"
          />

          {/* Inner Layer Hexagon Plate */}
          <polygon
            points="200,105 270,145 270,235 200,285 130,235 130,145"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Circuit Traces */}
          <path
            d="M 130,145 L 90,120 M 270,145 L 310,120 M 130,235 L 90,255 M 270,235 L 310,255"
            stroke="#00f0ff"
            strokeWidth="1.8"
            strokeLinecap="round"
            opacity="0.75"
          />
          <circle cx="90" cy="120" r="3" fill="#00f0ff" />
          <circle cx="310" cy="120" r="3" fill="#00f0ff" />
          <circle cx="90" cy="255" r="3" fill="#00f0ff" />
          <circle cx="310" cy="255" r="3" fill="#00f0ff" />

          {/* Central Pulsing Holographic Core */}
          <circle cx="200" cy="195" r="36" fill="url(#coreGlow)" filter="url(#glowEffect)" opacity="0.4" />
          <circle cx="200" cy="195" r="22" fill="#00f0ff" opacity="0.8" />
          <polygon points="200,182 212,190 212,204 200,212 188,204 188,190" fill="#030712" />
          <circle cx="200" cy="197" r="4" fill="#00f0ff" />
        </svg>
      </div>

      {/* 4. Foreground Content Container */}
      <div className="container relative z-10 flex max-w-4xl flex-col items-center gap-3 text-center">
        {/* Status Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wide shadow-sm backdrop-blur-md mb-2"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <Shield className="w-3.5 h-3.5" />
          <span>RHCSA Certified • System Security & Fullstack</span>
        </motion.div>

        {/* Title Name */}
        <AnimatedText
          as="h1"
          delay={0.1}
          className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground drop-shadow-sm"
        >
          Sultan Arif
        </AnimatedText>

        {/* Role Subheading */}
        <AnimatedText
          as="h3"
          delay={0.2}
          className="font-heading text-base sm:text-xl md:text-2xl text-cyan-400 font-semibold tracking-wide drop-shadow-sm"
        >
          Cyber Security Student | Full Stack Developer | RHCSA
        </AnimatedText>

        {/* Bio Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-2 max-w-xl text-center"
        >
          <p className="leading-relaxed text-muted-foreground text-sm sm:text-base">
            Focused on secure web architectures, penetration testing, and enterprise Linux hardening. Building resilient systems with clean code and defense-in-depth principles.
          </p>
        </motion.div>

        {/* 5. Interactive Skill Badges Row */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-wrap items-center justify-center gap-2 max-w-2xl mt-4 px-2"
        >
          {SKILL_NODES.map((node) => {
            const Icon = node.icon;
            const isSelected = activeNode?.id === node.id;
            return (
              <button
                key={node.id}
                onClick={() => setActiveNode(isSelected ? null : node)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 backdrop-blur-md border",
                  isSelected
                    ? "bg-cyan-500/25 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-105"
                    : "bg-background/60 border-border/70 text-muted-foreground hover:text-foreground hover:border-cyan-500/50 hover:bg-cyan-500/10 hover:scale-102"
                )}
                aria-label={`View ${node.name} security details`}
              >
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-medium text-foreground">{node.name}</span>
                <span className="text-[10px] text-muted-foreground/80 hidden sm:inline">• {node.category}</span>
              </button>
            );
          })}
        </motion.div>

        {/* CTA Buttons */}
        <div className="flex flex-col mt-6 items-center justify-center sm:flex-row sm:space-x-4 gap-3">
          <AnimatedText delay={0.5}>
            <Link
              href={"/resume"}
              target="_blank"
              className={cn(buttonVariants({ size: "default" }), "rounded-xl px-6")}
              aria-label="View resume"
            >
              <Icons.post className="w-4 h-4 mr-2" /> Resume
            </Link>
          </AnimatedText>
          <AnimatedText delay={0.6}>
            <Link
              href={"/contact"}
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "default",
                }),
                "rounded-xl px-6 border-border/70 hover:border-cyan-500/50 hover:bg-cyan-500/10"
              )}
              aria-label={`Contact ${siteConfig.authorName}`}
            >
              <Icons.contact className="w-4 h-4 mr-2 text-cyan-400" /> Contact
            </Link>
          </AnimatedText>
        </div>

        {/* Chevron Scroll Down Indicator */}
        <AnimatedText delay={0.8}>
          <Link href="#projects" aria-label="Scroll to projects">
            <ChevronDown className="h-5 w-5 mt-6 animate-bounce text-muted-foreground/50 hover:text-cyan-400 transition-colors" />
          </Link>
        </AnimatedText>
      </div>

      {/* 6. Active Skill Node Details Modal / Popup Card */}
      <AnimatePresence>
        {activeNode && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-4 bottom-6 sm:inset-x-auto sm:right-8 sm:bottom-8 sm:w-96 z-50 pointer-events-auto"
          >
            <Card className="border border-cyan-500/40 bg-background/95 backdrop-blur-2xl shadow-2xl text-foreground text-left">
              <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex flex-col items-start gap-1 text-left">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 self-start">
                    {activeNode.category}
                  </span>
                  <CardTitle className="text-base font-bold font-heading text-white flex items-center gap-2 text-left">
                    <activeNode.icon className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{activeNode.name}</span>
                  </CardTitle>
                  <p className="text-xs text-cyan-300/80 font-mono text-left">
                    {activeNode.role}
                  </p>
                </div>
                <button
                  onClick={() => setActiveNode(null)}
                  className="text-muted-foreground hover:text-white p-1 rounded-md transition-colors"
                  aria-label="Close skill details"
                >
                  <X className="w-4 h-4" />
                </button>
              </CardHeader>
              <CardContent className="p-4 pt-1.5 space-y-2.5 text-xs">
                <p className="text-muted-foreground leading-relaxed text-xs">
                  {activeNode.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">
                    SECURITY APPLICATION:
                  </span>
                  <ul className="space-y-1 text-[11px] font-mono">
                    {activeNode.highlights.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-foreground/90">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
