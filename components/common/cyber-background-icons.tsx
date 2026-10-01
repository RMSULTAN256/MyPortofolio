"use client";

import React from "react";
import {
  ShieldCheck,
  ShieldAlert,
  Terminal,
  Cpu,
  Server,
  Database,
  Binary,
  Bug,
  Fingerprint,
  Network,
  Wifi,
  Radar,
  Crosshair,
  Lock,
  KeyRound,
  CircuitBoard,
  FileCode2,
  HardDrive,
  Activity,
} from "lucide-react";

interface CyberBackgroundNode {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  tag?: string;
  top: string; // Positioned along the full scroll page height
  left?: string;
  right?: string;
  size?: number;
  rotation?: string;
  float?: "float-normal" | "float-reverse" | "none";
  hideOnMobile?: boolean;
}

// Strategic Cyber Security & IT Telemetry Nodes evenly spread across the entire page scroll (Zero clutter)
const CYBER_NODES: CyberBackgroundNode[] = [
  // --- Section 01: Hero / Perimeter (0% - 16%) ---
  {
    icon: ShieldCheck,
    tag: "SEC::FIREWALL_ACTIVE",
    top: "3%",
    left: "2.5%",
    size: 26,
    rotation: "-rotate-6",
    float: "float-normal",
  },
  {
    icon: Terminal,
    tag: "ROOT@RHEL9:~#",
    top: "5%",
    right: "3%",
    size: 24,
    rotation: "rotate-6",
  },
  {
    icon: Binary,
    tag: "01001001",
    top: "10%",
    left: "6%",
    size: 28,
    rotation: "-rotate-12",
    hideOnMobile: true,
  },
  {
    icon: Lock,
    tag: "TLS_1.3::AES256",
    top: "13%",
    right: "6%",
    size: 24,
    rotation: "rotate-6",
    float: "float-reverse",
  },

  // --- Section 02: Experience Timeline (18% - 36%) ---
  {
    icon: Cpu,
    tag: "ARCH::64BIT",
    top: "22%",
    left: "2.5%",
    size: 26,
    float: "float-normal",
  },
  {
    icon: Fingerprint,
    tag: "AUTH::BIOMETRIC",
    top: "27%",
    right: "3%",
    size: 26,
    float: "float-reverse",
  },
  {
    icon: KeyRound,
    tag: "SSH-ED25519",
    top: "33%",
    left: "6%",
    size: 24,
    rotation: "-rotate-6",
    hideOnMobile: true,
  },

  // --- Section 03: Projects Showcase (38% - 56%) ---
  {
    icon: Server,
    tag: "SYS::SELINUX_ENFORCE",
    top: "42%",
    left: "2.5%",
    size: 26,
    float: "float-reverse",
  },
  {
    icon: CircuitBoard,
    tag: "BUS::X86_64",
    top: "47%",
    right: "3%",
    size: 28,
    rotation: "rotate-12",
    hideOnMobile: true,
  },
  {
    icon: Bug,
    tag: "CVE::AUDIT_OK",
    top: "53%",
    right: "6%",
    size: 24,
    rotation: "rotate-6",
    hideOnMobile: true,
  },

  // --- Section 04: Contributions & Recon (58% - 76%) ---
  {
    icon: Radar,
    tag: "RECON::PASSIVE",
    top: "62%",
    left: "2.5%",
    size: 26,
    float: "float-normal",
  },
  {
    icon: Network,
    tag: "TCP/IP::SYN_ACK",
    top: "67%",
    right: "3%",
    size: 26,
    float: "float-reverse",
  },
  {
    icon: FileCode2,
    tag: "SRC::STATIC_SCAN",
    top: "73%",
    left: "6%",
    size: 24,
    rotation: "rotate-6",
    hideOnMobile: true,
  },

  // --- Section 05: Tech Stack & Footer (78% - 98%) ---
  {
    icon: Crosshair,
    tag: "PORT::NMAP_STEALTH",
    top: "82%",
    left: "2.5%",
    size: 26,
    rotation: "-rotate-6",
  },
  {
    icon: ShieldAlert,
    tag: "IDS::SURICATA_SNORT",
    top: "87%",
    right: "3%",
    size: 26,
    rotation: "rotate-6",
    float: "float-normal",
  },
  {
    icon: HardDrive,
    tag: "LVM::STORAGE_RAID",
    top: "92%",
    left: "6%",
    size: 24,
    hideOnMobile: true,
  },
  {
    icon: Database,
    tag: "DB::ACID_REPLICA",
    top: "95%",
    right: "6%",
    size: 24,
    hideOnMobile: true,
  },
  {
    icon: Wifi,
    tag: "RF::MONITOR",
    top: "97%",
    left: "46%",
    size: 22,
    hideOnMobile: true,
  },
];

interface CyberBackgroundIconsProps {
  isHovering?: boolean;
}

export function CyberBackgroundIcons({
  isHovering = true,
}: CyberBackgroundIconsProps) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden select-none z-0">
      {/* ========================================================= */}
      {/* LAYER 1: Subtle Ghost Ambient Silhouette (Always faint)    */}
      {/* ========================================================= */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.04]">
        {/* Page Header Corner Reticles */}
        <div className="absolute top-6 left-4 text-[10px] font-mono text-cyan-400">
          + SEC::PERIMETER
        </div>
        <div className="absolute top-6 right-4 text-[10px] font-mono text-cyan-400">
          COORD::0x7F +
        </div>
        <div className="absolute bottom-6 left-4 text-[10px] font-mono text-cyan-400">
          + SYS::ONLINE
        </div>
        <div className="absolute bottom-6 right-4 text-[10px] font-mono text-cyan-400">
          FEED::ACTIVE +
        </div>

        {/* Ghost Icons (Scroll along the entire page) */}
        {CYBER_NODES.map((node, idx) => {
          const Icon = node.icon;
          const posStyle: React.CSSProperties = {
            top: node.top,
            ...(node.left ? { left: node.left } : {}),
            ...(node.right ? { right: node.right } : {}),
          };

          return (
            <div
              key={`ghost-${idx}`}
              style={posStyle}
              className={`absolute flex items-center gap-2 ${
                node.hideOnMobile ? "hidden md:flex" : "flex"
              } ${node.rotation || ""}`}
            >
              <div className="p-2 rounded-lg border border-cyan-400/20 text-cyan-400">
                <Icon size={node.size || 24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* LAYER 2: FLASHLIGHT REVEAL LAYER (Masked by Cursor Beam)  */}
      {/* ========================================================= */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovering ? 1 : 0,
          WebkitMaskImage: `radial-gradient(380px circle at var(--mouse-page-x, -999px) var(--mouse-page-y, -999px), black 0%, rgba(0, 0, 0, 0.9) 45%, rgba(0, 0, 0, 0.15) 75%, transparent 100%)`,
          maskImage: `radial-gradient(380px circle at var(--mouse-page-x, -999px) var(--mouse-page-y, -999px), black 0%, rgba(0, 0, 0, 0.9) 45%, rgba(0, 0, 0, 0.15) 75%, transparent 100%)`,
        }}
      >
        {/* Page Corner Reticles (Illuminated when cursor is near top/bottom) */}
        <div className="absolute top-6 left-4 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 tracking-widest uppercase bg-cyan-950/40 border border-cyan-400/40 px-2 py-0.5 rounded shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <span className="text-cyan-400 font-bold">+</span>
          <span className="hidden sm:inline">SEC::PERIMETER_LOCKED</span>
        </div>

        <div className="absolute top-6 right-4 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 tracking-widest uppercase bg-cyan-950/40 border border-cyan-400/40 px-2 py-0.5 rounded shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <span className="hidden sm:inline">COORD::0x7F_ONLINE</span>
          <span className="text-cyan-400 font-bold">+</span>
        </div>

        <div className="absolute bottom-6 left-4 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 tracking-widest uppercase bg-cyan-950/40 border border-cyan-400/40 px-2 py-0.5 rounded shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <span className="text-cyan-400 font-bold">+</span>
          <span className="hidden sm:inline">SYS::KERNEL_RHCSA</span>
        </div>

        <div className="absolute bottom-6 right-4 flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 tracking-widest uppercase bg-cyan-950/40 border border-cyan-400/40 px-2 py-0.5 rounded shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          <span className="hidden sm:inline">FEED::STREAM_ACTIVE</span>
          <span className="text-cyan-400 font-bold">+</span>
        </div>

        {/* Illuminated Cyber Nodes (Scroll naturally with the page) */}
        {CYBER_NODES.map((node, index) => {
          const Icon = node.icon;
          const posStyle: React.CSSProperties = {
            top: node.top,
            ...(node.left ? { left: node.left } : {}),
            ...(node.right ? { right: node.right } : {}),
          };

          const floatClass =
            node.float === "float-normal"
              ? "animate-cyber-float"
              : node.float === "float-reverse"
              ? "animate-cyber-float-reverse"
              : "";

          return (
            <div
              key={`lit-${index}`}
              style={posStyle}
              className={`absolute flex items-center gap-2.5 transition-all duration-300 ${floatClass} ${
                node.hideOnMobile ? "hidden md:flex" : "flex"
              } ${node.rotation || ""}`}
            >
              {/* Illuminated Neon HUD Icon Container */}
              <div className="relative flex items-center justify-center p-2.5 rounded-xl border border-cyan-400/60 bg-cyan-950/50 backdrop-blur-sm text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.45)]">
                <Icon size={node.size || 24} />

                {/* Tactical Reticle Corner Crossbars */}
                <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                <div className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-cyan-400 shadow-[0_0_8px_rgba(0,240,255,0.8)]" />

                {/* Central Target Dot */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full" />
              </div>

              {/* Glowing Monospace Telemetry Badge */}
              {node.tag && (
                <div className="hidden sm:flex items-center gap-1.5 bg-cyan-950/60 border border-cyan-400/40 px-2 py-0.5 rounded shadow-[0_0_15px_rgba(0,240,255,0.3)] backdrop-blur-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  <span className="font-mono text-[9px] sm:text-[10px] tracking-wider text-cyan-200 uppercase font-bold">
                    {node.tag}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
