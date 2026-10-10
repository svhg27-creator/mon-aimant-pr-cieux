import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CatalogueDrapeauxGrid } from "@/components/CatalogueDrapeauxGrid";

export const Route = createFileRoute("/catalogue/drapeau-coeur")({
  component: DrapeauCoeurPage,
  head: () => ({
    meta: [
      { title: "Drapeau cœur — Catalogue Mémora" },
      { name: "description", content: "Catalogue de drapeaux cœur du monde entier — magnets photo personnalisés Mémora." },
    ],
  }),
});

function DrapeauCoeurPage() {
  const [q, setQ] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <span>/</span>
        <Link to="/collections" search={{ famille: "drapeau-coeur" }} className="hover:text-primary">
          Collections
        </Link>
        <span>/</span>
        <span className="text-foreground">Drapeau cœur</span>
      </nav>

      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <Heart className="h-3.5 w-3.5" strokeWidth={1.5} />
          Catalogue Drapeau cœur
        </p>
        <h1 className="font-display text-5xl mt-3">Drapeaux Cœur</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-sm mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher un pays…"
            className="pl-9 h-11"
          />
        </div>
      </div>

      <CatalogueDrapeauxGrid search={q} />
    </div>
  );
}
