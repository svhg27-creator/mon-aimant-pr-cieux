import { createFileRoute } from "@tanstack/react-router";
import { Mail, Package, Palette, Truck, MessageCircleQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";

const EMAIL = "speedvision70@gmail.com";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
  head: () => ({
    meta: [
      { title: "Contact — Mémora" },
      {
        name: "description",
        content:
          "Une question sur une commande, un produit ou une personnalisation ? Écrivez-nous à speedvision70@gmail.com.",
      },
    ],
  }),
});

const TOPICS = [
  {
    icon: Package,
    title: "Suivi de commande",
    text: "État de votre commande, délais, numéro de suivi.",
  },
  {
    icon: Palette,
    title: "Personnalisation",
    text: "Photo, texte, prénom ou visuel spécifique à créer.",
  },
  {
    icon: Truck,
    title: "Livraison",
    text: "Frais, délais d'expédition ou problème de réception.",
  },
  {
    icon: MessageCircleQuestion,
    title: "Autre question",
    text: "Grosses commandes, événements, partenariats…",
  },
];

function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-14 md:py-20">
      <header className="text-center border-b pb-10 mb-12">
        <p className="eyebrow inline-flex items-center gap-2">
          <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
          Aide
        </p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Contactez-nous</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed">
          Pour toute question — commande, produit, personnalisation ou livraison —
          écrivez-nous simplement par email. Nous vous répondons aussi vite que possible.
        </p>
      </header>

      <div className="grid sm:grid-cols-2 gap-6 mb-12">
        {TOPICS.map((t) => (
          <div key={t.title} className="border border-border bg-white/60 p-6">
            <t.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-lg mt-3">{t.title}</h2>
            <p className="text-sm text-muted-foreground mt-1">{t.text}</p>
          </div>
        ))}
      </div>

      <div className="text-center border border-primary/30 bg-primary/5 px-6 py-10">
        <h2 className="font-display text-2xl">Une seule adresse pour tout</h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm leading-relaxed">
          Décrivez votre demande et, si elle concerne une commande,
          précisez votre numéro de commande ou l'email utilisé lors de l'achat.
        </p>
        <Button asChild size="lg" className="mt-6">
          <a href={`mailto:${EMAIL}`}>
            <Mail className="h-4 w-4 mr-2" strokeWidth={1.5} />
            {EMAIL}
          </a>
        </Button>
        <p className="text-xs text-muted-foreground mt-4">
          Le bouton ouvre votre application email — vous pouvez aussi copier l'adresse directement.
        </p>
      </div>
    </div>
  );
}
