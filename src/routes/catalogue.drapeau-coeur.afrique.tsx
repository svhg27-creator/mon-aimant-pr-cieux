import { createFileRoute, Link } from "@tanstack/react-router";
import { Globe } from "lucide-react";
import { CatalogueDrapeauxGrid } from "@/components/CatalogueDrapeauxGrid";
import { MagnetPair } from "@/components/site/MagnetPair";

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
        <h1 className="font-display text-5xl mt-3">Drapeaux cœur</h1>
        <MagnetPair
          recto="/images/drapeau-coeur/drapeau-coeur.png"
          verso="/images/drapeau-coeur/drapeau-coeur-verso.png"
          rectoAlt="Magnet drapeau cœur"
          caption="Chaque magnet porte un QR code au dos — à scanner pour retrouver la page du pays."
        />
      </div>
      <CatalogueDrapeauxGrid />
    </div>
  );
}
