import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useCatalogueAnimaux } from "@/hooks/useCatalogueAnimaux";
import { MagnetPair } from "@/components/site/MagnetPair";

export const Route = createFileRoute("/catalogue/fete-meres")({
  component: FeteMeresPage,
  head: () => ({
    meta: [
      { title: "Fête des mères & grand-mères — Catalogue | Mémora" },
      {
        name: "description",
        content:
          "Catalogue de visuels Fête des mères & grand-mères — magnets photo personnalisés Mémora.",
      },
    ],
  }),
});

function FeteMeresPage() {
  const [q, setQ] = useState("");
  const { items, loading } = useCatalogueAnimaux("fete-meres");

  const filtered = items.filter(
    (c) =>
      q.trim() === "" ||
      c.nom.toLowerCase().includes(q.trim().toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <span>/</span>
        <Link to="/collections" search={{ famille: "fete-meres" }} className="hover:text-primary">
          Fête des mères &amp; grand-mères
        </Link>
        <span>/</span>
        <span className="text-foreground">Catalogue</span>
      </nav>

      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <Crown className="h-3.5 w-3.5" strokeWidth={1.5} />
          Catalogue
        </p>
        <h1 className="font-display text-5xl mt-3">Fête des mères &amp; grand-mères</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          {items.length} visuel{items.length > 1 ? "s" : ""} référencé{items.length > 1 ? "s" : ""} — choisissez votre motif pour le décliner en magnet photo personnalisé.
        </p>
        <MagnetPair caption="Chaque magnet porte un QR code au dos — à scanner pour retrouver le visuel." />
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
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed">
          <Crown className="h-10 w-10 opacity-30 mx-auto" strokeWidth={1.25} />
          <h3 className="font-display text-2xl mt-4">Aucun résultat</h3>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((c) => (
            <article key={c.id} className="group">
              <div className="aspect-square overflow-hidden bg-white border border-border relative">
                <img
                  src={c.photo_url}
                  alt={c.nom}
                  loading="lazy"
                  className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                />
              </div>
              <div className="pt-4">
                <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
                  {c.nom}
                </h3>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-12">
        Affichage : {filtered.length} / {items.length}
      </p>
    </div>
  );
}
