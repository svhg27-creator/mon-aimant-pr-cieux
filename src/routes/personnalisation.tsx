import { createFileRoute } from "@tanstack/react-router";
import { MagnetConfigurator } from "@/components/magnet/MagnetConfigurator";

export const Route = createFileRoute("/personnalisation")({
  component: PersonnalisationPage,
  head: () => ({
    meta: [
      { title: "Personnalisation — Mémora" },
      {
        name: "description",
        content:
          "Créez votre magnet photo personnalisé : forme, recadrage, quantité. Aperçu en temps réel.",
      },
    ],
  }),
});

function PersonnalisationPage() {
  return <MagnetConfigurator />;
}
