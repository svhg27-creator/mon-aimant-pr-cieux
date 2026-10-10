import { createFileRoute } from "@tanstack/react-router";
import { PrenomCatalogue } from "@/components/PrenomCatalogue";
import { PRENOMS_GARCONS } from "@/data/prenoms-garcons";

export const Route = createFileRoute("/catalogue/prenoms/garcons")({
  component: GarconsPage,
  head: () => ({
    meta: [
      { title: "Prénoms garçons — Catalogue Mémora" },
      {
        name: "description",
        content:
          "Catalogue de prénoms garçons — tapez un prénom pour visualiser votre magnet photo personnalisé Mémora.",
      },
      { property: "og:title", content: "Prénoms garçons — Catalogue Mémora" },
      {
        property: "og:description",
        content: "367 prénoms garçons référencés pour vos magnets personnalisés.",
      },
    ],
  }),
});

function GarconsPage() {
  return <PrenomCatalogue items={PRENOMS_GARCONS} color="#9FC5E8" breadcrumb="Garçons" />;
}
