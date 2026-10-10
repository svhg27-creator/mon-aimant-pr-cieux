import { useHommageStore } from "@/stores/hommageStore";
import { LivePreview } from "./LivePreview";
import { PhotoUploader } from "./PhotoUploader";
import { BackgroundSelector } from "./BackgroundSelector";
import { BackEditor } from "./BackEditor";
import { ExportManager } from "./ExportManager";
import { cn } from "@/lib/utils";
import { Image, Type } from "lucide-react";

export function MagnetHommageConfigurator() {
  const { activeTab, setActiveTab } = useHommageStore();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <p className="eyebrow">Collection Hommage</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Magnet rond 37 mm</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Créez un magnet recto/verso personnalisé — photo d'un côté, texte de l'autre.
          Export haute définition pour impression.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        {/* Colonne gauche — aperçu */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-secondary/30 rounded-2xl p-6 md:p-10 border border-border">
            {/* Tabs Recto / Verso */}
            <div className="flex gap-2 mb-8 justify-center">
              {(["recto", "verso"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2 text-sm font-medium transition-colors border",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50",
                  )}
                >
                  {tab === "recto" ? "Recto (photo)" : "Verso (texte)"}
                </button>
              ))}
            </div>

            <LivePreview />

            <div className="mt-6 text-center space-y-1">
              <p className="font-display text-lg">Magnet Rond</p>
              <p className="text-sm text-muted-foreground">Ø 37 mm · Zone sécurité 5 mm · Fond perdu 2 mm</p>
            </div>
          </div>
        </div>

        {/* Colonne droite — outils */}
        <div className="space-y-8">
          {/* Section 1 - Photo (visible côté recto) */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Image className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <h2 className="font-display text-lg">1. Photo (recto)</h2>
            </div>
            <PhotoUploader />
          </section>

          {/* Section 2 - Fond */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <span className="h-4 w-4 text-primary text-xs font-bold">BG</span>
              <h2 className="font-display text-lg">2. Fond du recto</h2>
            </div>
            <BackgroundSelector />
          </section>

          {/* Section 3 - Texte verso */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <Type className="h-4 w-4 text-primary" strokeWidth={1.5} />
              <h2 className="font-display text-lg">3. Texte (verso)</h2>
            </div>
            <BackEditor />
          </section>

          {/* Section 4 - Export */}
          <section className="space-y-4 pt-4">
            <div className="bg-secondary/50 rounded-xl p-5 border border-border">
              <ExportManager />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
