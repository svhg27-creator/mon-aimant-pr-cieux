import { Link } from "@tanstack/react-router";
import { formatPrice, type ShopifyProduct } from "@/lib/shopify";

export function ProductCard({ product }: { product: ShopifyProduct }) {
  const p = product.node;
  const image = p.images.edges[0]?.node;
  const price = p.priceRange.minVariantPrice;

  return (
    <Link
      to="/product/$handle"
      params={{ handle: p.handle }}
      className="group block"
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
  );
}
