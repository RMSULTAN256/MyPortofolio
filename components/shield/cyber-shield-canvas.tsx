"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Ban,
  Database,
  Eye,
  EyeOff,
  Filter,
  Globe,
  MonitorSmartphone,
  Pause,
  Play,
  Radar,
  RefreshCw,
  Server,
  ShieldAlert,
  Skull,
  Terminal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  ACTION_KEYS,
  ACTIONS,
  BLOCK_AFTER,
  DASH_KEYS,
  DASHES,
  PARSER_KEYS,
  PARSERS,
  RULE_KEYS,
  RULES,
  SERVER_KEYS,
  SERVERS,
  TECHNIQUE_BY_ID,
  benignLog,
  createSimState,
  fmtK,
  nextId,
  nowTs,
  pick,
  spawnAttacker,
  type ActionKey,
  type DashKey,
  type LogLine,
  type LogType,
  type ParserKey,
  type RuleKey,
  type ServerKey,
  type SimState,
} from "@/components/shield/siem-data";

export interface SecurityNodeData {
  id: string;
  name: string;
  category: string;
  status: string;
  threatLevel: "Secure" | "Guarded" | "High";
  latency: string;
  description: string;
  specs: string[];
  icon: LucideIcon;
}

const SIEM_NODES: SecurityNodeData[] = [
  {
    id: "sources",
    name: "Log Collector",
    category: "Data Collection",
    status: "Streaming",
    threatLevel: "Secure",
    latency: "10ms",
    description:
      "Beats agents and syslog receivers continuously collecting raw event logs from 5 monitored assets: web server, SSH bastion, Active Directory, database and perimeter firewall.",
    specs: ["Protocols: Beats, Syslog, WEF", "Assets: 5 hosts / 12 log files", "Transport: TLS 1.3 → Kafka"],
    icon: Server,
  },
  {
    id: "ingestion",
    name: "Parsing",
    category: "Data Processing",
    status: "Processing",
    threatLevel: "Secure",
    latency: "15ms",
    description: "Logstash pipeline parsing raw logs into ECS JSON, then enriching them with GeoIP/ASN and threat intelligence.",
    specs: ["Filters: Grok, Dissect, Mutate", "Enrichment: GeoIP, ThreatIntel", "Queue: Kafka"],
    icon: Filter,
  },
  {
    id: "core",
    name: "SIEM Core",
    category: "Analysis Engine",
    status: "Analyzing",
    threatLevel: "Guarded",
    latency: "45ms",
    description: "Central engine correlating normalized logs against Sigma detection rules mapped to MITRE ATT&CK.",
    specs: ["Storage: Elasticsearch", "Rules: 450+ Sigma Rules", "Detection: Real-time"],
    icon: Database,
  },
  {
    id: "dashboard",
    name: "Dashboard",
    category: "Visualization",
    status: "Live",
    threatLevel: "Secure",
    latency: "5ms",
    description: "Kibana/Grafana views for SOC analysts to triage alerts, track top attackers and hunt threats.",
    specs: ["Refresh: 5s", "Views: MITRE ATT&CK", "Role-based access"],
    icon: MonitorSmartphone,
  },
  {
    id: "response",
    name: "Response",
    category: "SOAR Action",
    status: "Armed",
    threatLevel: "High",
    latency: "120ms",
    description: "Automated playbooks blocking malicious IPs on the firewall, isolating infected endpoints and opening cases.",
    specs: ["Playbooks: Auto-Block, Auto-Isolate", "Integration: Firewall & EDR API", "MTTR: < 5 mins"],
    icon: ShieldAlert,
  },
];
const MAIN_BY_ID = Object.fromEntries(SIEM_NODES.map((n) => [n.id, n])) as Record<string, SecurityNodeData>;

// ---------------------------------------------------------------------------
// LAYOUT (world coordinates)
// ---------------------------------------------------------------------------
type V3 = [number, number, number];

const TARGET: V3 = [-1.5, -0.6, 0];
const MAIN_POS: Record<string, V3> = {
  sources: [-5.2, 0, 0],
  ingestion: [-1.8, 0, 0],
  core: [2.2, 0, 0],
  dashboard: [6.6, 2.6, -1.2],
  response: [6.6, -2.6, 1.2],
};
const MAIN_LABEL_OFFSET: Record<string, number> = { sources: 1.3, ingestion: 1.15, core: 1.7, dashboard: 1.7, response: 1.5 };
const SERVER_POS: Record<ServerKey, V3> = {
  web: [-8.4, 3.6, 0.4],
  bastion: [-8.4, 1.8, -0.4],
  dc: [-8.4, 0, 0.4],
  db: [-8.4, -1.8, -0.4],
  fw: [-8.4, -3.6, 0.4],
};
const ATTACKER_POS: V3[] = [
  [-12.4, 3.0, 0],
  [-12.4, 1.0, 0],
  [-12.4, -1.0, 0],
  [-12.4, -3.0, 0],
];
const PERIMETER_X = -10.4;
const PARSER_POS: Record<ParserKey, V3> = { grok: [-3.3, -2.4, 0.8], geoip: [-1.8, -3.4, 0.8], intel: [-0.3, -2.4, 0.8] };
const RULE_POS: Record<RuleKey, V3> = {
  bruteforce: [0.3, 2.8, -0.6],
  webattack: [1.5, 3.9, -0.6],
  recon: [2.9, 2.8, -0.6],
  c2: [4.1, 3.9, -0.6],
};
const DASH_POS: Record<DashKey, V3> = { alerts: [9.2, 3.9, -1.2], top: [9.6, 2.6, -1.2], mitre: [9.2, 1.3, -1.2] };
const ACTION_POS: Record<ActionKey, V3> = { fwblock: [9.2, -1.3, 1.2], isolate: [9.6, -2.6, 1.2], case: [9.2, -3.9, 1.2] };

// ---------------------------------------------------------------------------
// LABELS
// ---------------------------------------------------------------------------
type LabelTier = "main" | "sub" | "zone";
interface LabelDef {
  key: string;
  tier: LabelTier;
  pos: V3;
  offsetY: number;
}

const LABEL_DEFS: LabelDef[] = [
  ...SIEM_NODES.map((n) => ({ key: `main:${n.id}`, tier: "main" as const, pos: MAIN_POS[n.id], offsetY: MAIN_LABEL_OFFSET[n.id] })),
  ...SERVER_KEYS.map((k) => ({ key: `server:${k}`, tier: "sub" as const, pos: SERVER_POS[k], offsetY: 0.45 })),
  ...ATTACKER_POS.map((p, i) => ({ key: `attacker:${i}`, tier: "sub" as const, pos: p, offsetY: 0.6 })),
  ...PARSER_KEYS.map((k) => ({ key: `parser:${k}`, tier: "sub" as const, pos: PARSER_POS[k], offsetY: 0.35 })),
  ...RULE_KEYS.map((k) => ({ key: `rule:${k}`, tier: "sub" as const, pos: RULE_POS[k], offsetY: 0.35 })),
  ...DASH_KEYS.map((k) => ({ key: `dash:${k}`, tier: "sub" as const, pos: DASH_POS[k], offsetY: 0.3 })),
  ...ACTION_KEYS.map((k) => ({ key: `action:${k}`, tier: "sub" as const, pos: ACTION_POS[k], offsetY: 0.3 })),
  { key: "zone:internet", tier: "zone", pos: [-12.4, 4.7, 0], offsetY: 0 },
  { key: "zone:assets", tier: "zone", pos: [-8.4, 5.0, 0], offsetY: 0 },
];

// ---------------------------------------------------------------------------
// STYLE HELPERS
// ---------------------------------------------------------------------------
type Tone = "cyan" | "red" | "violet" | "amber" | "emerald" | "slate";

const TONE: Record<Tone, { text: string; badge: string; border: string; dot: string; title: string; meta: string }> = {
  cyan: {
    text: "text-cyan-400",
    badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    border: "border-cyan-500/40",
    dot: "bg-cyan-400",
    title: "text-cyan-100",
    meta: "text-cyan-400/70",
  },
  red: {
    text: "text-red-400",
    badge: "bg-red-500/15 text-red-400 border-red-500/30",
    border: "border-red-500/50",
    dot: "bg-red-500",
    title: "text-red-200",
    meta: "text-red-300/70",
  },
  violet: {
    text: "text-violet-400",
    badge: "bg-violet-500/15 text-violet-300 border-violet-500/30",
    border: "border-violet-500/40",
    dot: "bg-violet-400",
    title: "text-violet-100",
    meta: "text-violet-300/70",
  },
  amber: {
    text: "text-amber-400",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    border: "border-amber-500/40",
    dot: "bg-amber-400",
    title: "text-amber-100",
    meta: "text-amber-300/70",
  },
  emerald: {
    text: "text-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    border: "border-emerald-500/40",
    dot: "bg-emerald-400",
    title: "text-emerald-100",
    meta: "text-emerald-300/70",
  },
  slate: {
    text: "text-slate-400",
    badge: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    border: "border-slate-500/40",
    dot: "bg-slate-400",
    title: "text-slate-200",
    meta: "text-slate-400",
  },
};

const LOG_TAG: Record<LogType, string> = {
  RAW: "text-slate-300 bg-slate-500/20",
  ENRICH: "text-sky-300 bg-sky-500/15",
  ALERT: "text-amber-300 bg-amber-500/15",
  SOAR: "text-emerald-300 bg-emerald-500/15",
  INFO: "text-violet-300 bg-violet-500/15",
};

const logTone = (l: LogLine): Tone =>
  l.type === "ALERT" ? "amber" : l.type === "SOAR" ? "emerald" : l.type === "ENRICH" ? "cyan" : l.type === "INFO" ? "violet" : l.malicious ? "red" : "slate";

const totalEps = (s: SimState) => SERVER_KEYS.reduce((sum, k) => sum + s.serverEps[k], 0);

// ---------------------------------------------------------------------------
// DETAIL PANEL CONTENT
// ---------------------------------------------------------------------------
interface DetailRow {
  k: string;
  v: string;
  tone?: Tone;
}
interface DetailSection {
  title: string;
  items: { text: string; tone?: Tone }[];
  mono?: boolean;
  empty?: string;
}
interface Detail {
  badge: string;
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  tone: Tone;
  description?: string;
  rows: DetailRow[];
  sections: DetailSection[];
  code?: { title: string; body: string };
}

const logItems = (lines: LogLine[]) => lines.map((l) => ({ text: `${l.ts}  ${l.type.padEnd(6)} ${l.text}`, tone: logTone(l) }));

function buildDetail(key: string, s: SimState): Detail | null {
  const [kind, id] = key.split(":");

  if (kind === "main") {
    const n = MAIN_BY_ID[id];
    if (!n) return null;
    const live: Record<string, DetailRow[]> = {
      sources: [
        { k: "Ingest rate", v: `${fmtK(totalEps(s))} EPS`, tone: "cyan" },
        { k: "Monitored assets", v: `${SERVER_KEYS.length} hosts` },
      ],
      ingestion: [
        { k: "Parsed (sampled)", v: String(s.parsed) },
        { k: "IOC matches", v: String(s.iocHits), tone: "red" },
      ],
      core: [
        { k: "Alerts raised", v: String(s.alerts), tone: "amber" },
        { k: "Correlation rules", v: `${RULE_KEYS.length} active` },
      ],
      dashboard: [
        { k: "Events displayed", v: String(s.dashboardEvents) },
        { k: "Alerts in queue", v: String(s.alertsFeed.length), tone: "amber" },
      ],
      response: [
        { k: "IPs blocked", v: String(s.blocked), tone: "red" },
        { k: "Hosts isolated", v: String(s.isolated), tone: "amber" },
        { k: "Cases", v: String(s.cases) },
      ],
    };
    const children: Record<string, string[]> = {
      sources: SERVER_KEYS.map((k) => `${SERVERS[k].hostname} (${SERVERS[k].ip}) — ${SERVERS[k].product}`),
      ingestion: PARSER_KEYS.map((k) => `${PARSERS[k].name} — ${PARSERS[k].tech}`),
      core: RULE_KEYS.map((k) => `${RULES[k].name} — ${RULES[k].mitre}`),
      dashboard: DASH_KEYS.map((k) => DASHES[k].name),
      response: ACTION_KEYS.map((k) => `${ACTIONS[k].name} — ${ACTIONS[k].tech}`),
    };
    const isResp = id === "response";
    return {
      badge: n.category,
      title: n.name,
      icon: n.icon,
      tone: isResp ? "amber" : "cyan",
      description: n.description,
      rows: [
        { k: "Status", v: n.status, tone: isResp ? "amber" : "emerald" },
        { k: "Latency", v: n.latency, tone: "cyan" },
        ...(live[id] ?? []),
      ],
      sections: [
        { title: "Specifications", items: n.specs.map((text) => ({ text })) },
        { title: "Sub-components (click the small nodes)", items: (children[id] ?? []).map((text) => ({ text, tone: "cyan" as Tone })) },
      ],
    };
  }

  if (kind === "server") {
    const srv = SERVERS[id as ServerKey];
    if (!srv) return null;
    const attackers = s.attackers.filter((a) => a.status === "active" && TECHNIQUE_BY_ID[a.techniqueId].target === srv.id);
    return {
      badge: "Log Source",
      title: srv.hostname,
      subtitle: `${srv.ip} · ${srv.os}`,
      icon: Server,
      tone: attackers.length ? "red" : "cyan",
      description: srv.role,
      rows: [
        { k: "IP address", v: srv.ip },
        { k: "Shipper", v: srv.agent },
        { k: "Ingest rate", v: `${fmtK(s.serverEps[srv.id])} EPS`, tone: "cyan" },
        { k: "Events (sampled)", v: String(s.serverEvents[srv.id]) },
        { k: "Under attack", v: attackers.length ? `YES (${attackers.length} source${attackers.length > 1 ? "s" : ""})` : "No", tone: attackers.length ? "red" : "emerald" },
      ],
      sections: [
        { title: "Logs being scanned", items: srv.logs.map((text) => ({ text, tone: "cyan" as Tone })), mono: true },
        {
          title: "Attackers targeting this host",
          items: attackers.map((a) => ({ text: `${a.ip} (${a.cc}) — ${TECHNIQUE_BY_ID[a.techniqueId].name}`, tone: "red" as Tone })),
          empty: "No active attackers",
        },
        { title: "Recent events", items: logItems(s.logs.filter((l) => l.host === srv.hostname).slice(-5)), mono: true, empty: "Waiting for events…" },
      ],
    };
  }

  if (kind === "attacker") {
    const a = s.attackers[Number(id)];
    if (!a) return null;
    const tech = TECHNIQUE_BY_ID[a.techniqueId];
    const target = SERVERS[tech.target];
    const blocked = a.status === "blocked";
    return {
      badge: "Threat Actor",
      title: a.ip,
      subtitle: `${a.country} (${a.cc}) · ${a.asn}`,
      icon: Skull,
      tone: blocked ? "slate" : "red",
      description: tech.activity,
      rows: [
        { k: "Status", v: blocked ? "BLOCKED" : "ACTIVE", tone: blocked ? "emerald" : "red" },
        { k: "Technique", v: tech.name, tone: "red" },
        { k: "MITRE ATT&CK", v: `${tech.mitre} · ${tech.tactic}` },
        { k: "Target", v: `${target.hostname} (${target.ip})` },
        { k: "Abuse score", v: `${a.reputation}%`, tone: a.reputation >= 50 ? "red" : "amber" },
        { k: "First seen", v: a.firstSeen },
        { k: "Events / Alerts", v: `${a.events} / ${a.alerts}` },
        { k: "Detected by", v: RULES[tech.rule].name, tone: "violet" },
      ],
      sections: [
        {
          title: "Activity timeline (this IP)",
          items: logItems(s.logs.filter((l) => l.ip === a.ip).slice(-7)),
          mono: true,
          empty: "Attack traffic in flight…",
        },
      ],
      code: { title: "Sample raw log", body: tech.log(a.ip) },
    };
  }

  if (kind === "parser") {
    const p = PARSERS[id as ParserKey];
    if (!p) return null;
    const rows: DetailRow[] = [{ k: "Engine", v: p.tech }];
    let sections: DetailSection[] = [{ title: "Configuration", items: p.specs.map((text) => ({ text })) }];
    let code: Detail["code"];
    if (id === "grok") {
      rows.push({ k: "Events normalized", v: String(s.parsed), tone: "cyan" });
      code = s.lastNormalized ? { title: "Last normalized event (ECS)", body: JSON.stringify(s.lastNormalized, null, 2) } : undefined;
    } else if (id === "geoip") {
      rows.push({ k: "IPs enriched", v: String(s.enriched), tone: "cyan" });
      sections = [
        ...sections,
        { title: "Recent enrichments", items: logItems(s.logs.filter((l) => l.type === "ENRICH").slice(-5)), mono: true, empty: "No public IPs yet" },
      ];
    } else {
      rows.push({ k: "IOC matches", v: String(s.iocHits), tone: "red" });
      sections = [
        ...sections,
        {
          title: "Known-bad indicators",
          items: s.attackers.filter((a) => a.reputation >= 50).map((a) => ({ text: `${a.ip}  abuse=${a.reputation}%  ${a.asn}`, tone: "red" as Tone })),
          mono: true,
          empty: "No IOC matches",
        },
      ];
    }
    return { badge: "Pipeline Stage", title: p.name, icon: Filter, tone: "cyan", description: p.description, rows, sections, code };
  }

  if (kind === "rule") {
    const r = RULES[id as RuleKey];
    if (!r) return null;
    const last = s.alertsFeed.filter((al) => al.rule === id).slice(0, 5);
    return {
      badge: "Correlation Rule",
      title: r.name,
      subtitle: `${r.mitre} · ${r.tactic}`,
      icon: Radar,
      tone: "violet",
      description: r.description,
      rows: [
        { k: "Severity", v: r.severity, tone: r.severity === "Critical" ? "red" : r.severity === "High" ? "amber" : "cyan" },
        { k: "Hits", v: String(s.ruleHits[id as RuleKey]), tone: "violet" },
      ],
      sections: [
        {
          title: "Recent matches",
          items: last.map((al) => ({ text: `${al.ts}  ${al.ip} → ${al.host}  (${TECHNIQUE_BY_ID[al.techniqueId].name})`, tone: "amber" as Tone })),
          mono: true,
          empty: "No matches yet",
        },
      ],
      code: { title: "Detection logic (Sigma-style)", body: r.logic },
    };
  }

  if (kind === "dash") {
    const d = DASHES[id as DashKey];
    if (!d) return null;
    let section: DetailSection;
    if (id === "alerts") {
      section = {
        title: "Alert queue",
        items: s.alertsFeed.slice(0, 7).map((al) => ({
          text: `${al.ts}  [${RULES[al.rule].short}] ${al.ip} → ${al.host}`,
          tone: "amber" as Tone,
        })),
        mono: true,
        empty: "Queue empty",
      };
    } else if (id === "top") {
      section = {
        title: "Ranked by malicious events",
        items: Object.values(s.ipStats)
          .sort((x, y) => y.events - x.events)
          .slice(0, 7)
          .map((x, i) => ({ text: `#${i + 1}  ${x.ip.padEnd(16)} ${x.cc}  ${String(x.events).padStart(3)} evts  ${TECHNIQUE_BY_ID[x.techniqueId].name}`, tone: "red" as Tone })),
        mono: true,
        empty: "No attackers observed yet",
      };
    } else {
      section = {
        title: "Technique counts",
        items: Object.entries(s.techniqueCounts)
          .sort((x, y) => y[1] - x[1])
          .map(([tid, c]) => ({ text: `${TECHNIQUE_BY_ID[tid].mitre.padEnd(10)} ${TECHNIQUE_BY_ID[tid].name.padEnd(18)} ${"█".repeat(Math.min(c, 12))} ${c}`, tone: "violet" as Tone })),
        mono: true,
        empty: "No techniques detected yet",
      };
    }
    return { badge: "Dashboard Panel", title: d.name, icon: MonitorSmartphone, tone: "cyan", description: d.description, rows: [], sections: [section] };
  }

  if (kind === "action") {
    const act = ACTIONS[id as ActionKey];
    if (!act) return null;
    const count = id === "fwblock" ? s.blocked : id === "isolate" ? s.isolated : s.cases;
    return {
      badge: "SOAR Playbook",
      title: act.name,
      subtitle: act.tech,
      icon: id === "fwblock" ? Ban : ShieldAlert,
      tone: id === "case" ? "emerald" : "amber",
      description: act.description,
      rows: [
        { k: "Executions", v: String(count), tone: "amber" },
        ...(id === "fwblock" ? [{ k: "Trigger", v: `≥ ${BLOCK_AFTER} alerts from same IP` }] : []),
      ],
      sections: [
        {
          title: "Recent executions",
          items: s.actionsFeed
            .filter((x) => id === "case" || x.action === id)
            .slice(0, 6)
            .map((x) => ({ text: `${x.ts}  ${x.text}`, tone: "emerald" as Tone })),
          mono: true,
          empty: "Nothing executed yet",
        },
      ],
    };
  }

  return null;
}

// ---------------------------------------------------------------------------
// LABEL CONTENT
// ---------------------------------------------------------------------------
function SubLabel({ title, meta, tone, extra }: { title: ReactNode; meta: ReactNode; tone: Tone; extra?: ReactNode }) {
  const t = TONE[tone];
  return (
    <div className={cn("px-1.5 py-0.5 rounded border bg-background/80 backdrop-blur-sm font-mono leading-tight shadow-sm", t.border)}>
      <div className={cn("text-[9px] font-bold whitespace-nowrap flex items-center gap-1", t.title)}>
        <span className={cn("w-1 h-1 rounded-full shrink-0", t.dot)} />
        {title}
      </div>
      <div className={cn("text-[8.5px] whitespace-nowrap", t.meta)}>{meta}</div>
      {extra}
    </div>
  );
}

function LabelContent({ def, s }: { def: LabelDef; s: SimState }) {
  const [kind, id] = def.key.split(":");

  if (kind === "main") {
    const n = MAIN_BY_ID[id];
    const metric: Record<string, string> = {
      sources: `${fmtK(totalEps(s))} EPS`,
      ingestion: `${s.parsed} parsed`,
      core: `${s.alerts} alerts`,
      dashboard: `${s.alertsFeed.length} in queue`,
      response: `${s.blocked} blocked`,
    };
    return (
      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-background/85 border border-cyan-500/50 backdrop-blur-md rounded-md shadow-[0_0_12px_rgba(0,240,255,0.2)]">
        <n.icon className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[11px] font-bold text-cyan-50 whitespace-nowrap">{n.name}</span>
        <span className="text-[9px] font-mono text-cyan-400/80 whitespace-nowrap border-l border-cyan-500/30 pl-1.5">{metric[id]}</span>
      </div>
    );
  }

  if (kind === "zone") {
    const isInternet = id === "internet";
    return (
      <div
        className={cn(
          "flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap",
          isInternet ? "text-red-400/80" : "text-cyan-400/80"
        )}
      >
        {isInternet ? <Globe className="w-3 h-3" /> : <Server className="w-3 h-3" />}
        {isInternet ? "Internet · Untrusted" : "Internal · Log Sources"}
      </div>
    );
  }

  if (kind === "server") {
    const srv = SERVERS[id as ServerKey];
    const attacked = s.attackers.some((a) => a.status === "active" && TECHNIQUE_BY_ID[a.techniqueId].target === srv.id);
    return (
      <SubLabel
        tone={attacked ? "red" : "cyan"}
        title={
          <>
            {srv.hostname} <span className="font-normal opacity-60">{srv.ip}</span>
          </>
        }
        meta={`${srv.product} · ${fmtK(s.serverEps[srv.id])} EPS`}
      />
    );
  }

  if (kind === "attacker") {
    const a = s.attackers[Number(id)];
    if (!a) return <SubLabel tone="slate" title="scanning…" meta="no actor" />;
    const tech = TECHNIQUE_BY_ID[a.techniqueId];
    const blocked = a.status === "blocked";
    return (
      <SubLabel
        tone={blocked ? "slate" : "red"}
        title={
          <>
            {a.ip} <span className="font-normal opacity-70">{a.cc}</span>
            <span className={cn("ml-1 px-1 rounded text-[7.5px]", blocked ? "bg-emerald-500/20 text-emerald-300" : "bg-red-500/25 text-red-200 animate-pulse")}>
              {blocked ? "BLOCKED" : "ACTIVE"}
            </span>
          </>
        }
        meta={`${tech.name} → ${SERVERS[tech.target].hostname}`}
        extra={<div className="text-[8px] whitespace-nowrap text-red-300/50">{`${tech.mitre} · ${a.events} evts · ${a.alerts} alerts`}</div>}
      />
    );
  }

  if (kind === "parser") {
    const p = PARSERS[id as ParserKey];
    const count = id === "grok" ? `${s.parsed} parsed` : id === "geoip" ? `${s.enriched} enriched` : `${s.iocHits} IOC hits`;
    return <SubLabel tone="cyan" title={p.short} meta={`${p.tech} · ${count}`} />;
  }

  if (kind === "rule") {
    const r = RULES[id as RuleKey];
    return <SubLabel tone="violet" title={r.short} meta={`${r.mitre} · ${s.ruleHits[id as RuleKey]} hits`} />;
  }

  if (kind === "dash") {
    const top = Object.values(s.ipStats).sort((x, y) => y.events - x.events)[0];
    const meta =
      id === "alerts"
        ? s.alertsFeed[0]
          ? `latest: ${s.alertsFeed[0].ip}`
          : "queue empty"
        : id === "top"
          ? top
            ? `#1 ${top.ip} (${top.events})`
            : "—"
          : `${Object.keys(s.techniqueCounts).length} techniques seen`;
    return <SubLabel tone="cyan" title={DASHES[id as DashKey].short} meta={meta} />;
  }

  if (kind === "action") {
    const act = ACTIONS[id as ActionKey];
    const meta = id === "fwblock" ? `${s.blocked} IPs dropped` : id === "isolate" ? `${s.isolated} hosts isolated` : `${s.cases} cases · Slack`;
    return <SubLabel tone={id === "case" ? "emerald" : "amber"} title={act.short} meta={meta} />;
  }

  return null;
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------
interface Incident {
  id: number;
  ip: string;
  cc: string;
  type: string;
  host: string;
  action: string;
}

interface CyberShieldCanvasProps {
  mode?: "embedded" | "fullscreen";
  className?: string;
}

export function CyberShieldCanvas({ mode = "fullscreen", className }: CyberShieldCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const labelEls = useRef<Record<string, HTMLDivElement | null>>({});
  const controlsRef = useRef<OrbitControls | null>(null);
  const fitCameraRef = useRef<(() => void) | null>(null);
  const pausedRef = useRef(false);

  const [snap, setSnap] = useState<SimState>(createSimState);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(true);
  const [showLogs, setShowLogs] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    // Sub-node labels get crowded on small screens — start collapsed there.
    if (window.innerWidth < 768) setShowDetails(false);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let canvasWidth = container.clientWidth || 800;
    let canvasHeight = container.clientHeight || 600;
    const v = (p: V3) => new THREE.Vector3(p[0], p[1], p[2]);

    // --- 0. SIMULATION STATE (mutable, flushed to React periodically) ---
    const sim = createSimState();
    for (let i = 0; i < ATTACKER_POS.length; i++) sim.attackers.push(spawnAttacker(i, sim.attackers));

    const pushLog = (l: Omit<LogLine, "id" | "ts">) => {
      sim.logs.push({ ...l, id: nextId(), ts: nowTs() });
      if (sim.logs.length > 80) sim.logs.shift();
    };
    const pushAction = (action: ActionKey, text: string) => {
      sim.actionsFeed.unshift({ id: nextId(), ts: nowTs(), action, text });
      if (sim.actionsFeed.length > 20) sim.actionsFeed.pop();
    };

    // --- 1. SETUP SCENE ---
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x030712, 0.018);

    const camera = new THREE.PerspectiveCamera(45, canvasWidth / canvasHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    renderer.setSize(canvasWidth, canvasHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 45;
    controls.maxPolarAngle = Math.PI / 2 + 0.1;
    controlsRef.current = controls;

    // Fit the whole architecture (attackers → SOAR) into view for the current aspect ratio.
    const target = v(TARGET);
    const fitCamera = () => {
      const halfFov = THREE.MathUtils.degToRad(camera.fov / 2);
      const dist = THREE.MathUtils.clamp(12.8 / (Math.tan(halfFov) * camera.aspect), 16, 34);
      camera.position.set(target.x, target.y + dist * 0.24, target.z + dist);
      controls.target.copy(target);
      controls.update();
    };
    fitCamera();
    fitCameraRef.current = fitCamera;

    // --- 2. LIGHTING ---
    scene.add(new THREE.AmbientLight(0xffffff, 2.5));
    const dirLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // --- 3. MATERIALS ---
    const matCyanGlow = new THREE.MeshStandardMaterial({
      color: 0x00f0ff, emissive: 0x0088ff, emissiveIntensity: 0.8, transparent: true, opacity: 0.9, depthWrite: false,
    });
    const matCoreGlow = new THREE.MeshStandardMaterial({
      color: 0x0369a1, emissive: 0x0284c7, emissiveIntensity: 0.6, transparent: true, opacity: 0.95,
    });
    const matDarkMetal = new THREE.MeshStandardMaterial({
      color: 0x0f172a, emissive: 0x1e293b, emissiveIntensity: 0.3, metalness: 0.7, roughness: 0.3,
    });
    const matShield = new THREE.MeshStandardMaterial({
      color: 0xf59e0b, emissive: 0xd97706, emissiveIntensity: 0.8, transparent: true, opacity: 0.95,
    });
    const edgeCyan = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.6 });

    // --- 4. ENVIRONMENT: floor grid + perimeter firewall wall ---
    const grid = new THREE.GridHelper(44, 44, 0x0ea5e9, 0x0c4a6e);
    grid.position.set(-1.5, -5.4, 0);
    const gridMat = grid.material as THREE.LineBasicMaterial;
    gridMat.transparent = true;
    gridMat.opacity = 0.18;
    scene.add(grid);

    const perimeter = new THREE.Group();
    perimeter.position.set(PERIMETER_X, -0.2, 0);
    const wallGeo = new THREE.PlaneGeometry(4.5, 10);
    const wall = new THREE.Mesh(
      wallGeo,
      new THREE.MeshBasicMaterial({ color: 0xff2255, transparent: true, opacity: 0.05, side: THREE.DoubleSide, depthWrite: false })
    );
    wall.rotation.y = Math.PI / 2;
    perimeter.add(wall);
    const wallFrame = new THREE.LineSegments(
      new THREE.EdgesGeometry(wallGeo),
      new THREE.LineBasicMaterial({ color: 0xff2255, transparent: true, opacity: 0.35 })
    );
    wallFrame.rotation.y = Math.PI / 2;
    perimeter.add(wallFrame);
    const wallLines: THREE.Vector3[] = [];
    for (let y = -4.5; y <= 4.5; y += 0.75) wallLines.push(new THREE.Vector3(0, y, -2.25), new THREE.Vector3(0, y, 2.25));
    perimeter.add(
      new THREE.LineSegments(
        new THREE.BufferGeometry().setFromPoints(wallLines),
        new THREE.LineBasicMaterial({ color: 0xff2255, transparent: true, opacity: 0.12 })
      )
    );
    const scanBar = new THREE.Mesh(
      new THREE.PlaneGeometry(4.5, 0.08),
      new THREE.MeshBasicMaterial({ color: 0xff4477, transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false })
    );
    scanBar.rotation.y = Math.PI / 2;
    perimeter.add(scanBar);
    scene.add(perimeter);

    // --- 5. NODES ---
    const nodesGroup = new THREE.Group();
    scene.add(nodesGroup);

    const hitboxes: THREE.Mesh[] = [];
    const hoverTargets = new Map<string, THREE.Object3D>();
    const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const addHitbox = (key: string, pos: V3, radius: number) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 12, 12), hitMat);
      mesh.position.copy(v(pos));
      mesh.userData = { key };
      hitboxes.push(mesh);
      nodesGroup.add(mesh);
    };

    // 5a. Main: Log Collector (server racks)
    const sourcesGroup = new THREE.Group();
    sourcesGroup.position.copy(v(MAIN_POS.sources));
    const srvGeo = new THREE.BoxGeometry(0.5, 1.4, 0.6);
    const srvEdgeGeo = new THREE.EdgesGeometry(srvGeo);
    const slotGeo = new THREE.BoxGeometry(0.52, 0.02, 0.62);
    const slotMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    [-0.4, 0.4].forEach((x, i) => {
      const srv = new THREE.Mesh(srvGeo, matDarkMetal);
      srv.add(new THREE.LineSegments(srvEdgeGeo, edgeCyan));
      for (let y = -0.5; y <= 0.5; y += 0.2) {
        const slot = new THREE.Mesh(slotGeo, slotMat);
        slot.position.y = y;
        srv.add(slot);
      }
      srv.position.set(x, 0, i === 0 ? 0.15 : -0.15);
      sourcesGroup.add(srv);
    });
    nodesGroup.add(sourcesGroup);
    hoverTargets.set("main:sources", sourcesGroup);
    addHitbox("main:sources", MAIN_POS.sources, 1.3);

    // 5b. Main: Parsing (funnel)
    const funnelGroup = new THREE.Group();
    funnelGroup.position.copy(v(MAIN_POS.ingestion));
    const funnelMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.2, 1.2, 16, 1, false), matCyanGlow);
    funnelMesh.rotation.z = -Math.PI / 2;
    funnelGroup.add(funnelMesh);
    const bladeMesh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.4, 0.1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    bladeMesh.position.x = -0.5;
    funnelGroup.add(bladeMesh);
    nodesGroup.add(funnelGroup);
    hoverTargets.set("main:ingestion", funnelGroup);
    addHitbox("main:ingestion", MAIN_POS.ingestion, 1.2);

    // 5c. Main: SIEM Core (database disc stack)
    const dbGroup = new THREE.Group();
    dbGroup.position.copy(v(MAIN_POS.core));
    const discGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32);
    const gapGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.2, 32);
    const gapMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    [-0.7, 0, 0.7].forEach((y, i) => {
      const disc = new THREE.Mesh(discGeo, matCoreGlow);
      disc.position.y = y;
      dbGroup.add(disc);
      if (i < 2) {
        const gapLight = new THREE.Mesh(gapGeo, gapMat);
        gapLight.position.y = y + 0.35;
        dbGroup.add(gapLight);
      }
    });
    nodesGroup.add(dbGroup);
    hoverTargets.set("main:core", dbGroup);
    addHitbox("main:core", MAIN_POS.core, 1.7);

    // 5d. Main: Dashboard (monitor)
    const monitorGroup = new THREE.Group();
    monitorGroup.position.copy(v(MAIN_POS.dashboard));
    const screenMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.2, 0.1), matDarkMetal);
    screenMesh.position.y = 0.6;
    const screenFace = new THREE.Mesh(
      new THREE.PlaneGeometry(1.9, 1.1),
      new THREE.MeshBasicMaterial({ color: 0x004488, transparent: true, opacity: 0.8 })
    );
    screenFace.position.set(0, 0, 0.06);
    screenMesh.add(screenFace);
    const screenGrid = new THREE.GridHelper(1.8, 8, 0x00f0ff, 0x00f0ff);
    screenGrid.rotation.x = Math.PI / 2;
    screenFace.add(screenGrid);
    const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.6), matDarkMetal);
    stand.position.y = 0.3;
    const monitorBase = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.05, 0.6), matDarkMetal);
    monitorGroup.add(screenMesh, stand, monitorBase);
    monitorGroup.lookAt(camera.position);
    nodesGroup.add(monitorGroup);
    hoverTargets.set("main:dashboard", monitorGroup);
    addHitbox("main:dashboard", MAIN_POS.dashboard, 1.4);

    // 5e. Main: Response (shield)
    const respGroup = new THREE.Group();
    respGroup.position.copy(v(MAIN_POS.response));
    const shieldShape = new THREE.Shape();
    shieldShape.moveTo(0, 1.0);
    shieldShape.quadraticCurveTo(0.8, 1.0, 1.0, 0.5);
    shieldShape.lineTo(1.0, -0.2);
    shieldShape.lineTo(0, -1.2);
    shieldShape.lineTo(-1.0, -0.2);
    shieldShape.lineTo(-1.0, 0.5);
    shieldShape.quadraticCurveTo(-0.8, 1.0, 0, 1.0);
    const shieldExtrude = new THREE.ExtrudeGeometry(shieldShape, {
      depth: 0.2, bevelEnabled: true, bevelSegments: 2, steps: 1, bevelSize: 0.05, bevelThickness: 0.05,
    });
    shieldExtrude.computeBoundingBox();
    shieldExtrude.translate(0, 0, -0.5 * (shieldExtrude.boundingBox!.max.z - shieldExtrude.boundingBox!.min.z));
    respGroup.add(new THREE.Mesh(shieldExtrude, matShield));
    nodesGroup.add(respGroup);
    hoverTargets.set("main:response", respGroup);
    addHitbox("main:response", MAIN_POS.response, 1.4);

    // 5f. Sub: monitored servers (log sources)
    const miniSrvGeo = new THREE.BoxGeometry(0.42, 0.62, 0.46);
    const miniSrvEdges = new THREE.EdgesGeometry(miniSrvGeo);
    const ledGeo = new THREE.BoxGeometry(0.44, 0.025, 0.48);
    const serverLedMats = {} as Record<ServerKey, THREE.MeshBasicMaterial>;
    const serverFlash: Record<ServerKey, number> = { web: 0, bastion: 0, dc: 0, db: 0, fw: 0 };
    SERVER_KEYS.forEach((k) => {
      const g = new THREE.Group();
      g.position.copy(v(SERVER_POS[k]));
      const body = new THREE.Mesh(miniSrvGeo, matDarkMetal);
      body.add(new THREE.LineSegments(miniSrvEdges, edgeCyan));
      const ledMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
      serverLedMats[k] = ledMat;
      [-0.18, 0, 0.18].forEach((y) => {
        const led = new THREE.Mesh(ledGeo, ledMat);
        led.position.y = y;
        body.add(led);
      });
      g.add(body);
      nodesGroup.add(g);
      hoverTargets.set(`server:${k}`, g);
      addHitbox(`server:${k}`, SERVER_POS[k], 0.55);
    });

    // 5g. Sub: attackers (internet threat actors)
    const attackerCoreGeo = new THREE.OctahedronGeometry(0.3);
    const attackerHaloGeo = new THREE.IcosahedronGeometry(0.52, 0);
    const attackerVisuals = ATTACKER_POS.map((p, i) => {
      const group = new THREE.Group();
      group.position.copy(v(p));
      const coreMat = new THREE.MeshBasicMaterial({ color: 0xff0044 });
      const haloMat = new THREE.MeshBasicMaterial({ color: 0xff3366, wireframe: true, transparent: true, opacity: 0.45 });
      const core = new THREE.Mesh(attackerCoreGeo, coreMat);
      const halo = new THREE.Mesh(attackerHaloGeo, haloMat);
      group.add(core, halo);
      nodesGroup.add(group);
      hoverTargets.set(`attacker:${i}`, group);
      addHitbox(`attacker:${i}`, p, 0.65);
      const lineMat = new THREE.LineBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.55 });
      const lineGeo = new THREE.BufferGeometry();
      scene.add(new THREE.Line(lineGeo, lineMat));
      return { group, core, halo, coreMat, haloMat, lineMat, lineGeo, seg: null as Seg | null };
    });

    // 5h. Sub: parser stages
    const hexGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.14, 6);
    const hexEdges = new THREE.EdgesGeometry(hexGeo);
    const parserMeshes: THREE.Object3D[] = [];
    PARSER_KEYS.forEach((k) => {
      const m = new THREE.Mesh(hexGeo, matCyanGlow);
      m.add(new THREE.LineSegments(hexEdges, edgeCyan));
      m.position.copy(v(PARSER_POS[k]));
      m.rotation.x = Math.PI / 2;
      nodesGroup.add(m);
      parserMeshes.push(m);
      hoverTargets.set(`parser:${k}`, m);
      addHitbox(`parser:${k}`, PARSER_POS[k], 0.45);
    });

    // 5i. Sub: correlation rules
    const ruleGeo = new THREE.OctahedronGeometry(0.22);
    const ruleMats = {} as Record<RuleKey, THREE.MeshStandardMaterial>;
    const ruleFlash: Record<RuleKey, number> = { bruteforce: 0, webattack: 0, recon: 0, c2: 0 };
    const ruleMeshes: THREE.Mesh[] = [];
    RULE_KEYS.forEach((k) => {
      const mat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7c3aed, emissiveIntensity: 0.8 });
      ruleMats[k] = mat;
      const m = new THREE.Mesh(ruleGeo, mat);
      m.position.copy(v(RULE_POS[k]));
      nodesGroup.add(m);
      ruleMeshes.push(m);
      hoverTargets.set(`rule:${k}`, m);
      addHitbox(`rule:${k}`, RULE_POS[k], 0.45);
    });

    // 5j. Sub: dashboard panels
    const panelGeo = new THREE.BoxGeometry(0.62, 0.4, 0.05);
    const panelFaceGeo = new THREE.PlaneGeometry(0.56, 0.34);
    const panelFaceMat = new THREE.MeshBasicMaterial({ color: 0x0e7490, transparent: true, opacity: 0.9 });
    const panelEdges = new THREE.EdgesGeometry(panelGeo);
    DASH_KEYS.forEach((k) => {
      const m = new THREE.Mesh(panelGeo, matDarkMetal);
      m.add(new THREE.LineSegments(panelEdges, edgeCyan));
      const face = new THREE.Mesh(panelFaceGeo, panelFaceMat);
      face.position.z = 0.03;
      m.add(face);
      m.position.copy(v(DASH_POS[k]));
      m.lookAt(camera.position);
      nodesGroup.add(m);
      hoverTargets.set(`dash:${k}`, m);
      addHitbox(`dash:${k}`, DASH_POS[k], 0.45);
    });

    // 5k. Sub: SOAR actions
    const actionGeo = new THREE.SphereGeometry(0.2, 16, 16);
    const actionColors: Record<ActionKey, number> = { fwblock: 0xf59e0b, isolate: 0xf97316, case: 0x10b981 };
    const actionMeshes = {} as Record<ActionKey, THREE.Mesh>;
    const actionFlash: Record<ActionKey, number> = { fwblock: 0, isolate: 0, case: 0 };
    ACTION_KEYS.forEach((k) => {
      const m = new THREE.Mesh(actionGeo, new THREE.MeshBasicMaterial({ color: actionColors[k] }));
      m.position.copy(v(ACTION_POS[k]));
      nodesGroup.add(m);
      actionMeshes[k] = m;
      hoverTargets.set(`action:${k}`, m);
      addHitbox(`action:${k}`, ACTION_POS[k], 0.45);
    });

    // Sub-node connector lines
    const connectorMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.3 });
    const connectorPts: THREE.Vector3[] = [];
    PARSER_KEYS.forEach((k) => connectorPts.push(v(PARSER_POS[k]), v(MAIN_POS.ingestion)));
    RULE_KEYS.forEach((k) => connectorPts.push(v(RULE_POS[k]), v(MAIN_POS.core)));
    DASH_KEYS.forEach((k) => connectorPts.push(v(DASH_POS[k]), v(MAIN_POS.dashboard)));
    ACTION_KEYS.forEach((k) => connectorPts.push(v(ACTION_POS[k]), v(MAIN_POS.response)));
    scene.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(connectorPts), connectorMat));

    // --- 6. PATHS & DATA FLOW ---
    type SegName = "attack" | "collect" | "parse" | "core" | "dash" | "resp";
    interface Seg {
      curve: THREE.CatmullRomCurve3;
      len: number;
      name: SegName;
    }
    const mkSeg = (pts: THREE.Vector3[], name: SegName): Seg => {
      const curve = new THREE.CatmullRomCurve3(pts);
      return { curve, len: curve.getLength(), name };
    };

    const hub = v(MAIN_POS.sources);
    const collectSegs = {} as Record<ServerKey, Seg>;
    const collectLineMat = new THREE.LineBasicMaterial({ color: 0x00f0ff, transparent: true, opacity: 0.45 });
    SERVER_KEYS.forEach((k) => {
      const s = v(SERVER_POS[k]);
      const seg = mkSeg([s, new THREE.Vector3((s.x + hub.x) / 2, s.y * 0.45, s.z * 0.5), hub], "collect");
      collectSegs[k] = seg;
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(seg.curve.getPoints(32)), collectLineMat));
    });

    const segHubParse = mkSeg([hub, new THREE.Vector3(-3.5, 0.5, 0.5), v(MAIN_POS.ingestion)], "parse");
    const segParseCore = mkSeg([v(MAIN_POS.ingestion), new THREE.Vector3(0.2, -0.5, -0.5), v(MAIN_POS.core)], "core");
    const segCoreDash = mkSeg([v(MAIN_POS.core), new THREE.Vector3(4.4, 1.6, -0.8), v(MAIN_POS.dashboard)], "dash");
    const segCoreResp = mkSeg([v(MAIN_POS.core), new THREE.Vector3(4.4, -1.6, 0.8), v(MAIN_POS.response)], "resp");

    const tubeInnerMat = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const tubeOuterMat = new THREE.MeshBasicMaterial({ color: 0x0284c7, transparent: true, opacity: 0.2, depthWrite: false });
    [segHubParse, segParseCore, segCoreDash, segCoreResp].forEach((seg) => {
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(seg.curve, 64, 0.015, 8, false), tubeInnerMat));
      scene.add(new THREE.Mesh(new THREE.TubeGeometry(seg.curve, 64, 0.05, 12, false), tubeOuterMat));
    });

    const setAttackerStyle = (slot: number) => {
      const vis = attackerVisuals[slot];
      const blocked = sim.attackers[slot].status === "blocked";
      vis.coreMat.color.setHex(blocked ? 0x475569 : 0xff0044);
      vis.haloMat.color.setHex(blocked ? 0x64748b : 0xff3366);
      vis.haloMat.opacity = blocked ? 0.2 : 0.45;
      vis.lineMat.opacity = blocked ? 0.08 : 0.55;
    };

    const buildAttackSeg = (slot: number) => {
      const tech = TECHNIQUE_BY_ID[sim.attackers[slot].techniqueId];
      const from = v(ATTACKER_POS[slot]);
      const to = v(SERVER_POS[tech.target]);
      const seg = mkSeg([from, new THREE.Vector3(PERIMETER_X, (from.y + to.y) / 2, 1.0), to], "attack");
      const vis = attackerVisuals[slot];
      vis.seg = seg;
      vis.lineGeo.setFromPoints(seg.curve.getPoints(48));
      vis.lineGeo.computeBoundingSphere();
      setAttackerStyle(slot);
    };
    ATTACKER_POS.forEach((_, i) => buildAttackSeg(i));

    // --- 7. PACKETS (each one carries a real simulated event) ---
    interface SimEvent {
      kind: "benign" | "malicious";
      server: ServerKey;
      slot: number;
      ip: string;
      text: string;
      techniqueId: string | null;
      cc?: string;
      asn?: string;
      reputation?: number;
    }
    interface Packet {
      mesh: THREE.Group;
      route: Seg[];
      idx: number;
      dist: number;
      speed: number;
      ev: SimEvent;
    }

    const packetsGroup = new THREE.Group();
    scene.add(packetsGroup);
    const pktCoreGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const pktHaloGeo = new THREE.SphereGeometry(0.2, 12, 12);
    const pktCyan = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const pktRed = new THREE.MeshBasicMaterial({ color: 0xff0044 });
    const pktHaloCyan = new THREE.MeshBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.3, depthWrite: false });
    const pktHaloRed = new THREE.MeshBasicMaterial({ color: 0xff0044, transparent: true, opacity: 0.3, depthWrite: false });
    const makePacket = (mal: boolean) => {
      const g = new THREE.Group();
      g.add(new THREE.Mesh(pktCoreGeo, mal ? pktRed : pktCyan), new THREE.Mesh(pktHaloGeo, mal ? pktHaloRed : pktHaloCyan));
      return g;
    };

    const packets: Packet[] = [];

    const spawnEvent = () => {
      const active = sim.attackers.filter((a) => a.status === "active");
      let ev: SimEvent;
      let route: Seg[];
      if (active.length && Math.random() < 0.34) {
        const a = pick(active);
        const tech = TECHNIQUE_BY_ID[a.techniqueId];
        ev = {
          kind: "malicious", server: tech.target, slot: a.slot, ip: a.ip, text: tech.log(a.ip),
          techniqueId: tech.id, cc: a.cc, asn: a.asn, reputation: a.reputation,
        };
        route = [attackerVisuals[a.slot].seg!, collectSegs[tech.target], segHubParse, segParseCore, segCoreResp];
      } else {
        const server = pick(SERVER_KEYS);
        const b = benignLog(server);
        ev = { kind: "benign", server, slot: -1, ip: b.ip, text: b.text, techniqueId: null };
        route = [collectSegs[server], segHubParse, segParseCore, segCoreDash];
      }
      const mesh = makePacket(ev.kind === "malicious");
      mesh.position.copy(route[0].curve.getPointAt(0));
      packetsGroup.add(mesh);
      packets.push({ mesh, route, idx: 0, dist: 0, speed: ev.kind === "malicious" ? 3.6 : 3.0, ev });
    };

    // --- 8. EVENT HOOKS (what happens when a packet reaches each node) ---
    let coreFlashTimer = 0;
    let elapsed = 0;
    const toastTimers = new Set<ReturnType<typeof setTimeout>>();

    const normalize = (ev: SimEvent): Record<string, string | number> => {
      const srv = SERVERS[ev.server];
      const tech = ev.techniqueId ? TECHNIQUE_BY_ID[ev.techniqueId] : null;
      const category = tech
        ? tech.rule === "bruteforce" ? "authentication" : tech.rule === "recon" ? "network" : tech.rule === "c2" ? "intrusion_detection" : "web"
        : "process";
      return {
        "@timestamp": new Date().toISOString(),
        "host.name": srv.hostname,
        "host.ip": srv.ip,
        "event.module": srv.module,
        "event.category": category,
        "event.outcome": tech ? "failure" : "success",
        "source.ip": ev.ip,
        ...(ev.cc ? { "source.geo.country_iso_code": ev.cc, "source.as.organization.name": ev.asn ?? "" } : {}),
        ...(tech ? { "threat.technique.id": tech.mitre } : {}),
        message: ev.text.length > 70 ? `${ev.text.slice(0, 70)}…` : ev.text,
      };
    };

    const onArrive = (p: Packet, name: SegName) => {
      const ev = p.ev;
      const srv = SERVERS[ev.server];
      const tech = ev.techniqueId ? TECHNIQUE_BY_ID[ev.techniqueId] : null;
      const attacker = ev.slot >= 0 ? sim.attackers[ev.slot] : undefined;
      const sameAttacker = !!attacker && attacker.ip === ev.ip;

      switch (name) {
        case "attack": {
          serverFlash[ev.server] = 0.5;
          if (sameAttacker) attacker!.events++;
          const st = sim.ipStats[ev.ip] ?? { ip: ev.ip, cc: ev.cc ?? "??", events: 0, techniqueId: ev.techniqueId! };
          st.events++;
          sim.ipStats[ev.ip] = st;
          const keys = Object.keys(sim.ipStats);
          if (keys.length > 40) {
            const weakest = keys.sort((x, y) => sim.ipStats[x].events - sim.ipStats[y].events)[0];
            delete sim.ipStats[weakest];
          }
          break;
        }
        case "collect":
          sim.serverEvents[ev.server]++;
          pushLog({ type: "RAW", host: srv.hostname, text: `${srv.hostname} ${ev.text}`, malicious: ev.kind === "malicious", ip: ev.ip });
          break;
        case "parse":
          sim.parsed++;
          sim.lastNormalized = normalize(ev);
          if (ev.kind === "malicious") {
            sim.enriched++;
            const ioc = (ev.reputation ?? 0) >= 50;
            if (ioc) sim.iocHits++;
            pushLog({
              type: "ENRICH",
              host: "logstash",
              text: `${ev.ip} geo=${ev.cc} asn="${ev.asn}" abuse=${ev.reputation}%${ioc ? " → IOC MATCH" : ""}`,
              malicious: true,
              ip: ev.ip,
            });
          }
          break;
        case "core":
          if (tech) {
            sim.ruleHits[tech.rule]++;
            sim.alerts++;
            sim.techniqueCounts[tech.id] = (sim.techniqueCounts[tech.id] ?? 0) + 1;
            if (sameAttacker) attacker!.alerts++;
            sim.alertsFeed.unshift({ id: nextId(), ts: nowTs(), rule: tech.rule, techniqueId: tech.id, ip: ev.ip, host: srv.hostname });
            if (sim.alertsFeed.length > 20) sim.alertsFeed.pop();
            coreFlashTimer = 1;
            ruleFlash[tech.rule] = 0.7;
            pushLog({
              type: "ALERT",
              host: "siem-core",
              text: `[${RULES[tech.rule].short}] ${tech.mitre} ${tech.name} src=${ev.ip} dst=${srv.hostname} sev=${RULES[tech.rule].severity.toLowerCase()}`,
              malicious: true,
              ip: ev.ip,
            });
          }
          break;
        case "dash":
          sim.dashboardEvents++;
          break;
        case "resp": {
          if (!tech) break;
          sim.cases++;
          actionFlash.case = 0.6;
          const caseId = 1000 + sim.cases;
          if (sameAttacker && attacker!.status === "active" && attacker!.alerts >= BLOCK_AFTER) {
            if (tech.response === "isolate") {
              sim.isolated++;
              actionFlash.isolate = 0.8;
              pushAction("isolate", "ws-fin-07 (10.0.3.47) isolated by EDR");
              pushLog({ type: "SOAR", host: "soar", text: `EDR isolate host=ws-fin-07 reason="${tech.name} to ${ev.ip}"`, malicious: true, ip: ev.ip });
            }
            sim.blocked++;
            actionFlash.fwblock = 0.8;
            attacker!.status = "blocked";
            attacker!.blockedAt = elapsed;
            setAttackerStyle(ev.slot);
            pushAction("fwblock", `fw-edge-01 DROP src=${ev.ip}/32 (${tech.name})`);
            pushAction("case", `Case #${caseId} escalated · ${ev.ip} blocked · Slack notified`);
            pushLog({ type: "SOAR", host: "soar", text: `fw-edge-01 add rule DROP src=${ev.ip}/32 case=#${caseId}`, malicious: true, ip: ev.ip });

            const incId = nextId();
            setIncidents((prev) => [
              ...prev.slice(-3),
              {
                id: incId,
                ip: ev.ip,
                cc: ev.cc ?? "??",
                type: tech.name,
                host: srv.hostname,
                action: tech.response === "isolate" ? "Host isolated + C2 IP blocked" : "IP blocked on fw-edge-01",
              },
            ]);
            const timer = setTimeout(() => {
              toastTimers.delete(timer);
              setIncidents((prev) => prev.filter((i) => i.id !== incId));
            }, 4500);
            toastTimers.add(timer);
          } else {
            const progress = sameAttacker ? `${attacker!.alerts}/${BLOCK_AFTER}` : "late";
            pushAction("case", `Case #${caseId} opened · ${ev.ip} on watchlist (${progress})`);
            pushLog({ type: "SOAR", host: "soar", text: `case #${caseId} opened src=${ev.ip} watchlist ${progress}`, malicious: true, ip: ev.ip });
          }
          break;
        }
      }
    };

    // --- 9. INTERACTION & RAYCASTING ---
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);
    let hoveredKey: string | null = null;
    let downPos = { x: 0, y: 0 };

    const setHover = (key: string | null) => {
      if (key === hoveredKey) return;
      if (hoveredKey) hoverTargets.get(hoveredKey)?.scale.setScalar(1);
      hoveredKey = key;
      if (key) hoverTargets.get(key)?.scale.setScalar(key.startsWith("main:") ? 1.08 : 1.35);
      container.style.cursor = key ? "pointer" : "default";
    };

    const pickKey = (e: PointerEvent | MouseEvent): string | null => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      raycaster.setFromCamera(mouse, camera);
      const hit = raycaster.intersectObjects(hitboxes, false)[0];
      return hit ? (hit.object.userData.key as string) : null;
    };

    const onPointerMove = (e: PointerEvent) => setHover(pickKey(e));
    const onPointerDown = (e: PointerEvent) => {
      downPos = { x: e.clientX, y: e.clientY };
    };
    const onPointerClick = (e: MouseEvent) => {
      // Ignore clicks that were actually orbit drags.
      if (Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y) > 5) return;
      const key = pickKey(e);
      if (key) setSelectedKey(key);
    };

    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("click", onPointerClick);

    // --- 10. FLUSH SIM STATE TO REACT ---
    let epsTick = 0;
    const flushTimer = setInterval(() => {
      if (!pausedRef.current && ++epsTick % 3 === 0) {
        SERVER_KEYS.forEach((k) => {
          sim.serverEps[k] = Math.round(SERVERS[k].baseEps * (0.82 + Math.random() * 0.36));
        });
      }
      setSnap(structuredClone(sim));
    }, 400);

    // --- 11. ANIMATION LOOP ---
    let animId = 0;
    const clock = new THREE.Clock();
    let lastSpawn = 0;
    const tempV = new THREE.Vector3();
    const labelBase = LABEL_DEFS.map((d) => new THREE.Vector3(d.pos[0], d.pos[1] + d.offsetY, d.pos[2]));
    const sourcesBaseY = MAIN_POS.sources[1];
    const monitorBaseY = MAIN_POS.dashboard[1];

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.05);
      const time = clock.elapsedTime;
      const paused = pausedRef.current;
      if (!paused) elapsed += dt;

      controls.update();

      // Cosmetic animations
      sourcesGroup.position.y = sourcesBaseY + Math.sin(time * 2) * 0.1;
      bladeMesh.rotation.x = time * 5;
      monitorGroup.position.y = monitorBaseY + Math.sin(time) * 0.1;
      respGroup.rotation.y = Math.sin(time * 2) * 0.2;
      scanBar.position.y = Math.sin(time * 0.8) * 4.6;
      parserMeshes.forEach((m, i) => (m.rotation.z = time * (0.8 + i * 0.2)));
      ruleMeshes.forEach((m, i) => (m.rotation.y = time * (1 + i * 0.15)));
      attackerVisuals.forEach((vis, i) => {
        vis.halo.rotation.x = time * 0.6 + i;
        vis.halo.rotation.y = time * 0.9;
        const active = sim.attackers[i]?.status === "active";
        vis.core.scale.setScalar(active ? 1 + Math.sin(time * 6 + i) * 0.12 : 0.8);
      });

      // Flash effects
      SERVER_KEYS.forEach((k) => {
        if (serverFlash[k] > 0) serverFlash[k] -= dt;
        serverLedMats[k].color.setHex(serverFlash[k] > 0 ? 0xff0044 : 0x00f0ff);
      });
      RULE_KEYS.forEach((k) => {
        if (ruleFlash[k] > 0) ruleFlash[k] -= dt;
        ruleMats[k].emissive.setHex(ruleFlash[k] > 0 ? 0xffffff : 0x7c3aed);
      });
      ACTION_KEYS.forEach((k) => {
        if (actionFlash[k] > 0) actionFlash[k] -= dt;
        if (hoveredKey !== `action:${k}`) actionMeshes[k].scale.setScalar(actionFlash[k] > 0 ? 1.6 : 1);
      });
      if (coreFlashTimer > 0) coreFlashTimer -= dt * 1.5;
      matCoreGlow.emissive.setHex(coreFlashTimer > 0 ? 0xff0044 : 0x0284c7);

      // Simulation
      if (!paused) {
        if (elapsed - lastSpawn > 0.42) {
          lastSpawn = elapsed;
          spawnEvent();
        }

        for (let i = packets.length - 1; i >= 0; i--) {
          const p = packets[i];
          p.dist += p.speed * dt;
          let done = false;
          while (p.dist >= p.route[p.idx].len) {
            p.dist -= p.route[p.idx].len;
            onArrive(p, p.route[p.idx].name);
            p.idx++;
            if (p.idx >= p.route.length) {
              done = true;
              break;
            }
            if (p.route[p.idx].name === "resp") p.speed = 7; // detected threats are fast-tracked to SOAR
          }
          if (done) {
            packetsGroup.remove(p.mesh);
            packets.splice(i, 1);
            continue;
          }
          const seg = p.route[p.idx];
          p.mesh.position.copy(seg.curve.getPointAt(Math.min(p.dist / seg.len, 1)));
        }

        // Blocked attackers disappear after a while and a new threat actor shows up.
        sim.attackers.forEach((a, i) => {
          if (a.status === "blocked" && elapsed - a.blockedAt > 6) {
            sim.attackers[i] = spawnAttacker(i, sim.attackers);
            buildAttackSeg(i);
            const na = sim.attackers[i];
            const nt = TECHNIQUE_BY_ID[na.techniqueId];
            pushLog({
              type: "INFO",
              host: "intel",
              text: `new threat actor ${na.ip} (${na.cc}, ${na.asn}) → ${nt.name} on ${SERVERS[nt.target].hostname}`,
              malicious: true,
              ip: na.ip,
            });
          }
        });
      }

      // 3D → 2D projection for HTML labels
      LABEL_DEFS.forEach((def, i) => {
        const el = labelEls.current[def.key];
        if (!el) return;
        tempV.copy(labelBase[i]);
        if (def.key === "main:sources") tempV.y += sourcesGroup.position.y - sourcesBaseY;
        if (def.key === "main:dashboard") tempV.y += monitorGroup.position.y - monitorBaseY;
        tempV.project(camera);
        if (tempV.z > 1 || Math.abs(tempV.x) > 1.15 || Math.abs(tempV.y) > 1.15) {
          el.style.opacity = "0";
          return;
        }
        const x = (tempV.x * 0.5 + 0.5) * canvasWidth;
        const y = (-(tempV.y * 0.5) + 0.5) * canvasHeight;
        const anchor = def.tier === "zone" ? "translate(-50%, -50%)" : "translate(-50%, -100%)";
        el.style.transform = `${anchor} translate(${x}px, ${y}px)`;
        el.style.opacity = "1";
      });

      renderer.render(scene, camera);
    };

    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        canvasWidth = entry.contentRect.width;
        canvasHeight = entry.contentRect.height;
        if (canvasWidth === 0 || canvasHeight === 0) continue;
        camera.aspect = canvasWidth / canvasHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvasWidth, canvasHeight);
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(flushTimer);
      toastTimers.forEach(clearTimeout);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("click", onPointerClick);
      controls.dispose();

      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh;
        if (o.geometry) geometries.add(o.geometry);
        if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => materials.add(m));
      });
      [pktCoreGeo, pktHaloGeo].forEach((g) => geometries.add(g));
      [pktCyan, pktRed, pktHaloCyan, pktHaloRed].forEach((m) => materials.add(m));
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      renderer.dispose();

      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  const handleResetView = () => {
    fitCameraRef.current?.();
    setSelectedKey(null);
  };

  const detail = selectedKey ? buildDetail(selectedKey, snap) : null;
  const activeThreats = snap.attackers.filter((a) => a.status === "active").length;
  const recentLogs = snap.logs.slice(-9);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden select-none bg-background/50",
        mode === "fullscreen" ? "h-[calc(100vh-5rem)] min-h-[620px] rounded-xl border border-cyan-500/20 shadow-2xl" : "h-64 sm:h-72",
        className
      )}
    >
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="absolute inset-0 touch-none" />

      {/* FLOATING 3D-TO-2D HTML LABELS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
        {LABEL_DEFS.map((def) => (
          <div
            key={def.key}
            ref={(el) => {
              labelEls.current[def.key] = el;
            }}
            onClick={def.tier === "zone" ? undefined : () => setSelectedKey(def.key)}
            className={cn(
              "absolute top-0 left-0 transition-opacity duration-100",
              def.tier !== "zone" && "pointer-events-auto cursor-pointer hover:brightness-125",
              def.tier === "sub" && !showDetails && "hidden",
              selectedKey === def.key && "ring-1 ring-white/70 rounded-md"
            )}
            style={{ opacity: 0, willChange: "transform" }}
          >
            <LabelContent def={def} s={snap} />
          </div>
        ))}
      </div>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* TOP-LEFT HUD: title, live stats, legend */}
      <div className="absolute top-4 left-4 pointer-events-none z-20 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/80 backdrop-blur-md border border-cyan-500/30 text-xs font-mono text-cyan-400">
          <Activity className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>SIEM ARCHITECTURE // LIVE SIMULATION</span>
        </div>
        <div className="grid grid-cols-4 gap-1.5 w-fit">
          {[
            { label: "EPS", value: fmtK(totalEps(snap)), tone: "cyan" as Tone },
            { label: "ALERTS", value: String(snap.alerts), tone: "amber" as Tone },
            { label: "BLOCKED", value: String(snap.blocked), tone: "emerald" as Tone },
            { label: "THREATS", value: String(activeThreats), tone: "red" as Tone },
          ].map((st) => (
            <div key={st.label} className={cn("px-2 py-1 rounded-md bg-background/80 backdrop-blur-md border font-mono min-w-[64px]", TONE[st.tone].border)}>
              <div className="text-[8px] text-muted-foreground tracking-wider">{st.label}</div>
              <div className={cn("text-sm font-bold leading-tight", TONE[st.tone].text)}>{st.value}</div>
            </div>
          ))}
        </div>
        <div className="hidden sm:flex flex-wrap gap-x-3 gap-y-1 px-2 py-1 rounded-md bg-background/70 backdrop-blur-md border border-border/50 text-[9px] font-mono text-muted-foreground w-fit">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Attacker / malicious</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" />Log source / benign</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400" />Detection rule</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />SOAR action</span>
        </div>
      </div>

      {/* TOP-RIGHT hint (when nothing is selected) */}
      {!detail && (
        <div className="absolute top-4 right-4 pointer-events-none z-20 hidden md:block text-right text-[10px] font-mono text-muted-foreground/80 space-y-0.5">
          <p>Drag to rotate · Scroll to zoom</p>
          <p className="text-cyan-400">Click any node (big or small) to inspect</p>
        </div>
      )}

      {/* LIVE LOG STREAM */}
      {showLogs && (
        <div className="absolute bottom-4 left-4 z-20 hidden lg:block w-[480px] rounded-lg border border-cyan-500/30 bg-black/75 backdrop-blur-md shadow-xl pointer-events-auto">
          <div className="flex items-center justify-between px-2.5 py-1 border-b border-cyan-500/20">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-400">
              <Terminal className="w-3 h-3" />
              tail -f /var/log/siem/pipeline.log
            </div>
            <button onClick={() => setShowLogs(false)} className="text-muted-foreground hover:text-foreground" aria-label="Hide log stream">
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="px-2.5 py-1.5 space-y-0.5 h-[150px] overflow-hidden flex flex-col justify-end">
            {recentLogs.length === 0 && <div className="text-[10px] font-mono text-muted-foreground">waiting for events…</div>}
            {recentLogs.map((l) => (
              <div key={l.id} className="flex items-start gap-1.5 text-[9.5px] font-mono leading-snug animate-in fade-in slide-in-from-bottom-1 duration-200">
                <span className="text-slate-500 shrink-0">{l.ts}</span>
                <span className={cn("shrink-0 w-[46px] text-center rounded px-0.5", LOG_TAG[l.type])}>{l.type}</span>
                <span className={cn("truncate", TONE[logTone(l)].text, l.type === "RAW" && !l.malicious && "text-slate-400")}>{l.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOTTOM CONTROLS */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 lg:right-[300px] flex items-center gap-1.5 p-1.5 rounded-full bg-background/80 backdrop-blur-md border border-cyan-500/30 shadow-lg z-20">
        <Button size="sm" variant="outline" onClick={handleResetView} className="rounded-full text-xs h-8 px-3 gap-1.5">
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </Button>
        <Button size="sm" variant="outline" onClick={() => setShowDetails((d) => !d)} className="rounded-full text-xs h-8 px-3 gap-1.5">
          {showDetails ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {showDetails ? "Hide details" : "Show details"}
        </Button>
        <Button size="sm" variant="outline" onClick={() => setPaused((p) => !p)} className="rounded-full text-xs h-8 px-3 gap-1.5">
          {paused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          {paused ? "Resume" : "Pause"}
        </Button>
        {!showLogs && (
          <Button size="sm" variant="outline" onClick={() => setShowLogs(true)} className="rounded-full text-xs h-8 px-3 gap-1.5 hidden lg:inline-flex">
            <Terminal className="w-3.5 h-3.5" />
            Logs
          </Button>
        )}
      </div>

      {/* INCIDENT RESPONSE POP-UPS */}
      <div className="absolute bottom-4 right-4 flex flex-col-reverse gap-2 z-40 pointer-events-none">
        {incidents.map((inc) => (
          <div
            key={inc.id}
            className="animate-in fade-in slide-in-from-bottom-5 bg-red-950/85 border border-red-500/50 p-2.5 rounded-md shadow-[0_0_15px_rgba(255,0,0,0.4)] backdrop-blur-md flex items-start gap-2.5 w-[270px] pointer-events-auto"
          >
            <ShieldAlert className="text-red-500 w-4 h-4 mt-0.5 animate-pulse shrink-0" />
            <div className="text-[10px] font-mono leading-tight space-y-0.5">
              <div className="text-red-400 font-bold">{inc.type} — contained</div>
              <div className="text-red-200/80">Attacker: {inc.ip} ({inc.cc})</div>
              <div className="text-red-200/80">Target: {inc.host}</div>
              <div className="text-emerald-300/90">SOAR: {inc.action}</div>
            </div>
          </div>
        ))}
      </div>

      {/* DETAIL PANEL */}
      {detail && (
        <div className="absolute top-4 right-4 sm:right-5 w-[calc(100%-2rem)] sm:w-96 z-30 animate-in fade-in slide-in-from-right-4 duration-300 pointer-events-auto">
          <Card className={cn("border bg-background/90 backdrop-blur-xl shadow-2xl", TONE[detail.tone].border)}>
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
              <div className="space-y-1 min-w-0">
                <div className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono uppercase border", TONE[detail.tone].badge)}>
                  <detail.icon className="w-3 h-3" />
                  {detail.badge}
                </div>
                <CardTitle className="text-base font-bold font-heading text-foreground break-all">{detail.title}</CardTitle>
                {detail.subtitle && <p className="text-[11px] font-mono text-muted-foreground">{detail.subtitle}</p>}
              </div>
              <button onClick={() => setSelectedKey(null)} className="text-muted-foreground hover:text-foreground p-1" aria-label="Close details">
                <X className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 pt-1 space-y-3 text-xs max-h-[calc(100vh-17rem)] overflow-y-auto">
              {detail.description && <p className="text-muted-foreground leading-relaxed">{detail.description}</p>}

              {detail.rows.length > 0 && (
                <div className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-1 pt-2 border-t border-border/50 text-[11px] font-mono">
                  {detail.rows.map((r) => (
                    <div key={r.k} className="contents">
                      <span className="text-muted-foreground uppercase text-[10px] pt-px">{r.k}</span>
                      <span className={cn("font-semibold break-all", r.tone ? TONE[r.tone].text : "text-foreground/90")}>{r.v}</span>
                    </div>
                  ))}
                </div>
              )}

              {detail.sections.map((sec) => (
                <div key={sec.title} className="space-y-1 pt-2 border-t border-border/50">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">{sec.title}</span>
                  {sec.items.length === 0 ? (
                    <p className="text-[10px] font-mono text-muted-foreground/70 italic">{sec.empty ?? "—"}</p>
                  ) : (
                    <ul className={cn("space-y-1", sec.mono ? "text-[10px] font-mono" : "text-[11px] font-mono")}>
                      {sec.items.map((it, i) => (
                        <li key={i} className={cn("flex items-start gap-1.5", it.tone ? TONE[it.tone].text : "text-foreground/90")}>
                          <span className={cn("w-1.5 h-1.5 rounded-full mt-1 shrink-0", it.tone ? TONE[it.tone].dot : "bg-cyan-400")} />
                          <span className={cn(sec.mono ? "break-all whitespace-pre-wrap" : "")}>{it.text}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}

              {detail.code && (
                <div className="space-y-1 pt-2 border-t border-border/50">
                  <span className="text-[10px] font-mono uppercase text-muted-foreground tracking-wider">{detail.code.title}</span>
                  <pre className="text-[10px] font-mono leading-snug p-2 rounded bg-black/60 border border-border/50 text-emerald-300/90 whitespace-pre-wrap break-all max-h-48 overflow-y-auto">
                    {detail.code.body}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
