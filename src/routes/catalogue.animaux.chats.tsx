import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { PawPrint, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCatalogueAnimaux, type CatalogueItem } from "@/hooks/useCatalogueAnimaux";
import { CatalogueBuyBar } from "@/components/CatalogueBuyBar";
import { CHATS } from "@/data/chats";

// Catalogue local : images dans public/catalogue/animaux/chats/
const NB_IMAGES_CHATS = 62;
const CHATS_LOCAUX: CatalogueItem[] = Array.from({ length: NB_IMAGES_CHATS }, (_, i) => {
  const n = String(i + 1).padStart(3, "0");
  return {
    id: i + 1,
    espece: "chat",
    nom: CHATS[i]?.race ?? `Chat ${i + 1}`,
    photo_url: `/catalogue/animaux/chats/chat-${n}.png`,
    image_name: `chat-${n}.png`,
    image_index: i + 1,
    bucket_name: "local",
    active: true,
  };
});

export const Route = createFileRoute("/catalogue/animaux/chats")({
  component: ChatsPage,
  head: () => ({
    meta: [
      { title: "Chats — Catalogue Animaux | Mémora" },
      {
        name: "description",
        content:
          "Catalogue de 62 races de chats avec photo et couleur — magnets photo personnalisés Mémora.",
      },
      { property: "og:title", content: "Chats — Catalogue Animaux | Mémora" },
      {
        property: "og:description",
        content: "62 races de chats référencées pour vos magnets personnalisés.",
      },
    ],
  }),
});

function ChatsPage() {
  const [q, setQ] = useState("");
  const { items: remote, loading } = useCatalogueAnimaux("chat");
  const items = remote.length > 0 ? remote : CHATS_LOCAUX;

  const filtered = items.filter((c) => {
    const race = CHATS[c.image_index - 1]?.race ?? "";
    const search = q.trim().toLowerCase();
    if (search === "") return true;
    return c.nom.toLowerCase().includes(search) || race.toLowerCase().includes(search);
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <span>/</span>
        <Link to="/collections" search={{ famille: "animaux" }} className="hover:text-primary">
          Animaux
        </Link>
        <span>/</span>
        <span className="text-foreground">Chats</span>
      </nav>

      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <PawPrint className="h-3.5 w-3.5" strokeWidth={1.5} />
          Catalogue Animaux
        </p>
        <h1 className="font-display text-5xl mt-3">Chats</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          {items.length} visuels référencés — choisissez votre compagnon pour le décliner en magnet photo personnalisé.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher…"
            className="pl-9 h-11"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed">
          <h3 className="font-display text-2xl">Aucun résultat</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((c) => {
            const race = CHATS[c.image_index - 1]?.race ?? c.nom;
            return (
              <article key={c.id} className="group">
                <div className="aspect-square overflow-hidden bg-white border border-border">
                  <img
                    src={c.photo_url}
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
                    variantKey={`catalogue-chat-${c.image_index}`}
                    title={race}
                    imageUrl={c.photo_url}
                    shapeLabel="Carré 37×37 mm"
                    unitPrice={4.5}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-12">
        Affichage : {filtered.length} / {items.length}
      </p>
    </div>
  );
}
