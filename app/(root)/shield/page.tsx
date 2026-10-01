import { Metadata } from "next";
import Link from "next/link";

import { CyberShieldCanvas } from "@/components/shield/cyber-shield-canvas";
import { buttonVariants } from "@/components/ui/button";
import { Icons } from "@/components/common/icons";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "3D Cyber Security Shield | Sultan Arif",
  description:
    "Interactive 3D Cyber Security Shield built with Three.js, procedural hexagonal armor plates, circuit traces, Tron grid floor, and interactive diagnostic nodes.",
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
            Cyber Security Shield 3D
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Procedural 3D hexagonal shield model, live circuit traces, Tron grid floor, and interactive network nodes.
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
