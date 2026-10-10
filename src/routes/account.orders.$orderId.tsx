import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { useOrder } from "@/hooks/useOrders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, Package, Truck, CreditCard, FileText, RotateCcw, MapPin } from "lucide-react";

export const Route = createFileRoute("/account/orders/$orderId")({
  component: OrderDetailPage,
  head: ({ params }) => ({ meta: [{ title: `Commande — Mémora` }] }),
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

const timeline = [
  { status: "pending", label: "Commande reçue" },
  { status: "paid", label: "Paiement validé" },
  { status: "in_production", label: "En fabrication" },
  { status: "shipped", label: "Expédiée" },
  { status: "delivered", label: "Livrée" },
];

function OrderDetailPage() {
  const { orderId } = Route.useParams() as any;
  const { user } = useAuth();
  const { data, isLoading } = useOrder(user?.id, orderId);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p>Commande introuvable.</p>
        <Button asChild variant="outline" className="mt-4 rounded-none">
          <Link to={"/account/orders" as any}><ArrowLeft className="h-4 w-4 mr-2" /> Retour aux commandes</Link>
        </Button>
      </div>
    );
  }

  const { order, items, payments } = data;
  const currentStatusIndex = timeline.findIndex((s) => s.status === order.status);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button asChild variant="ghost" size="sm" className="rounded-none -ml-3 mb-2">
            <Link to={"/account/orders" as any}><ArrowLeft className="h-4 w-4 mr-2" /> Retour</Link>
          </Button>
          <h1 className="font-display text-3xl">
            Commande {order.order_number || order.id.slice(0, 8).toUpperCase()}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Passée le {new Date(order.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}
          </p>
        </div>
        <Badge variant="secondary" className="rounded-none w-fit">
          {statusLabels[order.status] || order.status}
        </Badge>
      </div>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" /> Suivi de la commande
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />
            <div className="space-y-6">
              {timeline.map((step, index) => {
                const done = index <= currentStatusIndex;
                return (
                  <div key={step.status} className="relative pl-12">
                    <div
                      className={`absolute left-2 top-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center ${
                        done ? "bg-primary border-primary" : "bg-background border-border"
                      }`}
                    >
                      {done && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                    </div>
                    <p className={done ? "font-medium" : "text-muted-foreground"}>{step.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
          {order.tracking_number && (
            <div className="mt-6 p-4 bg-muted text-sm">
              <span className="font-medium">Numéro de suivi :</span> {order.tracking_number} ({order.shipping_carrier})
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-none border shadow-none">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Articles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-start gap-4 p-4 border">
                <div className="bg-muted h-16 w-16 flex items-center justify-center text-muted-foreground text-xs text-center">
                  {item.product_image_url ? <img src={item.product_image_url} alt={item.product_name} className="h-full w-full object-cover" /> : "Image"}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="font-medium">{item.product_name}</p>
                  <p className="text-sm text-muted-foreground">Qté : {item.quantity}</p>
                  {item.customization && (
                    <p className="text-xs text-muted-foreground">
                      {JSON.stringify(item.customization)}
                    </p>
                  )}
                </div>
                <p className="font-semibold">{formatPrice(item.unit_price * item.quantity)}</p>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatPrice(order.amount_total)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(order.amount_total, order.currency)}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-none border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" /> Adresse de livraison
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              {order.shipping_address ? (
                <>
                  {order.customer_name && <p className="font-medium">{order.customer_name}</p>}
                  <p>{order.shipping_address.line1}</p>
                  {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                  <p>
                    {order.shipping_address.postal_code} {order.shipping_address.city}
                  </p>
                  <p className="text-muted-foreground">{order.shipping_address.country}</p>
                </>
              ) : (
                <p className="text-muted-foreground">Aucune adresse enregistrée.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" /> Paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {payments.length ? (
                payments.map((p) => (
                  <div key={p.id} className="flex justify-between">
                    <span className="text-muted-foreground capitalize">{p.status}</span>
                    <span>{formatPrice(p.amount, p.currency)}</span>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">Aucun paiement enregistré.</p>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-none border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Facture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">Votre facture sera disponible une fois la commande expédiée.</p>
              <Button variant="outline" size="sm" className="rounded-none w-full" disabled>
                Télécharger la facture
              </Button>
            </CardContent>
          </Card>

          <Card className="rounded-none border shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="font-display text-lg">Besoin d’aide ?</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm" className="rounded-none w-full">
                <Link to={"/account/support" as any}>
                  <RotateCcw className="h-4 w-4 mr-2" /> Contacter le SAV
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
