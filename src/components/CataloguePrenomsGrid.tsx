import { usePrenoms } from "@/hooks/usePrenoms";
import { Sparkles } from "lucide-react";

interface CataloguePrenomsGridProps {
  genre: "fille" | "garcon" | "mixte";
  search?: string;
}

export function CataloguePrenomsGrid({ genre, search = "" }: CataloguePrenomsGridProps) {
  const { items, loading, error } = usePrenoms(genre);

  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? items.filter((p) => p.prenom.toLowerCase().includes(needle))
    : items;

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || filtered.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed">
        <Sparkles className="h-10 w-10 opacity-30 mx-auto" strokeWidth={1.25} />
        <h3 className="font-display text-2xl mt-4">Aucun prénom trouvé</h3>
        <p className="text-sm text-muted-foreground mt-2">{error ?? "Le catalogue est vide."}</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground text-center mb-8">
        {filtered.length} prénoms référencés — choisissez un prénom pour personnaliser votre magnet photo.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {filtered.map((p) => (
          <article key={p.id} className="group">
            <div className="aspect-square overflow-hidden bg-white border border-border relative">
              {p.photo_url ? (
                <img
                  src={p.photo_url}
                  alt={p.prenom}
                  loading="lazy"
                  className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              ) : (
                <div className="w-full h-full grid place-items-center text-muted-foreground">
                  <Sparkles className="h-10 w-10 opacity-30" strokeWidth={1.25} />
                </div>
              )}
            </div>
            <div className="pt-4">
              <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
                {p.prenom}
              </h3>
              {p.origine && (
                <p className="text-sm text-muted-foreground mt-1">{p.origine}</p>
              )}
              {p.signification && (
                <p className="text-xs text-muted-foreground mt-0.5 italic">{p.signification}</p>
              )}
              {p.fete_label && (
                <p className="text-xs text-muted-foreground mt-0.5">🎉 {p.fete_label}</p>
              )}
            </div>
          </article>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-12">
        {filtered.length} prénoms disponibles
      </p>
    </>
  );
}
