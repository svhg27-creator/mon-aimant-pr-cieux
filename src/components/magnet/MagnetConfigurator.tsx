import { motion, AnimatePresence } from "framer-motion";
import { PhotoUploader, ResolutionWarning } from "./PhotoUploader";
import { PhotoEditor } from "./PhotoEditor";
import { ShapeSelector } from "./ShapeSelector";
import { QuantitySelector, PriceDisplay } from "./QuantitySelector";
import { AddToCartButton } from "./AddToCartButton";
import { MagnetPreview } from "./MagnetPreview";
import { useMagnetStore } from "@/stores/magnetStore";
import { ImageIcon, Sparkles } from "lucide-react";

export function MagnetConfigurator() {
  const imageUrl = useMagnetStore((state) => state.imageUrl);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="text-center mb-10">
        <p className="eyebrow inline-flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={1.5} />
          Configurateur Mémora
        </p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Créez votre magnet photo</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Importez votre photo, choisissez la forme, ajustez le recadrage et commandez en quelques
          clics.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h2 className="font-display text-xl">1. Votre photo</h2>
            </div>
            <PhotoUploader />
            <ResolutionWarning />
            <AnimatePresence>
              {imageUrl && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <PhotoEditor />
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl">2. Forme du magnet</h2>
            <ShapeSelector />
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl">3. Quantité</h2>
            <QuantitySelector />
          </section>

          <section className="space-y-4">
            <PriceDisplay />
            <AddToCartButton />
            <p className="text-xs text-center text-muted-foreground">
              Frais de livraison calculés à l'étape suivante. Fabrication française, livraison 48h.
            </p>
          </section>
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="bg-secondary/30 rounded-2xl p-6 md:p-10 border border-border">
            <h2 className="font-display text-xl text-center mb-6">Aperçu en temps réel</h2>
            <MagnetPreview />
          </div>
        </div>
      </div>
    </div>
  );
}
