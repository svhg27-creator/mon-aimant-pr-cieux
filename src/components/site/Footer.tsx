import { Link } from "@tanstack/react-router";
import { PaymentMethods } from "@/components/site/PaymentMethods";

export function Footer() {
  return (
    <footer className="bg-secondary/40 mt-24 border-t border-border/40">
      <div className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-4 gap-10">
        <div className="md:col-span-1">
          <h3 className="font-display text-2xl text-primary">Mémora</h3>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-xs">
            L'art de transformer vos moments numériques en objets d'exception.
          </p>
        </div>

        <FooterCol
          title="Service"
          links={[
            { label: "Livraison", to: "/livraison" },
            { label: "Qualité", to: "/qualite" },
          ]}
        />
        <FooterCol
          title="Aide"
          links={[
            { label: "Contact", to: "/contact" },
            { label: "FAQ", to: "/faq" },
          ]}
        />
        <FooterCol
          title="Légal"
          links={[
            { label: "CGU", to: "/cgu" },
            { label: "CGV", to: "/cgv" },
            { label: "Paiement sécurisé", to: "/paiement" },
            { label: "Newsletter", to: "/newsletter" },
          ]}
        />
      </div>
      <div className="max-w-7xl mx-auto px-6 pb-8">
        <PaymentMethods compact />
      </div>
      <div className="border-t border-border/40 py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Mémora. Créateurs de souvenirs tactiles.
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; to: string }[] }) {
  return (
    <div>
      <h4 className="text-primary font-medium text-sm mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((l) => (
          <li key={l.to}>
            <Link to={l.to} className="text-sm text-foreground/75 hover:text-primary transition-colors">
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
