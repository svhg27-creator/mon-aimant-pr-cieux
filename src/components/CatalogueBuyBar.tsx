import { useState } from "react";
import { Minus, Plus, ShoppingCart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/cartStore";
import type { CatalogueProduct } from "@/lib/commerce";

function generateId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

interface CatalogueBuyBarProps {
  /** Clé unique du visuel — sert à fusionner les quantités dans le panier */
  variantKey: string;
  /** Nom affiché dans le panier, ex. « Chartreux » ou « France » */
  title: string;
  imageUrl: string;
  /** Libellé de la forme du magnet, ex. « Carré 37×37 mm » */
  shapeLabel: string;
  unitPrice: number;
}

export function CatalogueBuyBar({
  variantKey,
  title,
  imageUrl,
  shapeLabel,
  unitPrice,
}: CatalogueBuyBarProps) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const addLocalItem = useCartStore((s) => s.addLocalItem);

  const handleAdd = () => {
    const amount = unitPrice.toFixed(2);
    const product: CatalogueProduct = {
      node: {
        id: generateId(),
        title: `Magnet ${title}`,
        description: "Magnet personnalisé Mémora",
        handle: variantKey,
        priceRange: { minVariantPrice: { amount, currencyCode: "EUR" } },
        images: { edges: [{ node: { url: imageUrl, altText: title } }] },
        variants: {
          edges: [
            {
              node: {
                id: variantKey,
                title,
                price: { amount, currencyCode: "EUR" },
                availableForSale: true,
                selectedOptions: [],
              },
            },
          ],
        },
        options: [],
      },
    };

    setAdding(true);
    addLocalItem({
      product,
      product_id: variantKey,
      variantId: variantKey,
      variantTitle: title,
      price: { amount, currencyCode: "EUR" },
      quantity,
      selectedOptions: [
        { name: "Visuel", value: title },
        { name: "Forme", value: shapeLabel },
      ],
    });
    setAdding(false);
    toast.success("Ajouté au panier", { description: `${title} × ${quantity}` });
  };

  return (
    <div className="mt-2 flex items-center justify-center gap-2">
      <div className="flex items-center border border-border">
        <button
          type="button"
          aria-label="Diminuer la quantité"
          className="h-8 w-8 grid place-items-center hover:bg-muted"
          onClick={() => setQuantity((v) => Math.max(1, v - 1))}
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-8 text-center text-xs tabular-nums">{quantity}</span>
        <button
          type="button"
          aria-label="Augmenter la quantité"
          className="h-8 w-8 grid place-items-center hover:bg-muted"
          onClick={() => setQuantity((v) => Math.min(20, v + 1))}
        >
          <Plus className="h-3 w-3" />
        </button>
      </div>
      <button
        type="button"
        aria-label={`Ajouter ${title} au panier`}
        title="Ajouter au panier"
        onClick={handleAdd}
        disabled={adding}
        className="h-8 w-8 grid place-items-center border border-border text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        {adding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
        )}
      </button>
    </div>
  );
}
