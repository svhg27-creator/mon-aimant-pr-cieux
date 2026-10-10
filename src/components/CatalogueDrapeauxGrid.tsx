import { useState } from "react";
import { useCatalogueDrapeaux } from "@/hooks/useCatalogueDrapeaux";
import { CatalogueBuyBar } from "@/components/CatalogueBuyBar";
import { Globe } from "lucide-react";

interface CatalogueDrapeauxGridProps {
  search?: string;
}

export function CatalogueDrapeauxGrid({ search = "" }: CatalogueDrapeauxGridProps) {
  const { items, loading, error } = useCatalogueDrapeaux();
  const [selected, setSelected] = useState<number | null>(null);

  const needle = search.trim().toLowerCase();
  const filtered = needle
    ? items.filter((item) => item.pays.toLowerCase().includes(needle))
    : items;

  // Pays sélectionné : recherche réduite à un seul résultat, ou clic sur un drapeau
  const selectedId =
    selected !== null && filtered.some((i) => i.image_index === selected)
      ? selected
      : filtered.length === 1
        ? filtered[0].image_index
        : null;

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
        <Globe className="h-10 w-10 opacity-30 mx-auto" strokeWidth={1.25} />
        <h3 className="font-display text-2xl mt-4">Aucune image trouvée</h3>
        <p className="text-sm text-muted-foreground mt-2">{error ?? "Le catalogue est vide."}</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground text-center mb-8">
        {filtered.length} drapeaux référencés — cliquez sur un drapeau pour voir son QR code.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {filtered.map((item) => {
          const isSelected = item.image_index === selectedId;
          return (
            <article key={item.id} className={isSelected ? "col-span-2" : "group"}>
              <div className={isSelected ? "grid grid-cols-2 gap-4" : ""}>
                <button
                  type="button"
                  onClick={() => setSelected(isSelected ? null : item.image_index)}
                  title={isSelected ? "Masquer le QR code" : `Voir le QR code ${item.pays}`}
                  className={`aspect-square overflow-hidden bg-white border relative block w-full ${
                    isSelected ? "border-primary" : "border-border"
                  }`}
                >
                  <img
                    src={`${item.photo_url}?v=3`}
                    alt={item.pays}
                    loading="lazy"
                    className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                  <span className="absolute bottom-1 right-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                    Recto
                  </span>
                </button>
                {isSelected && item.qr_url && (
                  <div className="aspect-square overflow-hidden bg-white border border-primary relative">
                    <img
                      src={item.qr_url}
                      alt={`QR code ${item.pays}`}
                      className="w-full h-full object-contain p-2"
                    />
                    <span className="absolute bottom-1 right-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                      QR code
                    </span>
                  </div>
                )}
              </div>
              <div className="pt-4 text-center">
                <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
                  {item.pays}
                </h3>
                <CatalogueBuyBar
                  variantKey={`catalogue-drapeau-${item.image_index}`}
                  title={item.pays}
                  imageUrl={item.photo_url}
                  shapeLabel="Cœur 70×65 mm"
                  unitPrice={5.0}
                />
              </div>
            </article>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-12">
        {filtered.length} visuels disponibles
      </p>
    </>
  );
}
