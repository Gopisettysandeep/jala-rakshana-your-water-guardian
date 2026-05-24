import type { LucideIcon } from "lucide-react";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  variant = "hero",
}: {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  variant?: "hero" | "eco";
}) {
  return (
    <header
      className={`relative overflow-hidden rounded-b-[2.5rem] px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-7 text-primary-foreground shadow-glow ${
        variant === "eco" ? "bg-eco" : "bg-hero"
      }`}
    >
      <div className="absolute -top-10 -right-8 size-40 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 -left-6 size-44 rounded-full bg-white/10 blur-2xl" />
      <div className="relative flex items-center gap-4">
        <div className="grid place-items-center size-12 rounded-2xl bg-white/15 backdrop-blur-sm animate-float">
          <Icon className="size-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">{title}</h1>
          {subtitle && <p className="text-sm opacity-90">{subtitle}</p>}
        </div>
      </div>
    </header>
  );
}
