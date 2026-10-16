import { useState } from "react";
import { useCatalogueAnimaux } from "@/hooks/useCatalogueAnimaux";
import { CatalogueBuyBar } from "@/components/CatalogueBuyBar";
import { QrPair, wikiUrl } from "@/components/site/QrPair";
import { PawPrint } from "lucide-react";

interface CatalogueGridProps {
  espece: string;
  label: string;
}

export function CatalogueGrid({ espece, label }: CatalogueGridProps) {
  const { items, loading, error } = useCatalogueAnimaux(espece);
  const [selected, setSelected] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-square bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || items.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed">
        <PawPrint className="h-10 w-10 opacity-30 mx-auto" strokeWidth={1.25} />
        <h3 className="font-display text-2xl mt-4">Aucune image trouvée</h3>
        <p className="text-sm text-muted-foreground mt-2">{error ?? "Le catalogue est vide."}</p>
      </div>
    );
  }

  return (
    <>
      <p className="text-muted-foreground text-center mb-8">
        {items.length} {label} référencé{items.length > 1 ? "s" : ""} — cliquez sur une image pour voir son QR code.
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
        {items.map((item) => {
          const isSelected = item.image_index === selected;
          return (
            <article key={item.id} className={isSelected ? "col-span-2" : "group"}>
              <QrPair
                photoUrl={item.photo_url}
                name={item.nom}
                qrValue={wikiUrl(item.nom)}
                selected={isSelected}
                onToggle={() => setSelected(isSelected ? null : item.image_index)}
              />
              <div className="pt-4">
                <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
                  {item.nom}
                </h3>
                <CatalogueBuyBar
                  variantKey={`catalogue-${espece}-${item.image_index}`}
                  title={item.nom}
                  imageUrl={item.photo_url}
                  shapeLabel="Carré 37×37 mm"
                  unitPrice={4.5}
                />
              </div>
            </article>
          );
        })}
      </div>
      <p className="text-xs text-muted-foreground text-center mt-12">
        {items.length} visuels disponibles
      </p>
    </>
  );
}
