import type { CatalogueProduct } from "@/lib/commerce";

export interface LocalProductCta {
  /** Route vers laquelle le produit renvoie (catalogue ou configurateur) */
  to: string;
  label: string;
}

function makeProduct(
  handle: string,
  title: string,
  description: string,
  price: number,
  imageUrl: string,
): CatalogueProduct {
  const amount = price.toFixed(2);
  return {
    node: {
      id: `local-${handle}`,
      title,
      description,
      handle,
      priceRange: { minVariantPrice: { amount, currencyCode: "EUR" } },
      images: { edges: [{ node: { url: imageUrl, altText: title } }] },
      variants: {
        edges: [
          {
            node: {
              id: handle,
              title: "Standard",
              price: { amount, currencyCode: "EUR" },
              availableForSale: true,
              selectedOptions: [],
            },
          },
        ],
      },
      options: [],
    },
  };
}

/**
 * Produits vitrine affichés sur l'accueil et la page Collections.
 * Chaque produit renvoie vers son catalogue ou son configurateur
 * (l'achat se fait depuis ces pages, où le visuel est choisi).
 */
export const LOCAL_PRODUCTS: CatalogueProduct[] = [
  makeProduct(
    "magnet-personnalise",
    "Magnet photo personnalisé",
    "Votre photo imprimée sur un magnet premium — cadeau personnalisé, message et souvenir. Formats rond, carré, cœur et rectangle.",
    2.5,
    "/catalogue/family/message.png",
  ),
  makeProduct(
    "magnet-prenom",
    "Magnet fête des prénoms",
    "Prénom et date de fête sur un magnet 37×37 mm — idée cadeau pour un anniversaire de prénom. Filles, garçons et mixtes.",
    4.5,
    "/catalogue/family/prenoms.png",
  ),
  makeProduct(
    "magnet-animal",
    "Magnet animal de compagnie",
    "Chats, chiens, lapins, rongeurs et oiseaux — le portrait de votre animal sur un magnet carré 37×37 mm.",
    4.5,
    "/catalogue/family/animaux.png",
  ),
  makeProduct(
    "magnet-drapeau-coeur",
    "Magnet drapeau cœur",
    "Le drapeau de votre pays en forme de cœur 70×65 mm — 196 pays disponibles, avec option QR code au verso.",
    5.0,
    "/catalogue/family/drapeau-coeur.png",
  ),
  makeProduct(
    "magnet-hommage-37mm",
    "Magnet hommage 37 mm",
    "Un magnet rond hommage pour honorer la mémoire d'un être cher — photo et texte personnalisés, memoriam.",
    8.0,
    "/catalogue/family/hommage.png",
  ),
  makeProduct(
    "magnet-fete-meres",
    "Magnet fête des mères",
    "Un magnet cadeau pour la fête des mères et des grand-mères — visuels tendres prêts à offrir.",
    4.5,
    "/catalogue/family/fete-meres.png",
  ),
];

/** Redirection par produit vitrine : où choisir le visuel / personnaliser. */
export const PRODUCT_CTAS: Record<string, LocalProductCta> = {
  "magnet-personnalise": {
    to: "/personnalisation",
    label: "Personnaliser mon magnet",
  },
  "magnet-prenom": {
    to: "/catalogue/prenoms/filles",
    label: "Choisir un prénom",
  },
  "magnet-animal": {
    to: "/catalogue/animaux/chats",
    label: "Choisir un animal",
  },
  "magnet-drapeau-coeur": {
    to: "/catalogue/drapeau-coeur",
    label: "Choisir un drapeau",
  },
  "magnet-hommage-37mm": {
    to: "/catalogue/hommage",
    label: "Créer un hommage",
  },
  "magnet-fete-meres": {
    to: "/catalogue/fete-meres",
    label: "Voir le catalogue",
  },
};

export function getLocalProduct(handle: string): CatalogueProduct | undefined {
  return LOCAL_PRODUCTS.find((p) => p.node.handle === handle);
}
