import { Metadata } from "next";

import PageContainer from "@/components/common/page-container";
import RepositoryCard, { GithubRepository } from "@/components/repositories/repository-card";
import { pagesConfig } from "@/config/pages";

export const metadata: Metadata = {
  title: pagesConfig.repositories.metadata.title,
  description: pagesConfig.repositories.metadata.description,
};

async function getRepositories(): Promise<GithubRepository[]> {
  try {
    const res = await fetch(
      "https://api.github.com/users/RMSULTAN256/repos?sort=updated&per_page=100",
      {
        headers: process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {},
        next: { revalidate: 3600 }
      }
    );
    
    if (!res.ok) {
      console.error("Failed to fetch repositories from GitHub:", res.statusText);
      return [];
    }

    const repos: GithubRepository[] = await res.json();
    
    // Filter out forks and return
    return repos.filter((repo) => !repo.fork);
  } catch (error) {
    console.error("Error fetching repositories:", error);
    return [];
  }
}

export default async function RepositoriesPage() {
  const repositories = await getRepositories();

  return (
    <PageContainer
      title={pagesConfig.repositories.title}
      description={pagesConfig.repositories.description}
    >
      {repositories.length > 0 ? (
        <RepositoryCard repositories={repositories} />
      ) : (
        <div className="text-center text-muted-foreground mt-10">
          <p>Repositories are currently unavailable.</p>
        </div>
      )}
    </PageContainer>
  );
}
