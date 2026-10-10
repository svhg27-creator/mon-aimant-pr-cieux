import { createFileRoute } from "@tanstack/react-router";
import { PrenomCatalogue } from "@/components/PrenomCatalogue";
import { PRENOMS_FILLES } from "@/data/prenoms-filles";

export const Route = createFileRoute("/catalogue/prenoms/filles")({
  component: FillesPage,
  head: () => ({
    meta: [
      { title: "Prénoms filles — Catalogue Mémora" },
      {
        name: "description",
        content:
          "Catalogue de prénoms filles — tapez un prénom pour visualiser votre magnet photo personnalisé Mémora.",
      },
      { property: "og:title", content: "Prénoms filles — Catalogue Mémora" },
      {
        property: "og:description",
        content: "364 prénoms filles référencés pour vos magnets personnalisés.",
      },
    ],
  }),
});

function FillesPage() {
  return <PrenomCatalogue items={PRENOMS_FILLES} color="#F7B4C0" breadcrumb="Filles" />;
}
