import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/livraison")({
  component: LivraisonPage,
  head: () => ({
    meta: [
      { title: "Livraison — Mémora" },
      {
        name: "description",
        content:
          "Délais de traitement et de livraison Mémora : France, Europe, DOM-TOM, Suisse et reste du monde.",
      },
    ],
  }),
});

const DELAYS = [
  { zone: "France", delay: "5 à 7 jours ouvrés" },
  { zone: "Europe", delay: "8 à 12 jours ouvrés" },
  { zone: "DOM-TOM", delay: "8 à 12 jours ouvrés" },
  { zone: "Suisse", delay: "6 à 8 jours ouvrés" },
  { zone: "Reste du monde", delay: "10 à 15 jours ouvrés" },
];

function LivraisonPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-14 md:py-20">
      <header className="border-b pb-8 mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <Truck className="h-3.5 w-3.5" strokeWidth={1.5} />
          Service
        </p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Livraison</h1>
      </header>

      <div className="space-y-10 text-foreground/85 leading-7">
        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">Délais de traitement</h2>
          <p>
            Les commandes sont traitées entre 24h et 72h. En prenant en compte le traitement et
            l'expédition, il faut compter :
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">Délais de livraison</h2>
          <ul className="space-y-3">
            {DELAYS.map((d) => (
              <li key={d.zone} className="flex items-baseline justify-between gap-6 border-b border-border/50 pb-3">
                <span className="font-medium text-foreground">{d.zone}</span>
                <span className="text-muted-foreground shrink-0">{d.delay}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">Commandes du week-end</h2>
          <p>
            Pour toutes commandes passées le vendredi après 16h, le week-end et les jours fériés,
            les commandes seront préparées et envoyées le prochain jour ouvré.
          </p>
        </section>
      </div>
    </article>
  );
}
