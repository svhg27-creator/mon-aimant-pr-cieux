import { createFileRoute, Link } from "@tanstack/react-router";
import { PawPrint } from "lucide-react";
import { useCatalogueAnimaux, type CatalogueItem } from "@/hooks/useCatalogueAnimaux";
import { CatalogueBuyBar } from "@/components/CatalogueBuyBar";
import { CHIENS } from "@/data/chiens";

// Catalogue local : images dans public/catalogue/animaux/chiens/
const NB_IMAGES_CHIENS = 93;
const CHIENS_LOCAUX: CatalogueItem[] = Array.from({ length: NB_IMAGES_CHIENS }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return {
    id: i + 1,
    espece: "chien",
    nom: CHIENS[i]?.race ?? `Chien ${i + 1}`,
    photo_url: `/catalogue/animaux/chiens/chien-${n}.png`,
    image_name: `chien-${n}.png`,
    image_index: i + 1,
    bucket_name: "local",
    active: true,
  };
});

export const Route = createFileRoute("/catalogue/animaux/chiens")({
  component: ChiensPage,
  head: () => ({
    meta: [
      { title: "Chiens — Catalogue Animaux | Mémora" },
      { name: "description", content: "Catalogue de 93 races de chiens pour vos magnets photo personnalisés Mémora." },
    ],
  }),
});

function ChiensPage() {
  const { items: remote, loading } = useCatalogueAnimaux("chien");
  const items = remote.length > 0 ? remote : CHIENS_LOCAUX;
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <span>/</span>
        <Link to="/collections" search={{ famille: "animaux" }} className="hover:text-primary">Animaux</Link>
        <span>/</span>
        <span className="text-foreground">Chiens</span>
      </nav>
      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <PawPrint className="h-3.5 w-3.5" strokeWidth={1.5} />
          Catalogue Animaux
        </p>
        <h1 className="font-display text-5xl mt-3">Chiens</h1>
      </div>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-muted-foreground text-center mb-8">
            {items.length} chiens référencés — choisissez votre compagnon pour le décliner en magnet photo personnalisé.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {items.map((item) => {
              const race = CHIENS[item.image_index - 1]?.race ?? item.nom;
              return (
                <article key={item.id} className="group">
                  <div className="aspect-square overflow-hidden bg-white border border-border relative">
                    <img
                      src={item.photo_url}
                      alt={race}
                      loading="lazy"
                      className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                    />
                  </div>
                  <div className="pt-4 text-center">
                    <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
                      {race}
                    </h3>
                    <CatalogueBuyBar
                      variantKey={`catalogue-chien-${item.image_index}`}
                      title={race}
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
      )}
    </div>
  );
}
