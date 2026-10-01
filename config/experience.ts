import { ValidSkills } from "./constants";

export interface ExperienceInterface {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: Date;
  endDate: Date | "Present";
  description: string[];
  achievements: string[];
  skills: ValidSkills[];
  companyUrl?: string;
  logo?: string;
}

export const experiences: ExperienceInterface[] = [
  {
    id: "rhcsa",
    position: "Red Hat System Administration (RHCSA) Trainee",
    company: "Infinite Learning",
    location: "Kepulauan Riau, Indonesia",
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-06-01"),
    description: [
      "Configured, administered, and maintained Red Hat Enterprise Linux (RHEL) server environments following enterprise best practices.",
      "Implemented system security, user permissions, Access Control Lists (ACLs), and firewall rules using firewalld and SELinux.",
      "Managed essential network services, systemd service lifecycle, automated tasks via cron, and storage management (LVM/partitioning).",
    ],
    achievements: [
      "Successfully achieved the official Red Hat Certified System Administrator (RHCSA) certification.",
      "Developed hands-on server deployment and security hardening projects to simulate real-world enterprise infrastructure.",
    ],
    skills: ["Linux", "RHEL", "Server Management", "Network Security", "Security Management", "Bash"],
    companyUrl: "https://infinitelearning.id",
    logo: "/experience/redhat-logo.png",
  },
  {
    id: "dwansoft-intern",
    position: "Security Software Engineer / Fullstack Engineer",
    company: "PT. Dwansoft Global Indonesia",
    location: "Jakarta, Indonesia",
    startDate: new Date("2025-08-24"),
    endDate: "Present",
    description: [
      "Performed production server hardening, system configuration, and security auditing to mitigate potential vulnerabilities and prevent unauthorized access.",
      "Architected and developed full-stack web applications by implementing the complete Software Development Life Cycle (SDLC) from requirements to deployment.",
      "Conducted web application penetration testing and vulnerability assessments to identify security loopholes and ensure robust protection against web-based attacks.",
    ],
    achievements: [
      "Acquired comprehensive hands-on expertise in configuring and maintaining real-world production server infrastructure.",
      "Significantly upskilled in advanced server hardening techniques, secure code reviews, and proactive threat mitigation.",
      "Mastered secure software development methodologies and DevSecOps principles to safeguard application source code against OWASP Top 10 vulnerabilities.",
    ],
    skills: ["Linux", "Server Management", "Security Management", "Network Security", "Golang", "React", "Next.js", "Node.js", "Typescript", "Laravel", "PHP", "Docker"],
    companyUrl: "https://dwansoft.com",
    logo: "/logo.png",
  },
];
