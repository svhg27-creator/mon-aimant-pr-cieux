import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  Package, MapPin, Heart, Palette, CreditCard, Gift,
  Bell, LifeBuoy, ArrowRight, Sparkles, Truck,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account/dashboard")({
  component: DashboardPage,
  head: () => ({ meta: [{ title: "Tableau de bord — Mémora" }] }),
});

const statusLabels: Record<string, string> = {
  pending: "En attente de paiement",
  paid: "Paiement validé",
  in_production: "En fabrication",
  shipped: "Expédiée",
  delivered: "Livrée",
  refunded: "Remboursée",
  partially_refunded: "Remb. partiel",
  cancelled: "Annulée",
};

function DashboardPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: orders, isLoading: ordersLoading } = useOrders(userId);

  const { data: notificationsCount = 0 } = useQuery({
    queryKey: ["notifications-count", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { count, error } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId!)
        .eq("read", false);
      if (error) throw error;
      return count ?? 0;
    },
  });

  const displayName = profile?.first_name || user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Client";
  const initials = displayName.slice(0, 2).toUpperCase();

  const orderCount = orders?.length ?? 0;
  const totalSpent = orders?.reduce((sum, o) => (o.status === "paid" || o.status === "delivered" || o.status === "shipped" ? sum + o.amount_total : sum), 0) ?? 0;
  const lastOrder = orders?.[0];

  const isLoading = profileLoading || ordersLoading;

  const copyReferral = async () => {
    await navigator.clipboard.writeText("mon-lien-parrainage");
    toast.info("Lien copié (feature à finaliser)");
  };

  return (
    <div className="space-y-8">
      <section className="bg-gradient-to-br from-primary/10 to-transparent border p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <Avatar className="h-20 w-20 border-4 border-background">
            <AvatarImage src={profile?.avatar_url ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-display">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="eyebrow">Espace client</p>
            <h1 className="font-display text-3xl md:text-4xl mt-2">
              Bonjour, {displayName}
            </h1>
            <p className="text-muted-foreground mt-1">
              Voici un récapitulif de votre activité Mémora.
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-none">
            <Link to={"/personnalisation" as any}>
              <Sparkles className="h-4 w-4 mr-2" /> Nouvelle commande
            </Link>
          </Button>
        </div>
      </section>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={Package} label="Commandes" value={orderCount.toString()} />
          <StatCard icon={CreditCard} label="Total dépensé" value={formatPrice(totalSpent)} />
          <StatCard icon={Gift} label="Points fidélité" value="0" />
          <StatCard icon={Bell} label="Notifications" value={notificationsCount.toString()} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-none border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl">Dernière commande</CardTitle>
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-24" />
            ) : lastOrder ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{lastOrder.order_number || lastOrder.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">{new Date(lastOrder.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                  <span className="text-lg font-semibold">{formatPrice(lastOrder.amount_total, lastOrder.currency)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary/10 text-primary">
                    <Truck className="h-3.5 w-3.5" />
                    {statusLabels[lastOrder.status] || lastOrder.status}
                  </span>
                  {lastOrder.tracking_number && (
                    <span className="text-muted-foreground">Suivi : {lastOrder.tracking_number}</span>
                  )}
                </div>
                <Button asChild variant="outline" size="sm" className="rounded-none">
                  <Link to={`/account/orders/${lastOrder.id}` as any}>
                    Voir le détail <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Aucune commande pour le moment.</p>
                <Button asChild variant="outline" className="mt-4 rounded-none">
                  <Link to={"/personnalisation" as any}>Créer mon premier magnet</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl">Accès rapides</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <QuickLink to="/account/orders" icon={Package} label="Mes commandes" />
            <QuickLink to="/account/addresses" icon={MapPin} label="Mes adresses" />
            <QuickLink to="/account/creations" icon={Palette} label="Mes créations" />
            <QuickLink to="/account/favorites" icon={Heart} label="Mes favoris" />
            <QuickLink to="/account/loyalty" icon={Gift} label="Fidélité" />
            <QuickLink to="/account/support" icon={LifeBuoy} label="Support" />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl">Parrainage</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Invitez vos proches et gagnez des crédits sur vos prochaines commandes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="rounded-none" onClick={copyReferral}>
              Copier mon lien de parrainage
            </Button>
            <Button asChild className="rounded-none">
              <Link to={"/account/loyalty" as any}>Voir mes récompenses</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <Card className="rounded-none border shadow-none">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-display font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickLink({ to, icon: Icon, label }: { to: string; icon: any; label: string }) {
  return (
    <Link
      to={to as any}
      className="flex items-center justify-between p-3 -mx-2 rounded-sm hover:bg-accent transition-colors"
    >
      <span className="flex items-center gap-3 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" /> {label}
      </span>
      <ArrowRight className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
}
