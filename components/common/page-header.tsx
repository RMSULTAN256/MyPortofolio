import { Terminal } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description: string;
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col items-start space-y-3 mb-8 sm:mb-10 w-full">
      {/* Cyber Section Badge */}
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider uppercase shadow-sm">
        <Terminal className="w-3.5 h-3.5" />
        <span>SYS // {title}</span>
      </div>

      {/* Main Title */}
      <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
        {title}
      </h1>

      {/* Description */}
      <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl leading-relaxed">
        {description}
      </p>

      {/* Cyber Laser Divider */}
      <div className="w-full h-px bg-gradient-to-r from-cyan-500/40 via-sky-500/20 to-transparent mt-4" />
    </div>
  );
}
