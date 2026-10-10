import { createFileRoute } from "@tanstack/react-router";
import { MagnetHommageConfigurator } from "@/components/hommage/MagnetHommageConfigurator";

export const Route = createFileRoute("/catalogue/hommage")({
  component: HommageConfiguratorPage,
  head: () => ({
    meta: [
      { title: "Magnet Hommage Rond 37 mm — Mémora" },
      {
        name: "description",
        content:
          "Créez un magnet hommage personnalisé recto/verso. Photo d'un côté, texte de souvenir de l'autre. Export HD 300 DPI.",
      },
    ],
  }),
});

function HommageConfiguratorPage() {
  return <MagnetHommageConfigurator />;
}
