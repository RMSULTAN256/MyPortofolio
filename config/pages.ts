import { ValidPages } from "./constants";

type PagesConfig = {
  [key in ValidPages]: {
    title: string;
    description: string;
    metadata: {
      title: string;
      description: string;
    };
    // featuredDescription: string;
  };
};

export const pagesConfig: PagesConfig = {
  home: {
    title: "Home",
    description: "Welcome to my portfolio website.",
    metadata: {
      title: "Home",
      description: "Sultan Arif Portfolio.",
    },
  },
  about: {
    title: "About",
    description: "Learn more about my background and journey.",
    metadata: {
      title: "About",
      description: "About Sultan Arif.",
    },
  },
  skills: {
    title: "Skills",
    description: "Key skills that define my professional identity.",
    metadata: {
      title: "Skills",
      description:
        "Sultan Arif's key skills that define his professional identity.",
    },
  },
  projects: {
    title: "Projects",
    description: "Showcasing impactful projects and technical achievements.",
    metadata: {
      title: "Projects",
      description: "Sultan Arif's projects in building web applications.",
    },
  },
  experience: {
    title: "Experience",
    description: "Professional journey and career timeline.",
    metadata: {
      title: "Experience",
      description:
        "Sultan Arif's professional journey and experience timeline.",
    },
  },
  contact: {
    title: "Contact",
    description: "Let's connect and explore collaborations.",
    metadata: {
      title: "Contact",
      description: "Contact Sultan Arif.",
    },
  },
  contributions: {
    title: "Contributions",
    description: "Open-source contributions and community involvement.",
    metadata: {
      title: "Contributions",
      description:
        "Sultan Arif's open-source contributions and community involvement.",
    },
  },
  resume: {
    title: "Resume",
    description: "Sultan Arif's resume.",
    metadata: {
      title: "Resume",
      description: "Sultan Arif's resume.",
    },
  },
  blogs: {
    title: "Blogs",
    description:
      "Articles and insights on cybersecurity, full stack development, and Linux system administration.",
    metadata: {
      title: "Blogs",
      description:
        "Sultan Arif's blog — articles and insights on cybersecurity, full stack development, and Linux system administration.",
    },
  },
  services: {
    title: "Services",
    description: "Services and solutions I provide.",
    metadata: {
      title: "Services",
      description: "Services provided by Sultan Arif.",
    },
  },
  testimonials: {
    title: "Testimonials",
    description: "What people say about working with me.",
    metadata: {
      title: "Testimonials",
      description: "Testimonials for Sultan Arif.",
    },
  },
  portfolio: {
    title: "Portfolio",
    description: "Selected works and projects.",
    metadata: {
      title: "Portfolio",
      description: "Sultan Arif's Portfolio.",
    },
  },
  guestbook: {
    title: "Guestbook",
    description: "Leave a message or feedback.",
    metadata: {
      title: "Guestbook",
      description: "Guestbook for Sultan Arif.",
    },
  },
  snippets: {
    title: "Snippets",
    description: "Useful code snippets and tips.",
    metadata: {
      title: "Snippets",
      description: "Code snippets by Sultan Arif.",
    },
  },
  uses: {
    title: "Uses",
    description: "Hardware, software, and tools I use daily.",
    metadata: {
      title: "Uses",
      description: "Tools and tech stack used by Sultan Arif.",
    },
  },
};
