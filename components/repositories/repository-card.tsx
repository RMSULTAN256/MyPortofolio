import Link from "next/link";

import { AnimatedSection } from "@/components/common/animated-section";
import { Icons } from "@/components/common/icons";
import { cn } from "@/lib/utils";

export interface GithubRepository {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  language: string | null;
  fork: boolean;
  updated_at: string;
  owner: {
    login: string;
  };
}

interface RepositoryCardProps {
  repositories: GithubRepository[];
}

export default function RepositoryCard({
  repositories,
}: RepositoryCardProps) {
  return (
    <div
      className={cn(
        "w-full gap-4 items-stretch",
        repositories.length === 1
          ? "flex justify-center max-w-lg mx-auto"
          : repositories.length === 2
            ? "grid grid-cols-1 sm:grid-cols-2 max-w-3xl mx-auto"
            : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mx-auto"
      )}
    >
      {repositories.map((repo, id) => (
        <AnimatedSection
          key={repo.id}
          delay={0.1 * (id + 1)}
          direction="up"
          className="h-full w-full"
        >
          <Link
            href={repo.html_url}
            target="_blank"
            className="w-full min-w-0 h-full block group"
          >
            <div className="relative rounded-xl border border-border/70 bg-card/40 backdrop-blur-md p-2 hover:border-cyan-500/50 hover:shadow-[0_0_24px_rgba(0,240,255,0.08)] transition-all duration-300 w-full h-full flex flex-col">
              <div className="flex min-h-[170px] flex-col justify-between rounded-md p-4 sm:p-6 flex-grow">
                <div className="flex flex-row justify-between items-start gap-2 mb-4 min-w-0">
                  <h3 className="font-bold flex space-x-2 items-center min-w-0 flex-1">
                    <Icons.gitRepoIcon
                      size={18}
                      className="flex-shrink-0 sm:w-5 sm:h-5 text-primary"
                    />
                    <span className="truncate text-sm sm:text-base min-w-0">
                      {repo.name}
                    </span>
                  </h3>
                  {repo.stargazers_count > 0 && (
                    <div className="flex items-center space-x-1 text-muted-foreground text-sm">
                      <Icons.star size={16} className="text-yellow-500" />
                      <span>{repo.stargazers_count}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3 sm:space-y-4 min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3 break-words">
                    {repo.description || "No description provided."}
                  </p>
                  <div className="flex justify-between items-center text-xs sm:text-sm text-muted-foreground min-w-0">
                    <p className="flex space-x-2 items-center min-w-0">
                      <Icons.gitOrgBuilding
                        size={14}
                        className="flex-shrink-0 sm:w-4 sm:h-4"
                      />
                      <span className="truncate min-w-0">
                        {repo.owner.login}
                      </span>
                    </p>
                    <div className="flex items-center space-x-3">
                      {repo.language && (
                        <span className="truncate min-w-0 font-medium">
                          {repo.language}
                        </span>
                      )}
                      <Icons.externalLink
                        size={18}
                        className="flex-shrink-0 text-muted-foreground group-hover:text-cyan-400 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </AnimatedSection>
      ))}
    </div>
  );
}
