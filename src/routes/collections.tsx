import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { PawPrint, ArrowRight, Sparkles, Globe } from "lucide-react";
import { storefrontApiRequest, PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { ProductCard } from "@/components/site/ProductCard";
import { FamilyChips, FAMILIES } from "@/components/site/FamilyChips";

const familyIds = FAMILIES.map((f) => f.id) as [string, ...string[]];
const searchSchema = z.object({
  famille: fallback(z.enum(familyIds), "all").default("all"),
});

export const Route = createFileRoute("/collections")({
  validateSearch: zodValidator(searchSchema),
  component: CollectionsPage,
  head: () => ({
    meta: [
      { title: "Collections — Mémora" },
      { name: "description", content: "Découvrez toutes nos collections de magnets photo personnalisés premium." },
    ],
  }),
});

function CollectionsPage() {
  const { famille: active } = Route.useSearch();
  const navigate = useNavigate({ from: "/collections" });
  const setActive = (id: string) => navigate({ search: { famille: id } });


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
      <div className="mb-8">
        <FamilyChips active={active} onSelect={setActive} />
      </div>

      {/* Sous-catégories Animaux */}
      {active === "animaux" && (
        <div className="mb-12 flex flex-wrap gap-3">
          {[
            { to: "/catalogue/animaux/chats", label: "Chats" },
            { to: "/catalogue/animaux/chiens", label: "Chiens" },
            { to: "/catalogue/animaux/rongeurs", label: "Rongeurs" },
            { to: "/catalogue/animaux/oiseaux", label: "Oiseaux" },
            { to: "/catalogue/animaux/poissons", label: "Poissons" },
            { to: "/catalogue/animaux/reptiles", label: "Reptiles" },
          ].map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="group inline-flex items-center gap-2 px-4 h-11 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-sm"
            >
              <PawPrint className="h-4 w-4" strokeWidth={1.5} />
              Catalogue {s.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}

      {/* Sous-catégories Fête des prénoms */}
      {active === "prenoms" && (
        <div className="mb-12 flex flex-wrap gap-3">
          <Link
            to="/catalogue/prenoms/filles"
            className="group inline-flex items-center gap-2 px-4 h-11 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-sm"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Voir le catalogue Prénoms Filles (30 prénoms)
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link
            to="/catalogue/prenoms/garcons"
            className="group inline-flex items-center gap-2 px-4 h-11 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-sm"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Voir le catalogue Prénoms Garçons (30 prénoms)
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

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
