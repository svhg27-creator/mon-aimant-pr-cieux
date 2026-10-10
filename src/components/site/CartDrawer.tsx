import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/commerce";
import { supabase } from "@/integrations/supabase/client";
import { PaymentMethods } from "@/components/site/PaymentMethods";

export function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const navigate = useNavigate();
  const { items, isLoading, updateQuantity, removeItem } = useCartStore();
  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode || "EUR";

  const handleCheckout = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Connexion requise", {
        description: "Connectez-vous pour finaliser votre commande.",
      });
      setIsOpen(false);
      navigate({ to: "/auth" });
      return;
    }
    if (items.length > 25) {
      toast.error("Trop d'articles différents", {
        description: "Maximum 25 visuels différents par commande. Contactez-nous pour les grosses commandes.",
      });
      return;
    }
    const overQty = items.find((i) => i.quantity > 20);
    if (overQty) {
      toast.error("Quantité trop élevée", {
        description: `Maximum 20 exemplaires par article (« ${overQty.product.node.title} »). Contactez-nous pour les grosses commandes.`,
      });
      return;
    }

    setCheckoutLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          items: items.map((i) => ({
            product_id: i.product_id ?? i.product.node.handle,
            quantity: i.quantity,
          })),
          success_url: `${window.location.origin}/account/orders`,
          cancel_url: `${window.location.origin}/collections`,
        },
      });
      if (error) throw error;
      const checkoutUrl = data?.checkout_url;
      if (!checkoutUrl) throw new Error(data?.error || "Lien de paiement indisponible");
      window.location.href = checkoutUrl;
    } catch (e) {
      console.error("Checkout failed", e);
      toast.error("Paiement indisponible", {
        description: "Impossible de créer la session de paiement. Réessayez dans un instant.",
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-none">
          <ShoppingBag className="h-5 w-5 text-primary" strokeWidth={1.5} />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full px-1 text-[10px] bg-primary text-primary-foreground">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md flex flex-col bg-background">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="font-display text-2xl">Votre panier</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Aucun article pour le moment." : `${totalItems} article${totalItems > 1 ? "s" : ""}`}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col flex-1 min-h-0 pt-4">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center">
              <div>
                <ShoppingBag className="h-10 w-10 text-muted-foreground mx-auto mb-3" strokeWidth={1} />
                <p className="text-sm text-muted-foreground">Votre panier est vide.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-1">
                <div className="space-y-5">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 pb-5 border-b border-border">
                      <div className="w-20 h-20 bg-muted overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img
                            src={item.product.node.images.edges[0].node.url}
                            alt={item.product.node.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-base leading-tight">{item.product.node.title}</h4>
                        {item.selectedOptions.length > 0 && item.variantTitle !== "Default Title" && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.selectedOptions.map((o) => o.value).join(" • ")}
                          </p>
                        )}
                        <p className="text-sm font-medium mt-1">
                          {formatPrice(item.price.amount, item.price.currencyCode)}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border">
                            <button
                              className="h-7 w-7 grid place-items-center hover:bg-muted"
                              onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-7 text-center text-xs">{item.quantity}</span>
                            <button
                              className="h-7 w-7 grid place-items-center hover:bg-muted"
                              onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.variantId)}
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-4 bg-background">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm uppercase tracking-wider text-muted-foreground">Sous-total</span>
                  <span className="font-display text-xl">{formatPrice(totalPrice, currency)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Livraison et taxes calculées au paiement.</p>
                <PaymentMethods compact />
                <Button
                  onClick={handleCheckout}
                  className="w-full rounded-none h-12 bg-primary hover:bg-primary/90"
                  disabled={items.length === 0 || isLoading || checkoutLoading}
                >
                  {isLoading || checkoutLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Procéder au paiement <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
