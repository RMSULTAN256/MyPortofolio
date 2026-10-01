import { MainNav } from "@/components/common/main-nav";
import { SiteFooter } from "@/components/common/site-footer";
import { routesConfig } from "@/config/routes";

interface MarketingLayoutProps {
  children: React.ReactNode;
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Floating Cyber Pill HUD Header */}
      <header className="fixed top-3 sm:top-4 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
        <MainNav items={routesConfig.mainNav} />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full pt-20 sm:pt-24">{children}</main>

      <SiteFooter />
    </div>
  );
}
