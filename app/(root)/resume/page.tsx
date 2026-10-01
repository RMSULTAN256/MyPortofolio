"use client";

import Link from "next/link";
import { useEffect } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ResumePage() {
  const resumeLink = process.env.NEXT_PUBLIC_RESUME_LINK;

  useEffect(() => {
    if (resumeLink) {
      window.location.replace(resumeLink);
    }
  }, [resumeLink]);

  if (resumeLink) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground text-sm">
        Redirecting to resume...
      </div>
    );
  }

  return (
    <div className="container flex min-h-[60vh] max-w-lg flex-col items-center justify-center text-center gap-4 py-20">
      <h1 className="font-heading text-2xl sm:text-3xl">Resume</h1>
      <p className="text-muted-foreground text-sm">
        Resume document will be available here soon. In the meantime, feel free to reach out via Contact or LinkedIn.
      </p>
      <div className="flex gap-3 mt-4">
        <Link href="/contact" className={cn(buttonVariants({ size: "sm" }))}>
          Contact Me
        </Link>
        <Link
          href="https://linkedin.com/in/rmsultan"
          target="_blank"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
        >
          LinkedIn Profile
        </Link>
      </div>
    </div>
  );
}
