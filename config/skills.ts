import { Icons } from "@/components/common/icons";

export type SkillCategory =
  | "All"
  | "Security & DevOps"
  | "Backend"
  | "Frontend"
  | "Database";

export interface skillsInterface {
  name: string;
  description: string;
  rating: number;
  icon: any;
  category?: "Security & DevOps" | "Backend" | "Frontend" | "Database";
}

export const skillsUnsorted: skillsInterface[] = [
  {
    name: "RHEL / RHCSA",
    description:
      "Enterprise Linux server hardening, systemd lifecycle, firewalld, SELinux enforcement, and storage administration.",
    rating: 4.5,
    icon: Icons.redhat,
    category: "Security & DevOps",
  },
  {
    name: "DevSecOps",
    description:
      "Automated CI/CD security pipelines, SAST/DAST vulnerability scanning, container image auditing, and secure SDLC workflows.",
    rating: 4.2,
    icon: Icons.devsecops,
    category: "Security & DevOps",
  },
  {
    name: "SIEM & SOC",
    description:
      "Security Information and Event Management, centralized log telemetry, intrusion detection, and incident response monitoring.",
    rating: 4.0,
    icon: Icons.siem,
    category: "Security & DevOps",
  },
  {
    name: "Golang",
    description:
      "High-throughput concurrent backend services, custom network scanners, fast packet analyzers, and automated security monitoring systems.",
    rating: 3.2,
    icon: Icons.go,
    category: "Backend",
  },
  {
    name: "Laravel",
    description:
      "Enterprise MVC web architecture, CSRF/XSS protection, Eloquent ORM sanitization, REST APIs, and WhatsApp OTP authentication.",
    rating: 3.6,
    icon: Icons.laravel,
    category: "Backend",
  },
  {
    name: "Next.js",
    description:
      "Fullstack React applications with server components, optimized rendering pipelines, API routes, and modern performance architecture.",
    rating: 3,
    icon: Icons.nextjs,
    category: "Frontend",
  },
  {
    name: "React",
    description:
      "Component-driven interactive UI development, state management, custom hooks, and high-performance client architectures.",
    rating: 3,
    icon: Icons.react,
    category: "Frontend",
  },
  {
    name: "Node.js",
    description:
      "Event-driven asynchronous server runtimes, microservices, secure authentication flows, and scalable backend services.",
    rating: 3.5,
    icon: Icons.nodejs,
    category: "Backend",
  },
  {
    name: "Typescript",
    description:
      "Type-safe software engineering preventing runtime bugs, strict interfaces, and scalable enterprise codebases.",
    rating: 2.8,
    icon: Icons.typescript,
    category: "Frontend",
  },
  {
    name: "PHP",
    description:
      "Server-side scripting, robust backend architectures, custom middleware pipelines, and secure database integrations.",
    rating: 4,
    icon: Icons.php,
    category: "Backend",
  },
  {
    name: "Postgresql",
    description:
      "Relational database design, ACID compliance, complex relational queries, indexes, and secure data integrity.",
    rating: 4,
    icon: Icons.postgresql,
    category: "Database",
  },
  {
    name: "Mysql",
    description:
      "Relational data modeling, query optimization, high-availability schemas, and parameterized queries.",
    rating: 4,
    icon: Icons.mysql,
    category: "Database",
  },
  {
    name: "Cloudflare",
    description:
      "Enterprise web security perimeter, DDoS mitigation, DNS security, WAF rulesets, and edge CDN acceleration.",
    rating: 4,
    icon: Icons.cloudflare,
    category: "Security & DevOps",
  },
  {
    name: "Tailwind CSS",
    description:
      "Modern utility-first responsive styling, dark mode themes, custom design systems, and cyber animations.",
    rating: 4,
    icon: Icons.tailwindcss,
    category: "Frontend",
  },
  {
    name: "Javascript",
    description:
      "Modern ES6+ development, asynchronous promises, DOM manipulation, and dynamic client-side interactivity.",
    rating: 4,
    icon: Icons.javascript,
    category: "Frontend",
  },
  {
    name: "HTML 5",
    description:
      "Semantic web architecture, accessible markup (a11y), clean DOM structure, and modern web standards.",
    rating: 4.5,
    icon: Icons.html5,
    category: "Frontend",
  },
  {
    name: "CSS 3",
    description:
      "Advanced responsive layouts, Flexbox, CSS Grid, keyframe animations, and custom styling filters.",
    rating: 3.2,
    icon: Icons.css3,
    category: "Frontend",
  },
  {
    name: "Bootstrap",
    description:
      "Rapid responsive UI development with component libraries, mobile-first grids, and utility styling.",
    rating: 3,
    icon: Icons.bootstrap,
    category: "Frontend",
  },
];

export const skills = skillsUnsorted
  .slice()
  .sort((a, b) => b.rating - a.rating);

export const featuredSkills = skills.slice(0, 6);
