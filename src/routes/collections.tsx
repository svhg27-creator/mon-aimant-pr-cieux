import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ProductCard } from "@/components/site/ProductCard";
import { FamilyChips, FAMILIES } from "@/components/site/FamilyChips";
import { FamilyTeaser, type FamilyTeaserConfig } from "@/components/site/FamilyTeaser";
import { LOCAL_PRODUCTS } from "@/data/produits";

const familyIds = FAMILIES.map((f) => f.id) as [string, ...string[]];
const searchSchema = z.object({
  famille: fallback(z.enum(familyIds), "all").default("all"),
});

const FAMILY_TEASERS: Record<string, FamilyTeaserConfig> = {
  prenoms: {
    recto: "/images/magnet-prenom-recto.jpg",
    verso: "/images/magnet-prenom-verso.jpg",
    rectoLabel: "Prénom",
    children: (
      <>
        Choisis le prénom que tu souhaites — Tu auras un{" "}
        <span className="text-primary">QR Code</span> à scanner au dos du magnet, te dirigeant
        vers la page du prénom.
      </>
    ),
  },
  animaux: {
    recto: "/images/magnet-chien-recto.jpg",
    verso: "/images/magnet-chien-verso.jpg",
    rectoLabel: "Animal",
    children: (
      <>
        Choisis l'animal que tu souhaites — Tu auras un{" "}
        <span className="text-primary">QR Code</span> à scanner au dos du magnet, te dirigeant
        vers la fiche de l'animal.
      </>
    ),
  },
  "drapeau-coeur": {
    recto: "/images/drapeau-coeur/drapeau-coeur.png",
    verso: "/images/drapeau-coeur/drapeau-coeur-verso.png",
    rectoLabel: "Drapeau cœur",
    cardTo: "/catalogue/drapeau-coeur",
    to: "/catalogue/drapeau-coeur",
    cta: "Voir les 196 pays",
    children: (
      <>
        Choisis le pays que tu souhaites — Tu auras un{" "}
        <span className="text-primary">QR Code</span> à scanner au dos du magnet, te dirigeant
        vers la page de recherche du pays.
      </>
    ),
  },
  message: {
    rectoLabel: "Message",
    to: "/personnalisation",
    cta: "Personnaliser mon magnet",
    children: (
      <>
        Choisis le message que tu souhaites — fleur, bouteille ou cadeau — Tu auras un{" "}
        <span className="text-primary">QR Code</span> à scanner au dos du magnet.
      </>
    ),
  },
  evenements: {
    rectoLabel: "Événement",
    to: "/personnalisation",
    cta: "Personnaliser mon magnet",
    children: (
      <>
        Mariage, baptême ou anniversaire — choisis le visuel, le{" "}
        <span className="text-primary">QR Code</span> au dos du magnet te dirigeant vers la
        page de l'événement.
      </>
    ),
  },
  hommage: {
    rectoLabel: "Hommage",
    to: "/catalogue/hommage",
    cta: "Ouvrir le configurateur",
    children: (
      <>
        Crée le magnet hommage — une photo au recto, un texte souvenir au verso.
      </>
    ),
  },
  "fete-meres": {
    rectoLabel: "Fête des mères",
    to: "/catalogue/fete-meres",
    cta: "Voir le catalogue",
    children: (
      <>
        Choisis le visuel pour mamie — Tu auras un{" "}
        <span className="text-primary">QR Code</span> à scanner au dos du magnet, te dirigeant
        vers la page du visuel.
      </>
    ),
  },
  "saint-valentin": {
    rectoLabel: "Saint-Valentin",
    to: "/personnalisation",
    cta: "Personnaliser mon magnet",
    children: (
      <>
        Choisis le visuel pour ta moitié — Tu auras un{" "}
        <span className="text-primary">QR Code</span> à scanner au dos du magnet.
      </>
    ),
  },
  "fin-annee": {
    rectoLabel: "Fêtes de fin d'année",
    to: "/personnalisation",
    cta: "Personnaliser mon magnet",
    children: (
      <>
        Choisis le visuel pour les fêtes — Tu auras un{" "}
        <span className="text-primary">QR Code</span> à scanner au dos du magnet.
      </>
    ),
  },
  "premier-mai": {
    rectoLabel: "1er Mai",
    to: "/personnalisation",
    cta: "Personnaliser mon magnet",
    children: (
      <>
        Choisis le visuel muguet — Tu auras un{" "}
        <span className="text-primary">QR Code</span> à scanner au dos du magnet.
      </>
    ),
  },
};

export const Route = createFileRoute("/collections")({
  validateSearch: zodValidator(searchSchema),
  component: CollectionsPage,
  head: () => ({
    meta: [
      { title: "Collections — Mémora" },
      { name: "description", content: "Découvrez toutes nos collections de magnets photo personnalisés premium." },
    ],
  }),
});

function CollectionsPage() {
  const { famille: active } = Route.useSearch();
  const navigate = useNavigate({ from: "/collections" });
  const setActive = (id: string) => {
    navigate({ search: { famille: id } });
  };


  const data = LOCAL_PRODUCTS;

  const filtered = useMemo(() => {
    const fam = FAMILIES.find((f) => f.id === active);
    if (!fam || fam.tags.length === 0) return data;
    return data.filter((p) => {
      const hay = `${p.node.title} ${p.node.description} ${p.node.handle}`.toLowerCase();
      return fam.tags.some((t) => hay.includes(t.toLowerCase()));
    });
  }, [data, active]);

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-10">
        <p className="eyebrow">Catalogue</p>
        <h1 className="font-display text-5xl mt-3">Toutes nos collections</h1>
        <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
          Magnets photo, prénoms, naissance, mariage et duo — pour chaque souvenir, son écrin.
        </p>
      </div>

      {/* Family chips */}
      <div className="mb-8">
        <FamilyChips active={active} onSelect={setActive} />
      </div>

      {/* Teaser recto/verso + encart pour chaque famille */}
      {FAMILY_TEASERS[active] && <FamilyTeaser {...FAMILY_TEASERS[active]} />}

      {/* Sous-catégories Animaux */}
      {active === "animaux" && (
        <div className="mb-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { to: "/catalogue/animaux/chats", label: "Chats", img: "/images/animaux/chats.png" },
              { to: "/catalogue/animaux/chiens", label: "Chiens", img: "/images/animaux/chiens.png" },
              { to: "/catalogue/animaux/lapins", label: "Lapins", img: "/images/animaux/lapins.png" },
              { to: "/catalogue/animaux/rongeurs", label: "Rongeurs", img: "/images/animaux/rongeurs.png" },
            ].map((s) => (
              <Link key={s.to} to={s.to} className="group block">
                <div className="aspect-square overflow-hidden bg-white border border-border">
                  <img
                    src={s.img}
                    alt={`Catalogue ${s.label}`}
                    loading="lazy"
                    className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
                <p className="mt-3 text-center font-display text-lg group-hover:text-primary transition-colors">
                  {s.label}
                </p>
              </Link>
            ))}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-3xl mx-auto mt-8">
            {[
              { to: "/catalogue/animaux/oiseaux", label: "Oiseaux", img: "/images/animaux/oiseaux.png" },
              { to: "/catalogue/animaux/poissons", label: "Poissons", img: "/images/animaux/poissons.png" },
              { to: "/catalogue/animaux/reptiles", label: "Reptiles", img: "/images/animaux/reptiles.png" },
            ].map((s) => (
              <Link key={s.to} to={s.to} className="group block">
                <div className="aspect-square overflow-hidden bg-white border border-border">
                  <img
                    src={s.img}
                    alt={`Catalogue ${s.label}`}
                    loading="lazy"
                    className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
                  />
                </div>
                <p className="mt-3 text-center font-display text-lg group-hover:text-primary transition-colors">
                  {s.label}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Sous-catégories Fête des prénoms */}
      {active === "prenoms" && (
        <div className="mb-12 grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link to="/catalogue/prenoms/garcons" className="group block">
            <div className="aspect-square overflow-hidden bg-white border border-border">
              <img
                src="/images/prenoms/fabio.png"
                alt="Prénoms garçons"
                loading="lazy"
                className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </div>
            <p className="mt-3 text-center font-display text-lg group-hover:text-primary transition-colors">
              Prénoms garçons
            </p>
          </Link>
          <Link to="/catalogue/prenoms/filles" className="group block">
            <div className="aspect-square overflow-hidden bg-white border border-border">
              <img
                src="/images/prenoms/enea.png"
                alt="Prénoms filles"
                loading="lazy"
                className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </div>
            <p className="mt-3 text-center font-display text-lg group-hover:text-primary transition-colors">
              Prénoms filles
            </p>
          </Link>
        </div>
      )}

      {["prenoms", "animaux", "drapeau-coeur", "hommage", "fete-meres"].includes(active) ? null : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed">
          <h3 className="font-display text-2xl">Aucun produit dans cette famille</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Sélectionnez une autre catégorie ou demandez-moi de créer ces produits.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
          {filtered.map((p) => <ProductCard key={p.node.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
