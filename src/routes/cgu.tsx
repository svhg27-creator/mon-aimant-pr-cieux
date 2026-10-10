import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cgu")({
  component: CguPage,
  head: () => ({ meta: [{ title: "Conditions générales d’utilisation — Mémora" }] }),
});

function CguPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-14 md:py-20">
      <header className="border-b pb-8 mb-10">
        <p className="eyebrow">Informations légales</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Conditions générales d’utilisation</h1>
        <p className="text-sm text-muted-foreground mt-4">Dernière mise à jour : 21 juillet 2026</p>
      </header>

      <div className="legal-content space-y-10 text-foreground/85 leading-7">
        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">1. Objet</h2>
          <p>Les présentes conditions générales d’utilisation régissent l’accès et l’utilisation du site Mémora, accessible notamment depuis speedvision70.com. En naviguant sur le site, vous acceptez sans réserve les présentes conditions.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">2. Éditeur du site</h2>
          <p>
            Le site est édité par <strong>Stéphane Vigneron</strong>, agissant en qualité d’auto-entrepreneur
            immatriculé sous la dénomination <strong>Vigneron Stéphane</strong>, au RCS de <strong>Melun</strong> sous le
            numéro SIREN <strong>831 904 354</strong>.<br />
            Siège social : <strong>3 place de la Marlière, 77680 Roissy-en-Brie, France</strong>.<br />
            Contact : <strong>speedvision70@gmail.com</strong>.<br />
            Directeur de la publication : <strong>Stéphane Vigneron</strong>.<br />
            Hébergeur : <strong>Netlify, Inc.</strong>, 512 2nd Street, Suite 200, San Francisco, CA 94107, USA.
          </p>
          <p className="mt-3">Pour toute demande, vous pouvez utiliser la rubrique <Link to="/account/support" className="text-primary underline underline-offset-4">Support</Link> lorsque vous disposez d’un compte client.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">3. Accès au site</h2>
          <p>Le site est accessible gratuitement à tout utilisateur disposant d’un accès à internet. Les frais liés à cet accès, au matériel et aux logiciels nécessaires restent à la charge de l’utilisateur. Mémora s’efforce d’assurer la disponibilité du site, sans garantir une disponibilité permanente ou sans interruption.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">4. Compte client</h2>
          <p>Certaines fonctionnalités nécessitent la création d’un compte. Vous vous engagez à fournir des informations exactes, à les maintenir à jour et à préserver la confidentialité de vos identifiants. Toute action réalisée depuis votre compte est présumée effectuée par vous, sauf signalement rapide d’une utilisation non autorisée.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">5. Utilisation du service</h2>
          <p>Vous vous engagez à utiliser le site conformément aux lois applicables, aux présentes conditions et aux droits des tiers. Il est notamment interdit de perturber le fonctionnement du site, de tenter d’accéder à des données non autorisées, ou de publier, téléverser ou transmettre des contenus illicites, contrefaisants, diffamatoires ou portant atteinte aux droits d’autrui.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">6. Contenus personnalisés</h2>
          <p>Lorsque vous importez des photographies, textes ou autres éléments pour personnaliser un produit, vous garantissez disposer des droits nécessaires à leur utilisation. Vous restez seul responsable des contenus transmis. Mémora peut refuser tout contenu manifestement contraire à la loi, aux bonnes mœurs ou aux droits des tiers.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">7. Propriété intellectuelle</h2>
          <p>La structure du site, son identité visuelle, ses textes, photographies, graphismes, logos, logiciels et autres éléments sont protégés par les droits de propriété intellectuelle. Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation préalable écrite est interdite, sauf exception légale.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">8. Données personnelles</h2>
          <p>Les données personnelles collectées dans le cadre de l’utilisation du site sont traitées conformément à la réglementation applicable. Vous pouvez exercer vos droits d’accès, de rectification, d’effacement, d’opposition, de limitation et de portabilité en contactant l’éditeur du site. Une politique de confidentialité détaillée devra compléter les présentes conditions.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">9. Responsabilité</h2>
          <p>Mémora ne saurait être tenue responsable des dommages indirects, des pertes de données, des interruptions de service ou des dommages résultant de l’utilisation du site, dans les limites autorisées par la loi. Les liens vers des sites tiers sont fournis à titre informatif ; Mémora n’exerce aucun contrôle sur leur contenu.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">10. Modification des conditions</h2>
          <p>Mémora peut modifier les présentes conditions à tout moment. La version applicable est celle publiée sur le site à la date de votre navigation. Nous vous invitons à les consulter régulièrement.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">11. Droit applicable</h2>
          <p>Les présentes conditions sont soumises au droit français. En cas de litige, les juridictions compétentes seront déterminées conformément aux règles légales applicables, notamment celles protectrices du consommateur.</p>
        </section>
      </div>
    </article>
  );
}
