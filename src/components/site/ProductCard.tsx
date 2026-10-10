import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatPrice, type CatalogueProduct } from "@/lib/commerce";
import { PRODUCT_CTAS } from "@/data/produits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cartStore";

export function ProductCard({ product }: { product: CatalogueProduct }) {
  const p = product.node;
  const image = p.images.edges[0]?.node;
  const price = p.priceRange.minVariantPrice;
  const variant = p.variants.edges[0]?.node;
  const cta = PRODUCT_CTAS[p.handle];
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);

  const updateQuantity = (value: string) => {
    const n = Number(value);
    if (Number.isNaN(n)) return;
    setQuantity(Math.max(1, Math.min(100, n)));
  };

  const handleAdd = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variant) return;
    await addItem({
      product,
      product_id: p.handle,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    });
  };

  return (
    <div className="group flex flex-col">
      <Link
        to="/product/$handle"
        params={{ handle: p.handle }}
        className="block"
      >
        <div className="aspect-square overflow-hidden bg-muted">
          {image ? (
            <img
              src={image.url}
              alt={image.altText || p.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-muted-foreground text-xs">
              Sans image
            </div>
          )}
        </div>
        <div className="pt-4">
          <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
            {p.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
            {p.description || "Magnet personnalisé premium"}
          </p>
          <p className="text-sm text-primary mt-2 font-medium">
            À partir de {formatPrice(price.amount, price.currencyCode)}
          </p>
        </div>
      </Link>
      <div className="mt-3 flex gap-2">
        {cta ? (
          <Button asChild className="flex-1 h-10 rounded-none bg-primary hover:bg-primary/90 text-sm">
            <Link to={cta.to}>{cta.label} →</Link>
          </Button>
        ) : (
          <>
            <Input
              type="number"
              min={1}
              max={100}
              value={quantity}
              onChange={(e) => updateQuantity(e.target.value)}
              onClick={(e) => e.preventDefault()}
              className="w-20 h-10 text-center rounded-none text-sm"
            />
            <Button
              onClick={handleAdd}
              disabled={cartLoading || !variant?.availableForSale}
              className="flex-1 h-10 rounded-none bg-primary hover:bg-primary/90 text-sm"
            >
              {cartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter"}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
