import { Link } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/collections", label: "Collections" },
  { to: "/personnalisation", label: "Personnalisation" },
  { to: "/notre-histoire", label: "Notre Histoire" },
  { to: "/avis", label: "Avis" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center">
        <Logo />
        <nav className="hidden md:flex items-center gap-10">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm text-foreground/80 hover:text-primary transition-colors relative"
              activeProps={{ className: "text-primary" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="rounded-none">
            <Search className="h-4 w-4 text-primary" strokeWidth={1.5} />
          </Button>
          <CartDrawer />
        </div>
      </div>
    </header>
  );
}
