import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/cgv")({
  component: CgvPage,
  head: () => ({ meta: [{ title: "Conditions générales de vente — Mémora" }] }),
});

function CgvPage() {
  return (
    <article className="max-w-4xl mx-auto px-6 py-14 md:py-20">
      <header className="border-b pb-8 mb-10">
        <p className="eyebrow">Informations légales</p>
        <h1 className="font-display text-4xl md:text-5xl mt-3">Conditions générales de vente</h1>
        <p className="text-sm text-muted-foreground mt-4">Dernière mise à jour : 21 juillet 2026</p>
      </header>

      <div className="legal-content space-y-10 text-foreground/85 leading-7">
        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">1. Champ d’application</h2>
          <p>
            Les présentes conditions générales de vente s’appliquent aux ventes de produits personnalisés proposées par
            <strong>Stéphane Vigneron</strong>, agissant en qualité d’auto-entrepreneur sous la dénomination
            <strong>Vigneron Stéphane</strong>, immatriculé au RCS de <strong>Melun</strong> sous le numéro SIREN
            <strong>831 904 354</strong>, dont le siège social est situé au
            <strong>3 place de la Marlière, 77680 Roissy-en-Brie, France</strong>, contact :
            <strong>speedvision70@gmail.com</strong>, à des consommateurs via le site speedvision70.com.
            TVA non applicable, art. 293 B du CGI.
            Toute commande implique l’acceptation sans réserve des présentes conditions.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">2. Produits personnalisés</h2>
          <p>Les produits Mémora sont créés à partir des éléments que vous fournissez ou sélectionnez. Les visuels affichés à l’écran sont des aperçus et peuvent présenter de légères variations de couleur, de cadrage ou de rendu liées aux écrans, aux fichiers transmis et au procédé de fabrication.</p>
          <p className="mt-3">Vous garantissez être titulaire des droits nécessaires sur les contenus utilisés pour votre personnalisation et qu’ils ne portent pas atteinte aux droits de tiers.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">3. Prix</h2>
          <p>Les prix sont affichés en euros, toutes taxes comprises lorsque la TVA est applicable. Les frais de livraison éventuels sont indiqués avant la validation finale de la commande. Mémora peut modifier ses prix à tout moment ; les produits sont facturés au tarif affiché au moment de la confirmation de la commande.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">4. Commande</h2>
          <p>Avant de valider votre commande, vous pouvez vérifier son détail, son prix total et corriger les erreurs éventuelles. La validation de la commande constitue une obligation de paiement. Une confirmation est adressée à l’adresse électronique renseignée lors de la commande.</p>
          <p className="mt-3">Mémora se réserve le droit de refuser ou d’annuler une commande en cas de litige antérieur, d’informations manifestement erronées, de fraude présumée ou d’indisponibilité exceptionnelle.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">5. Paiement</h2>
          <p>Le paiement est exigible intégralement à la commande. Les paiements sont traités par un prestataire de paiement sécurisé. Mémora n’a pas accès à vos données bancaires complètes. La commande est mise en fabrication après confirmation du paiement.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">6. Fabrication et livraison</h2>
          <p>Les délais de fabrication et de livraison communiqués sur le site sont indicatifs, sauf engagement contraire expressément indiqué. Les produits sont livrés à l’adresse renseignée lors de la commande. Il vous appartient de vérifier l’exactitude de cette adresse avant validation.</p>
          <p className="mt-3">En cas de retard significatif, vous pouvez contacter le support afin d’obtenir une information sur le suivi de votre commande.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">7. Droit de rétractation</h2>
          <p>Conformément à l’article L221-28 du Code de la consommation, le droit de rétractation ne s’applique pas aux biens confectionnés selon les spécifications du consommateur ou nettement personnalisés. Les produits Mémora étant réalisés à partir de vos choix de personnalisation, ils ne peuvent donc pas faire l’objet d’un retour au titre du droit de rétractation, sauf défaut de conformité ou erreur imputable à Mémora.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">8. Conformité et réclamations</h2>
          <p>Vous bénéficiez de la garantie légale de conformité et de la garantie contre les vices cachés dans les conditions prévues par la loi. À réception de votre commande, vérifiez son état. Toute réclamation doit être transmise avec les éléments utiles, notamment des photographies du produit et de son emballage lorsque cela est pertinent.</p>
          <p className="mt-3">Pour déclarer un problème, utilisez la rubrique <Link to="/account/support" className="text-primary underline underline-offset-4">Support</Link>. Nous vous indiquerons la solution adaptée : remplacement, remboursement ou autre mesure prévue par la loi.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">9. Responsabilité</h2>
          <p>Mémora est responsable de la bonne exécution de ses obligations contractuelles dans les limites prévues par la loi. Sa responsabilité ne peut être engagée pour les défauts provenant des fichiers, textes, photos ou instructions fournis par le client, ni pour les dommages indirects qui ne résultent pas d’une faute de Mémora.</p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-foreground mb-3">10. Médiation et litiges</h2>
          <p>
            En cas de difficulté, nous vous invitons à contacter le support afin de rechercher une solution amiable.
            Conformément aux articles L611-1 et L612-1 du Code de la consommation, le consommateur peut recourir
            gratuitement à un médiateur de la consommation. Le Vendeur n’a pas adhéré à un organisme de médiation de la consommation.
            À défaut d’accord amiable, le Client peut recourir à la plateforme européenne de règlement en ligne des litiges :
            {" "}
            <a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">
              https://ec.europa.eu/consumers/odr/
            </a>
            .
          </p>
          <p className="mt-3">Les présentes conditions sont soumises au droit français. Les règles impératives protectrices du consommateur demeurent applicables.</p>
        </section>
      </div>
    </article>
  );
}
