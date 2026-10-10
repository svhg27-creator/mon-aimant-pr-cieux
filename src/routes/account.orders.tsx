import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useOrders } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import { Package, ArrowRight, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/account/orders")({
  component: OrdersPage,
  head: () => ({ meta: [{ title: "Mes commandes — Mémora" }] }),
});

const statusLabels: Record<string, string> = {
  pending: "En attente",
  paid: "Payée",
  in_production: "En fabrication",
  shipped: "Expédiée",
  delivered: "Livrée",
  refunded: "Remboursée",
  partially_refunded: "Remb. partiel",
  cancelled: "Annulée",
};

const statusVariant: Record<string, string> = {
  pending: "bg-amber-100 text-amber-800",
  paid: "bg-green-100 text-green-800",
  in_production: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-emerald-100 text-emerald-800",
  refunded: "bg-gray-100 text-gray-800",
  partially_refunded: "bg-gray-100 text-gray-800",
  cancelled: "bg-red-100 text-red-800",
};

function OrdersPage() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useOrders(user?.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Mes commandes</h1>
        <p className="text-muted-foreground mt-1">Historique et suivi de vos commandes.</p>
      </div>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-0">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" /> Liste des commandes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-20" />)}
            </div>
          ) : !orders?.length ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-40" />
              <p className="mb-4">Vous n’avez pas encore passé de commande.</p>
              <Button asChild className="rounded-none">
                <Link to={"/personnalisation" as any}>Créer un magnet</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-5 first:pt-0"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{order.order_number || `CMD-${order.id.slice(0, 8).toUpperCase()}`}</span>
                      <Badge variant="secondary" className={`rounded-none ${statusVariant[order.status] || "bg-muted"}`}>
                        {statusLabels[order.status] || order.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                    </p>
                    {order.shipping_carrier && (
                      <p className="text-sm text-muted-foreground">
                        Transporteur : {order.shipping_carrier} {order.tracking_number && `· ${order.tracking_number}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <span className="font-display text-lg font-semibold">{formatPrice(order.amount_total, order.currency)}</span>
                    <Button asChild variant="outline" size="sm" className="rounded-none">
                      <Link to={`/account/orders/${order.id}` as any}>
                        Détails <ArrowRight className="h-4 w-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
