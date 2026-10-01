import { Metadata } from "next";

import PageContainer from "@/components/common/page-container";
import { ProjectsView } from "@/components/projects/projects-view";
import { pagesConfig } from "@/config/pages";

export const metadata: Metadata = {
  title: pagesConfig.projects.metadata.title,
  description: pagesConfig.projects.metadata.description,
};

export default function ProjectsPage() {
  return (
    <PageContainer
      title={pagesConfig.projects.title}
      description={pagesConfig.projects.description}
    >
      <ProjectsView />
    </PageContainer>
  );
}
