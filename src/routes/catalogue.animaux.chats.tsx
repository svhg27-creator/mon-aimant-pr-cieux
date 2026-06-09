import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PawPrint, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CHATS } from "@/data/chats";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/catalogue/animaux/chats")({
  component: ChatsPage,
  head: () => ({
    meta: [
      { title: "Chats — Catalogue Animaux | Mémora" },
      {
        name: "description",
        content:
          "Catalogue de 59 races de chats avec photo et couleur — magnets photo personnalisés Mémora.",
      },
      { property: "og:title", content: "Chats — Catalogue Animaux | Mémora" },
      {
        property: "og:description",
        content: "59 races de chats référencées pour vos magnets personnalisés.",
      },
    ],
  }),
});

const COULEURS = [
  "Toutes",
  "Blanc",
  "Noir",
  "Gris",
  "Bleu",
  "Roux",
  "Crème",
  "Marron",
  "Tigré",
  "Bicolore",
  "Tricolore",
];

function ChatsPage() {
  const [q, setQ] = useState("");
  const [couleur, setCouleur] = useState("Toutes");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return CHATS.filter((c) => {
      if (couleur !== "Toutes" && c.couleur !== couleur) return false;
      if (needle && !c.race.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [q, couleur]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      {/* Breadcrumb */}
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
          {CHATS.length} races référencées — choisissez votre compagnon pour le décliner en magnet
          photo personnalisé.
        </p>
      </div>

      {/* Filtres */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher une race…"
            className="pl-9 h-11"
          />
        </div>
        <div className="-mx-6 px-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {COULEURS.map((c) => {
              const active = couleur === c;
              return (
                <button
                  key={c}
                  onClick={() => setCouleur(c)}
                  className={cn(
                    "px-3 h-11 border text-xs whitespace-nowrap transition-colors",
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-foreground/80 border-border hover:border-primary/50 hover:text-primary",
                  )}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grille */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed">
          <h3 className="font-display text-2xl">Aucune race trouvée</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Essayez d'autres mots-clés ou couleurs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((c) => (
            <article key={c.id} className="group">
              <div className="aspect-square overflow-hidden bg-white border border-border relative">
                {c.photo ? (
                  <img
                    src={c.photo}
                    alt={c.race}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-muted-foreground">
                    <PawPrint className="h-10 w-10 opacity-30" strokeWidth={1.25} />
                  </div>
                )}
                <span className="absolute top-2 left-2 text-[10px] tracking-widest uppercase bg-background/80 backdrop-blur px-2 py-1 border border-border">
                  N°{String(c.id).padStart(3, "0")}
                </span>
              </div>
              <div className="pt-4">
                <h3 className="font-display text-lg leading-tight group-hover:text-primary transition-colors">
                  {c.race}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">{c.couleur}</p>
              </div>
            </article>
          ))}
        </div>
      )}

      <p className="text-xs text-muted-foreground text-center mt-12">
        Affichage : {filtered.length} / {CHATS.length} races
      </p>
    </div>
  );
}
