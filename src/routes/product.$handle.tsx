import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Truck, Factory, ArrowLeft } from "lucide-react";
import { formatPrice } from "@/lib/commerce";
import { getLocalProduct, PRODUCT_CTAS } from "@/data/produits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

export const Route = createFileRoute("/product/$handle")({ component: ProductPage });

function ProductPage() {
  const { handle } = Route.useParams();
  const data = getLocalProduct(handle)?.node;

  const addItem = useCartStore((s) => s.addItem);
  const cartLoading = useCartStore((s) => s.isLoading);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!data)
    return (
      <div className="max-w-3xl mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl">Produit introuvable</h1>
        <Link to="/collections" className="text-primary mt-4 inline-block">← Retour aux collections</Link>
      </div>
    );

  const product = data;
  const variant = product.variants.edges[0]?.node;
  const image = product.images.edges[activeImage]?.node;
  const cta = PRODUCT_CTAS[product.handle];

  const handleAdd = async () => {
    if (!variant) return;
    await addItem({
      product: { node: product },
      product_id: product.handle,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Ajouté au panier", { description: `${product.title} — ${quantity} exemplaire(s)` });
  };

  const updateQuantity = (value: string) => {
    const n = Number(value);
    if (Number.isNaN(n)) return;
    setQuantity(Math.max(1, Math.min(100, n)));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <Link to="/collections" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="h-4 w-4" /> Retour
      </Link>

      <div className="grid lg:grid-cols-2 gap-12">
        <div>
          <div className="aspect-square bg-muted overflow-hidden">
            {image && (
              <img src={image.url} alt={image.altText || product.title} className="w-full h-full object-cover" />
            )}
          </div>
          {product.images.edges.length > 1 && (
            <div className="grid grid-cols-5 gap-2 mt-3">
              {product.images.edges.map((img: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`aspect-square overflow-hidden border-2 ${activeImage === i ? "border-primary" : "border-transparent"}`}
                >
                  <img src={img.node.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:py-6">
          <p className="eyebrow">Mémora</p>
          <h1 className="font-display text-4xl md:text-5xl mt-3 leading-tight">{product.title}</h1>
          <p className="text-primary text-xl mt-4 font-medium">
            À partir de {formatPrice(product.priceRange.minVariantPrice.amount, product.priceRange.minVariantPrice.currencyCode)}
          </p>

          <div className="border-t border-border my-6" />

          {product.description && (
            <p className="italic text-foreground/85 leading-relaxed">"{product.description}"</p>
          )}

          <div className="border-t border-border my-6" />

          {cta ? (
            <Button asChild className="w-full h-14 rounded-none bg-primary hover:bg-primary/90 text-base">
              <Link to={cta.to}>{cta.label} →</Link>
            </Button>
          ) : (
            <div className="flex gap-3">
              <Input
                type="number"
                min={1}
                max={100}
                value={quantity}
                onChange={(e) => updateQuantity(e.target.value)}
                className="w-24 h-14 text-center rounded-none text-base"
              />
              <Button
                onClick={handleAdd}
                disabled={cartLoading || !variant?.availableForSale}
                className="flex-1 h-14 rounded-none bg-primary hover:bg-primary/90 text-base"
              >
                {cartLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Ajouter au panier →"}
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-6 mt-6 text-sm text-foreground/75">
            <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" strokeWidth={1.5} /> Livraison 48h-72h</div>
            <div className="flex items-center gap-2"><Factory className="h-4 w-4 text-primary" strokeWidth={1.5} /> Fabrication française</div>
          </div>
        </div>
      </div>
    </div>
  );
}
