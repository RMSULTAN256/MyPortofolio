import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Sultan Arif - Cyber Security Student | Full Stack Developer | RHCSA",
    short_name: "Sultan Arif",
    description:
      "Sultan Arif - Cyber Security Student | Full Stack Developer | RHCSA. Welcome to my portfolio website.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "64x64",
        type: "image/png",
      },
      {
        src: "/favicon.ico",
        sizes: "64x64",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: [
      "portfolio",
      "personal",
      "cybersecurity",
      "full stack development",
      "web development",
      "software engineering",
      "machine learning",
      "developer",
      "web development",
    ],
    lang: "en",
    dir: "ltr",
    scope: "/",
  };
}
