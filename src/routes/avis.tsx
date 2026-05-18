import { createFileRoute } from "@tanstack/react-router";
import { Star } from "lucide-react";

export const Route = createFileRoute("/avis")({
  component: AvisPage,
  head: () => ({ meta: [{ title: "Avis clients — Mémora" }] }),
});

function AvisPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-20">
      <p className="eyebrow text-center">Témoignages</p>
      <h1 className="font-display text-5xl mt-3 text-center">Vos moments partagés</h1>
      <p className="text-center text-muted-foreground mt-4">
        Les avis vérifiés seront affichés ici dès vos premières commandes.
      </p>

      <div className="grid md:grid-cols-3 gap-6 mt-14">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border border-border p-6 bg-card">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} className="h-4 w-4 text-primary" strokeWidth={1.5} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 italic">Aucun avis pour le moment.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
