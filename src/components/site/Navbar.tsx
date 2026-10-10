import { Link } from "@tanstack/react-router";
import { Search, User } from "lucide-react";
import { Logo } from "./Logo";
import { CartDrawer } from "./CartDrawer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const links = [
  { to: "/collections", label: "Collections" },
  { to: "/personnalisation", label: "Personnalisation" },
  { to: "/notre-histoire", label: "Notre Histoire" },
  { to: "/avis", label: "Avis" },
];

export function Navbar() {
  const { user, loading } = useAuth();
  const displayName = user?.email?.split("@")[0] || "Compte";
  const initials = displayName.slice(0, 2).toUpperCase();

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
          {!loading && (
            user ? (
              <Button asChild variant="ghost" size="sm" className="rounded-none gap-2 ml-1">
                <Link to={"/account/dashboard" as any}>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="" alt={displayName} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">{initials}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-sm">{displayName}</span>
                </Link>
              </Button>
            ) : (
              <Button asChild variant="ghost" size="sm" className="rounded-none ml-1">
                <Link to={"/auth" as any}>
                  <User className="h-4 w-4 mr-2" /> Connexion
                </Link>
              </Button>
            )
          )}
        </div>
      </div>
    </header>
  );
}
