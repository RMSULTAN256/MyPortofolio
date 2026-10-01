import {
  ValidCategory,
  ValidExpType,
  ValidProjectStatus,
  ValidSkills,
} from "./constants";

interface PagesInfoInterface {
  title: string;
  imgArr: string[];
  description?: string;
}

interface DescriptionDetailsInterface {
  paragraphs: string[];
  bullets: string[];
}

export interface ProjectInterface {
  id: string;
  type: ValidExpType;
  status?: ValidProjectStatus;
  companyName: string;
  category: ValidCategory[];
  shortDescription: string;
  websiteLink?: string;
  githubLink?: string;
  techStack: ValidSkills[];
  startDate: Date;
  endDate: Date;
  companyLogoImg: any;
  descriptionDetails: DescriptionDetailsInterface;
  pagesInfoArr: PagesInfoInterface[];
}

export const Projects: ProjectInterface[] = [
  {
    id: "Automate-backup",
    companyName: "Automate Backup with Bash Script for Critical Files",
    type: "Personal",
    status: "Done",
    category: ["Backend", "DevOps", "Cybersecurity"],
    shortDescription:
      "A bash script that automates the backup of critical files and directories to a specified location, ensuring data integrity and security.",
    githubLink: "https://github.com/RMSULTAN256/Automate-backup",
    techStack: [
      "Bash",
      "Linux",
      "Cron Jobs",
      "rsync",
      "CI/CD",
      "Shell Scripting",
    ],
    startDate: new Date("2024-01-01"),
    endDate: new Date("2025-12-01"),
    companyLogoImg: "/logo.png",
    pagesInfoArr: [
      {
        title: "Script Overview",
        description:
          "The script is designed to automate the backup process for critical files and directories, ensuring that data is securely copied to a specified backup location.",
        imgArr: ["/logo.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "This project involves the creation of a bash script that automates the backup of critical files and directories. The script is designed to be run on a Linux system and can be scheduled using cron jobs for regular backups.",
        "The script utilizes rsync for efficient file transfer, ensuring that only changed files are copied to the backup location. It also includes error handling and logging to monitor the backup process.",
        "This project is aimed at individuals and organizations looking to implement a simple yet effective backup solution for their important data.",
      ],
      bullets: [
        "Developed a bash script to automate the backup of critical files and directories.",
        "Implemented rsync for efficient file transfer and synchronization.",
        "Scheduled regular backups using cron jobs for automated execution.",
        "Included error handling and logging to monitor the backup process.",
        "Ensured data integrity and security during the backup process.",
      ],
    },
  },
  {
    id: "happytour",
    companyName: "Happy Tour & Rent Car",
    type: "Personal",
    status: "Done",
    category: ["Full Stack", "Backend", "Web Dev", "UI/UX", "Cybersecurity", "DevOps"],
    shortDescription:
      "A comprehensive web application for a tour and car rental service, promotion of tourism and car rental services with a user-friendly interface and secure backend.",
    techStack: ["Next.js", "React", "Node.js", "Typescript", "Python"],
    startDate: new Date("2024-04-01"),
    endDate: new Date("2024-10-01"),
    companyLogoImg: "/logo.png",
    pagesInfoArr: [
      {
        title: "Vehicle Catalog & Booking Management",
        description:
          "Designed customer-facing booking and catalog interface with responsive components and secure backend endpoints.",
        imgArr: ["/logo.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "Happy Tour & Rent Car is an end-to-end web platform designed to streamline vehicle rentals and travel package reservations.",
        "Features a modern, responsive user experience allowing customers to explore rental fleets, verify real-time availability, and submit booking requests.",
        "Built with secure backend services, strict form validation, and optimized data queries to ensure high availability and data integrity.",
      ],
      bullets: [
        "Developed full-stack web application with Next.js and Node.js for car rental services.",
        "Designed responsive mobile-first UI for catalog browsing and booking requests.",
        "Implemented secure API endpoints with input validation to prevent common injection attacks.",
        "Optimized client-side rendering and asset delivery for fast loading times.",
      ],
    },
  },
  {
    id: "system-report-kabil-webapp",
    companyName: "System Report Kabil Webapp",
    type: "Freelance",
    status: "In Progress",
    category: ["Web Dev", "Backend", "Frontend", "Full Stack"],
    shortDescription:
      "A web application to digitize traditional reporting into an Integrated Tenant Feedback & Response System.",
    websiteLink: "https://tncare.kcn.co.id/",
    techStack: ["Javascript", "Bootstrap", "PHP", "Laravel", "GitLab CI"],
    startDate: new Date("2022-03-01"),
    endDate: new Date("2022-07-01"),
    companyLogoImg: "/projects/kabil/logo.png",
    pagesInfoArr: [
      {
        title: "TN-Care Portal & Login",
        description:
          "Integrated Tenant Feedback & Response System portal for Kabil Integrated Industrial Estate, supporting multi-role authentication via Email and WhatsApp OTP.",
        imgArr: ["/projects/kabil/tncare-login.png"],
      },
      {
        title: "WhatsApp OTP & Notification Integration",
        description:
          "Real-time automated WhatsApp notifications for ticket status updates, observation card approvals, and secure one-time passcode (OTP) verification.",
        imgArr: ["/projects/kabil/whatsapp-notification.png"],
      },
    ],
    descriptionDetails: {
      paragraphs: [
        "TN-Care (System Report Kabil Webapp) is an Integrated Tenant Feedback & Response System developed for Kabil Integrated Industrial Estate (KITK) to digitize and modernize traditional reporting and tenant communication workflows.",
        "The platform provides a secure, fast, and transparent ecosystem for reporting observations, handling tenant inquiries, and tracking issue resolution across the industrial estate with 24/7 responsive service.",
        "Built with Laravel and modern web technologies, it features multi-role access control, automated real-time WhatsApp notifications for ticket verification and observation card approvals, and candidate reward tracking for workplace safety and quality improvements.",
      ],
      bullets: [
        "Engineered a robust tenant feedback and observation report system with Laravel and Bootstrap.",
        "Implemented multi-factor authentication and real-time OTP / status notifications via WhatsApp integration.",
        "Developed automated ticket workflow (KITK ticketing) with role-based approval, verification, and reward systems.",
        "Integrated CI/CD pipelines using GitLab CI to streamline testing and deployment.",
        "Enhanced workplace safety, quality, and tenant engagement through transparent digital tracking.",
      ],
    },
  },
];

export const featuredProjects = Projects.slice(0, 3);
