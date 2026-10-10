import { createFileRoute, Link } from "@tanstack/react-router";
import { PawPrint } from "lucide-react";
import { CatalogueGrid } from "@/components/CatalogueGrid";

export const Route = createFileRoute("/catalogue/animaux/rongeurs")({
  component: RongeursPage,
  head: () => ({
    meta: [
      { title: "Rongeurs — Catalogue Animaux | Mémora" },
      { name: "description", content: "Catalogue de rongeurs pour vos magnets photo personnalisés Mémora." },
    ],
  }),
});

function RongeursPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <span>/</span>
        <Link to="/collections" search={{ famille: "animaux" }} className="hover:text-primary">Animaux</Link>
        <span>/</span>
        <span className="text-foreground">Rongeurs</span>
      </nav>
      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <PawPrint className="h-3.5 w-3.5" strokeWidth={1.5} />
          Catalogue Animaux
        </p>
        <h1 className="font-display text-5xl mt-3">Rongeurs</h1>
      </div>
      <CatalogueGrid espece="rongeur" label="rongeur" />
    </div>
  );
}
