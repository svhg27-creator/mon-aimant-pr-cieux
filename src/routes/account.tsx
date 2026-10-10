import { useEffect, useState } from "react";
import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import {
  LayoutDashboard, Package, MapPin, Heart, Palette, Gift,
  Settings, LogOut, Menu, LifeBuoy, User,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account")({
  component: AccountLayout,
  head: () => ({ meta: [{ title: "Mon compte — Mémora" }] }),
});

const navItems = [
  { to: "/account/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
  { to: "/account/profile", icon: User, label: "Mon profil" },
  { to: "/account/orders", icon: Package, label: "Mes commandes" },
  { to: "/account/addresses", icon: MapPin, label: "Mes adresses" },
  { to: "/account/creations", icon: Palette, label: "Mes créations" },
  { to: "/account/favorites", icon: Heart, label: "Mes favoris" },
  { to: "/account/loyalty", icon: Gift, label: "Fidélité & parrainage" },
  { to: "/account/support", icon: LifeBuoy, label: "Support" },
  { to: "/account/settings", icon: Settings, label: "Paramètres" },
];

function AccountLayout() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate({ to: "/auth" as any });
    }
  }, [loading, user, navigate]);

  if (loading || !user) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-24">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full mt-8" />
      </div>
    );
  }

  const displayName = user.user_metadata?.first_name || user.email?.split("@")[0] || "Client";
  const initials = displayName.slice(0, 2).toUpperCase();
  const pathname = location.pathname;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Déconnecté");
    navigate({ to: "/auth" as any });
  };

  const NavList = ({ onClick }: { onClick?: () => void }) => (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const active = pathname === item.to || pathname.startsWith(item.to + "/");
        return (
          <Link
            key={item.to}
            to={item.to as any}
            onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between bg-card border p-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src="" alt={displayName} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium leading-none">{displayName}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 flex flex-col">
                <div className="p-6 border-b">
                  <p className="eyebrow mb-2">Mon compte</p>
                  <p className="text-lg font-display">Menu</p>
                </div>
                <div className="p-4 flex-1 overflow-auto">
                  <NavList onClick={() => setOpen(false)} />
                </div>
                <div className="p-4 border-t">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Desktop sidebar */}
          <aside className="hidden md:block w-64 shrink-0">
            <div className="sticky top-24 bg-card border p-6">
              <div className="flex items-center gap-3 mb-8">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" alt={displayName} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-medium truncate">{displayName}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </div>
              <NavList />
              <div className="mt-8 pt-6 border-t">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                </Button>
              </div>
            </div>
          </aside>

          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
