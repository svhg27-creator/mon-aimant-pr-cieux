import { createFileRoute } from "@tanstack/react-router";
import { PrenomCatalogue } from "@/components/PrenomCatalogue";
import { PRENOMS_MIXTES } from "@/data/prenoms-mixtes";

export const Route = createFileRoute("/catalogue/prenoms/mixtes")({
  component: MixtesPage,
  head: () => ({
    meta: [
      { title: "Prénoms mixtes — Catalogue Mémora" },
      {
        name: "description",
        content:
          "Catalogue de prénoms mixtes — tapez un prénom pour visualiser votre magnet photo personnalisé Mémora.",
      },
      { property: "og:title", content: "Prénoms mixtes — Catalogue Mémora" },
      {
        property: "og:description",
        content: "Les prénoms mixtes (filles et garçons) référencés pour vos magnets personnalisés.",
      },
    ],
  }),
});

function MixtesPage() {
  return <PrenomCatalogue items={PRENOMS_MIXTES} color="#C9A7EB" breadcrumb="Mixtes" />;
}
