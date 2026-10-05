import { Metadata } from "next";
import Link from "next/link";

import { CyberShieldCanvas } from "@/components/shield/cyber-shield-canvas";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/common/icons";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "3D SIEM Architecture & SOC Defense | Sultan Arif",
  description:
    "Interactive 3D SIEM (Security Information & Event Management) telemetry visualization with live server log scanning, threat actor IP tracking, MITRE ATT&CK correlation, and automated SOAR response.",
  alternates: {
    canonical: `${siteConfig.url}/shield`,
  },
};

export default function CyberShieldPage() {
  return (
    <div className="container relative py-6 md:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "ghost", size: "sm" }),
                "h-8 px-2 text-muted-foreground hover:text-foreground"
              )}
            >
              <Icons.chevronLeft className="w-4 h-4 mr-1" /> Back to Home
            </Link>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl md:text-4xl text-foreground">
            SIEM & SOC 3D Architecture
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Simulasi interaktif pipeline SIEM end-to-end: pemantauan log server, pelacakan IP penyerang & aktivitas MITRE ATT&CK, parser normalisasi, aturan korelasi Sigma, hingga playbook aksi otomatis SOAR.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/contact"
            className={cn(buttonVariants({ size: "sm" }), "rounded-full")}
          >
            Connect With Me
          </Link>
        </div>
      </div>

      {/* Main 3D Canvas */}
      <CyberShieldCanvas mode="fullscreen" />
    </div>
  );
}
