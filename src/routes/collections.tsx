import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/site/ProductCard";
import { FamilyChips, FAMILIES } from "@/components/site/FamilyChips";

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
  const [active, setActive] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["products", "all"],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCTS_QUERY, { first: 100, query: null });
      return (res?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
  });

  const filtered = useMemo(() => {
    if (!data) return [];
    const fam = FAMILIES.find((f) => f.id === active);
    if (!fam || fam.tags.length === 0) return data;
    return data.filter((p) => {
      const hay = `${p.node.title} ${p.node.description} ${p.node.handle}`.toLowerCase();
      return fam.tags.some((t) => hay.includes(t.toLowerCase()));
    });
  }, [data, active]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="eyebrow">Catalogue</p>
        <h1 className="font-display text-5xl mt-3">Toutes nos collections</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Magnets photo, prénoms, naissance, mariage et duo — pour chaque souvenir, son écrin.
        </p>
      </div>

      {/* Family chips */}
      <div className="mb-12 -mx-6 px-6 overflow-x-auto">
        <div className="flex gap-2 min-w-max pb-2">
          {FAMILIES.map((f) => {
            const Icon = f.icon;
            const isActive = active === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setActive(f.id)}
                className={cn(
                  "inline-flex items-center gap-2 px-4 h-10 border text-sm whitespace-nowrap transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-foreground/80 border-border hover:border-primary/50 hover:text-primary",
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed">
          <h3 className="font-display text-2xl">Aucun produit dans cette famille</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Sélectionnez une autre catégorie ou demandez-moi de créer ces produits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
