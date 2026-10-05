import { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";

import { AnimatedSection } from "@/components/common/animated-section";
import { AnimatedText } from "@/components/common/animated-text";
import { ClientPageWrapper } from "@/components/common/client-page-wrapper";
import { CyberPageSpotlight } from "@/components/common/cyber-page-spotlight";
import { CyberSpotlightHero } from "@/components/hero/cyber-spotlight-hero";
import { Icons } from "@/components/common/icons";
import RepositoryCard, { GithubRepository } from "@/components/repositories/repository-card";
import ExperienceCard from "@/components/experience/experience-card";
import ProjectCard from "@/components/projects/project-card";
import SkillsMarquee from "@/components/skills/skills-marquee";
import { Button, buttonVariants } from "@/components/ui/button";
import { experiences } from "@/config/experience";
import { pagesConfig } from "@/config/pages";
import { featuredProjects } from "@/config/projects";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: `${pagesConfig.home.metadata.title}`,
  description:
    "Sultan Arif - Cyber Security Student | Full Stack Developer | RHCSA. Welcome to my portfolio website.",
  alternates: {
    canonical: siteConfig.url,
  },
};

async function getRepositories(): Promise<GithubRepository[]> {
  try {
    const res = await fetch(
      "https://api.github.com/users/RMSULTAN256/repos?sort=updated&per_page=10",
      {
        headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
        next: { revalidate: 3600 }
      }
    );
    if (!res.ok) return [];
    const repos: GithubRepository[] = await res.json();
    return repos.filter((repo) => !repo.fork);
  } catch (error) {
    return [];
  }
}

export default async function IndexPage() {
  const repositories = await getRepositories();
  // Structured data for personal portfolio
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.authorName,
    url: siteConfig.url,
    image: siteConfig.ogImage,
    jobTitle: "Cyber Security Student | Full Stack Developer | RHCSA",
    sameAs: [siteConfig.links.github, siteConfig.links.twitter],
  };

  // Structured data for website
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: siteConfig.url,
    author: {
      "@type": "Person",
      name: siteConfig.authorName,
      url: siteConfig.url,
    },
  };

  return (
    <ClientPageWrapper>
      <Script
        id="schema-person"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />
      <Script
        id="schema-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />

      <CyberPageSpotlight>
        {/* Native Cyber Spotlight Hero (100% Seamless, SVG Hologram + Global Spotlight) */}
        <CyberSpotlightHero />

        {/* Cyber Section Divider */}
        <div className="w-full max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent my-6" />

        {/* 01 // PROJECTS */}
        <AnimatedSection
          direction="up"
          className="container relative space-y-6 py-12 my-8"
          id="projects"
        >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-3 text-center">
          <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/25 px-3 py-0.5 rounded-full">
            01 // PORTFOLIO
          </span>
          <AnimatedText
            as="h2"
            className="font-heading text-3xl leading-[1.1] sm:text-4xl md:text-5xl"
          >
            {pagesConfig.projects.title}
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.2}
            className="max-w-[85%] leading-normal text-muted-foreground sm:text-base sm:leading-7"
          >
            {pagesConfig.projects.description}
          </AnimatedText>
        </div>
        <div className="w-full">
          <div
            className={cn(
              "w-full gap-4 items-stretch",
              featuredProjects.length === 1
                ? "flex justify-center max-w-lg mx-auto"
                : featuredProjects.length === 2
                  ? "grid grid-cols-1 sm:grid-cols-2 max-w-4xl mx-auto"
                  : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
            )}
          >
            {featuredProjects.map((exp, index) => (
              <AnimatedSection
                key={exp.id}
                delay={0.1 * (index + 1)}
                direction="up"
                className="h-full w-full min-w-0"
              >
                <ProjectCard project={exp} showImage={false} />
              </AnimatedSection>
            ))}
          </div>
        </div>
        <AnimatedText delay={0.4} className="flex justify-center">
          <Link href="/projects">
            <Button
              variant={"outline"}
              className="rounded-xl border-border/70 hover:border-cyan-500/50 hover:bg-cyan-500/10"
            >
              <Icons.chevronDown className="mr-2 h-4 w-4 text-cyan-400" /> View All Projects
            </Button>
          </Link>
        </AnimatedText>
      </AnimatedSection>

      {/* Cyber Section Divider */}
      <div className="w-full max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent my-6" />

      {/* 02 // EXPERIENCE */}
      <AnimatedSection
        direction="up"
        className="container relative space-y-6 py-12 my-8"
        id="experience"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-3 text-center">
          <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/25 px-3 py-0.5 rounded-full">
            02 // CAREER TIMELINE
          </span>
          <AnimatedText
            as="h2"
            className="font-heading text-3xl leading-[1.1] sm:text-4xl md:text-5xl"
          >
            {pagesConfig.experience.title}
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.2}
            className="max-w-[85%] leading-normal text-muted-foreground sm:text-base sm:leading-7"
          >
            {pagesConfig.experience.description}
          </AnimatedText>
        </div>
        <div
          className={cn(
            "w-full gap-4 items-stretch",
            experiences.slice(0, 3).length === 1
              ? "flex justify-center max-w-lg mx-auto"
              : experiences.slice(0, 3).length === 2
                ? "grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mx-auto"
          )}
        >
          {experiences.slice(0, 3).map((experience, index) => (
            <AnimatedSection
              key={experience.id}
              delay={0.1 * (index + 1)}
              direction="up"
              className="h-full w-full"
            >
              <ExperienceCard experience={experience} />
            </AnimatedSection>
          ))}
        </div>
        <AnimatedText delay={0.4} className="flex justify-center">
          <Link href="/experience">
            <Button
              variant={"outline"}
              className="rounded-xl border-border/70 hover:border-cyan-500/50 hover:bg-cyan-500/10"
            >
              <Icons.chevronDown className="mr-2 h-4 w-4 text-cyan-400" /> View All Experience
            </Button>
          </Link>
        </AnimatedText>
      </AnimatedSection>

      {/* Cyber Section Divider */}
      <div className="w-full max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent my-6" />

      {/* 03 // REPOSITORIES */}
      <AnimatedSection
        direction="up"
        className="container relative space-y-6 py-12 my-8"
        id="repositories"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-3 text-center">
          <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/25 px-3 py-0.5 rounded-full">
            03 // OPEN SOURCE
          </span>
          <AnimatedText
            as="h2"
            className="font-heading text-3xl leading-[1.1] sm:text-4xl md:text-5xl"
          >
            {pagesConfig.repositories.title}
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.2}
            className="max-w-[85%] leading-normal text-muted-foreground sm:text-base sm:leading-7"
          >
            {pagesConfig.repositories.description}
          </AnimatedText>
        </div>
        {repositories.length > 0 ? (
          <RepositoryCard repositories={repositories.slice(0, 3)} />
        ) : (
          <div className="text-center text-muted-foreground mt-10">
            <p>Repositories are currently unavailable.</p>
          </div>
        )}
        <AnimatedText delay={0.4} className="flex justify-center">
          <Link href="/repositories">
            <Button
              variant={"outline"}
              className="rounded-xl border-border/70 hover:border-cyan-500/50 hover:bg-cyan-500/10"
            >
              <Icons.chevronDown className="mr-2 h-4 w-4 text-cyan-400" /> View All Repositories
            </Button>
          </Link>
        </AnimatedText>
      </AnimatedSection>

      {/* Cyber Section Divider */}
      <div className="w-full max-w-5xl mx-auto h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent my-6" />

      {/* 04 // SKILLS */}
      <AnimatedSection
        direction="up"
        className="container relative space-y-6 py-12 my-8"
        id="skills"
      >
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-3 text-center">
          <span className="text-[11px] font-mono tracking-widest uppercase text-cyan-400/90 bg-cyan-500/10 border border-cyan-500/25 px-3 py-0.5 rounded-full">
            04 // TECH STACK
          </span>
          <AnimatedText
            as="h2"
            className="font-heading text-3xl leading-[1.1] sm:text-4xl md:text-5xl"
          >
            {pagesConfig.skills.title}
          </AnimatedText>
          <AnimatedText
            as="p"
            delay={0.2}
            className="max-w-[85%] leading-normal text-muted-foreground sm:text-base sm:leading-7"
          >
            {pagesConfig.skills.description}
          </AnimatedText>
        </div>
        <SkillsMarquee />
        <AnimatedText delay={0.4} className="flex justify-center">
          <Link href="/skills">
            <Button
              variant={"outline"}
              className="rounded-xl border-border/70 hover:border-cyan-500/50 hover:bg-cyan-500/10"
            >
              <Icons.chevronDown className="mr-2 h-4 w-4 text-cyan-400" /> View All Skills
            </Button>
          </Link>
        </AnimatedText>
      </AnimatedSection>
      </CyberPageSpotlight>
    </ClientPageWrapper>
  );
}
