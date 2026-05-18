import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/personnalisation")({
  component: PersonnalisationPage,
  head: () => ({
    meta: [
      { title: "Personnalisation — Mémora" },
      { name: "description", content: "Personnalisez votre magnet : prénom, date, photo. Fabrication française." },
    ],
  }),
});

function PersonnalisationPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-20 text-center">
      <p className="eyebrow">Sur-mesure</p>
      <h1 className="font-display text-5xl mt-3">Personnalisation</h1>
      <p className="text-muted-foreground mt-5 leading-relaxed">
        Choisissez un produit dans nos collections puis ajoutez prénom, date et photo directement sur la fiche.
      </p>
      <Link
        to="/collections"
        className="inline-block mt-8 bg-primary text-primary-foreground px-8 py-4 hover:bg-primary/90 transition-colors"
      >
        Explorer les collections →
      </Link>
    </div>
  );
}
