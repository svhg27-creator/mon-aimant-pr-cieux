import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/notre-histoire")({
  component: HistoirePage,
  head: () => ({ meta: [{ title: "Notre Histoire — Mémora" }] }),
});

function HistoirePage() {
  return (
    <article className="max-w-3xl mx-auto px-6 py-20">
      <p className="eyebrow">L'atelier</p>
      <h1 className="font-display text-5xl mt-3">Notre Histoire</h1>
      <div className="mt-10 space-y-6 text-foreground/85 leading-relaxed text-lg">
        <p>
          Mémora est née d'une conviction simple : nos plus beaux souvenirs méritent mieux qu'un écran. Ils méritent un objet, une matière, un geste.
        </p>
        <p>
          Depuis notre atelier français, nous transformons vos photos en magnets d'exception — impression premium mate, aimant haute densité, packaging écrin. Chaque détail compte.
        </p>
        <p className="font-display italic text-2xl text-primary">
          Parce que la mémoire devient plus précieuse quand elle se touche.
        </p>
      </div>
    </article>
  );
}
