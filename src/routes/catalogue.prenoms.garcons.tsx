import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PRENOMS } from "@/data/prenoms";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalogue/prenoms/garcons")({
  component: GarconsPage,
  head: () => ({
    meta: [
      { title: "Prénoms garçons — Catalogue Mémora" },
      {
        name: "description",
        content:
          "Catalogue de prénoms garçons avec signification et origine — magnets photo personnalisés Mémora.",
      },
      { property: "og:title", content: "Prénoms garçons — Catalogue Mémora" },
      {
        property: "og:description",
        content: "30 prénoms garçons référencés pour vos magnets personnalisés.",
      },
    ],
  }),
});

const ORIGINES = [
  "Toutes",
  "Germanique",
  "Grecque",
  "Latine",
  "Hébraïque",
  "Arabe",
  "Espagnole",
  "Bretonne",
  "Celte",
  "Irlandaise",
  "Araméen",
];

function GarconsPage() {
  const [q, setQ] = useState("");
  const [origine, setOrigine] = useState("Toutes");

  const prenoms = useMemo(() => PRENOMS.filter((p) => p.genre === "garçon"), []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return prenoms.filter((p) => {
      if (origine !== "Toutes" && p.origine !== origine) return false;
      if (needle && !p.prenom.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, origine, prenoms]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <span>/</span>
        <Link to="/collections" search={{ famille: "prenoms" }} className="hover:text-primary">
          Fête des prénoms
        </Link>
        <span>/</span>
        <span className="text-foreground">Garçons</span>
      </nav>

      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Catalogue Fête des prénoms
        </p>
        <h1 className="font-display text-5xl mt-3">Prénoms Garçons</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          {prenoms.length} prénoms garçons référencés — choisissez un prénom pour personnaliser votre magnet
          photo.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un prénom…"
            className="pl-9 h-11"
          />
        </div>
        <div className="-mx-6 px-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {ORIGINES.map((o) => {
              const active = origine === o;
              return (
                <button
                  key={o}
                  onClick={() => setOrigine(o)}
                  className={cn(
                    "px-3 h-11 border text-xs whitespace-nowrap transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground/80 border-border hover:border-primary/50 hover:text-primary",
                  )}
                >
                  {o}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed">
          <h3 className="font-display text-2xl">Aucun prénom trouvé</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Essayez d'autres mots-clés ou origines.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((p) => (
            <article key={p.id} className="group">
              <div className="aspect-square overflow-hidden bg-white border border-border relative">
                {p.photo ? (
                  <img
                    src={p.photo}
                    alt={p.prenom}
                    loading="lazy"
                    className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground">
                    <Sparkles className="h-10 w-10 opacity-30" strokeWidth={1.25} />
                  </div>
                )}
                <span className="absolute top-2 left-2 text-[10px] tracking-widest uppercase bg-background/80 backdrop-blur px-2 py-1 border border-border">
                  N°{String(p.id).padStart(3, "0")}
                </span>
              </div>
              <div className="pt-4">
                <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
                  {p.prenom}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{p.origine}</p>
                <p className="text-xs text-muted-foreground mt-0.5 italic">{p.signification}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-12">
        Affichage : {filtered.length} / {prenoms.length} prénoms garçons
      </p>
    </div>
  );
}
