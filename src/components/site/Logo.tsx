import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className="font-display text-xl tracking-tight text-foreground">Mémora</span>
      <span className="text-primary text-sm">•</span>
    </Link>
  );
}
