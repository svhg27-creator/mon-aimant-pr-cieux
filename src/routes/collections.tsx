import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/collections")({
  component: CollectionsPage,
  head: () => ({
    meta: [
      { title: "Collections — Mémora" },
      { name: "description", content: "Découvrez toutes nos collections de magnets photo personnalisés premium." },
    ],
  }),
});

function CollectionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCTS_QUERY, { first: 50, query: null });
      return (res?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-14">
        <p className="eyebrow">Catalogue</p>
        <h1 className="font-display text-5xl mt-3">Toutes nos collections</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Magnets photo, prénoms, naissance, mariage et duo — pour chaque souvenir, son écrin.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse" />
          ))}
        </div>
      ) : !data || data.length === 0 ? (
        <div className="text-center py-16 border border-dashed">
          <h3 className="font-display text-2xl">No products found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Demandez-moi dans le chat de créer vos premiers produits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {data.map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
