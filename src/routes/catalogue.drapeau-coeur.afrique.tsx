import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";

export const Route = createFileRoute("/catalogue/drapeau-coeur/afrique")({
  component: AfriquePage,
  head: () => ({
    meta: [
      { title: "Afrique — Catalogue Drapeau cœur | Mémora" },
      { name: "description", content: "Catalogue des drapeaux cœur de l'Afrique pour vos magnets photo personnalisés Mémora." },
    ],
  }),
});

function AfriquePage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-2">
        <Link to="/" className="hover:text-primary">Accueil</Link>
        <span>/</span>
        <Link to="/collections" search={{ famille: "drapeau-coeur" }} className="hover:text-primary">Drapeau cœur</Link>
        <span>/</span>
        <span className="text-foreground">Afrique</span>
      </nav>
      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
          Catalogue Drapeau cœur
        </p>
        <h1 className="font-display text-5xl mt-3">Afrique</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Catalogue en préparation — importez votre base de pays pour le remplir.
        </p>
      </div>
      <div className="text-center py-16 border border-dashed">
        <Globe className="h-10 w-10 opacity-30 mx-auto" strokeWidth={1.25} />
        <h3 className="font-display text-2xl mt-4">Bientôt disponible</h3>
        <p className="text-sm text-muted-foreground mt-2">Fournissez la base de données pour peupler ce catalogue.</p>
      </div>
    </div>
  );
}
