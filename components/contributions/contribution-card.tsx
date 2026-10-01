import Link from "next/link";

import { AnimatedSection } from "@/components/common/animated-section";
import { Icons } from "@/components/common/icons";
import { contributionsInterface } from "@/config/contributions";
import { cn } from "@/lib/utils";

interface ContributionCardProps {
  contributions: contributionsInterface[];
}

export default function ContributionCard({
  contributions,
}: ContributionCardProps) {
  return (
    <div
      className={cn(
        "w-full gap-4 items-stretch",
        contributions.length === 1
          ? "flex justify-center max-w-lg mx-auto"
          : contributions.length === 2
            ? "grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto"
      )}
    >
      {contributions.map((contribution, id) => (
        <AnimatedSection
          key={id}
          delay={0.1 * (id + 1)}
          direction="up"
          className="h-full w-full"
        >
          <Link
            href={contribution.link}
            target="_blank"
            className="w-full min-w-0 h-full block group"
          >
            <div className="relative rounded-xl border border-border/70 bg-card/40 backdrop-blur-md p-2 hover:border-cyan-500/50 hover:shadow-[0_0_24px_rgba(0,240,255,0.08)] transition-all duration-300 w-full h-full flex flex-col">
              <Icons.externalLink
                size={35}
                className="absolute bottom-3 right-3 border bg-background rounded-full p-1.5 sm:p-2 cursor-pointer text-muted-foreground group-hover:text-foreground z-10 w-8 h-8 sm:w-10 sm:h-10 transition-colors"
              />
              <div className="flex min-h-[170px] flex-col justify-between rounded-md p-4 sm:p-6 pb-12 sm:pb-6 flex-grow">
                <div className="flex flex-row justify-between items-start gap-2 mb-4 min-w-0">
                  <h3 className="font-bold flex space-x-2 items-center min-w-0 flex-1">
                    <Icons.gitRepoIcon
                      size={18}
                      className="flex-shrink-0 sm:w-5 sm:h-5 text-primary"
                    />
                    <span className="truncate text-sm sm:text-base min-w-0">
                      {contribution.repo}
                    </span>
                  </h3>
                  <Icons.gitBranch
                    size={18}
                    className="flex-shrink-0 sm:w-5 sm:h-5 text-muted-foreground"
                  />
                </div>
                <div className="space-y-3 sm:space-y-4 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 break-words">
                    {contribution.contibutionDescription}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex space-x-2 items-center min-w-0">
                    <Icons.gitOrgBuilding
                      size={14}
                      className="flex-shrink-0 sm:w-4 sm:h-4"
                    />
                    <span className="truncate min-w-0">
                      {contribution.repoOwner}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </Link>
        </AnimatedSection>
      ))}
    </div>
  );
}

