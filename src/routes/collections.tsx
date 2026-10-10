import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo } from "react";
import { zodValidator, fallback } from "@tanstack/zod-adapter";
import { z } from "zod";
import { ArrowRight, Crown } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { FamilyChips, FAMILIES } from "@/components/site/FamilyChips";
import { LOCAL_PRODUCTS } from "@/data/produits";

const familyIds = FAMILIES.map((f) => f.id) as [string, ...string[]];
const searchSchema = z.object({
  famille: fallback(z.enum(familyIds), "all").default("all"),
});

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
    if (id === "hommage") { navigate({ to: "/catalogue/hommage" }); return; }
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

      {/* Redirect Hommage */}
      {active === "hommage" && (
        <div className="mb-12 flex flex-wrap gap-3">
          <Link
            to="/catalogue/hommage"
            className="group inline-flex items-center gap-2 px-4 h-11 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-sm"
          >
            <span className="text-base">🕊️</span>
            Ouvrir le configurateur Hommage — Magnet rond 37 mm
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      {/* Sous-catégories Fête des mères */}
      {active === "fete-meres" && (
        <div className="mb-12 flex flex-wrap gap-3">
          <Link
            to="/catalogue/fete-meres"
            className="group inline-flex items-center gap-2 px-4 h-11 border border-border bg-background hover:border-primary hover:text-primary transition-colors text-sm"
          >
            <Crown className="h-4 w-4" strokeWidth={1.5} />
            Voir le catalogue Fête des mères &amp; grand-mères
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      )}

      {/* Sous-catégories Fête des prénoms */}
      {active === "prenoms" && (
        <div className="mb-12 grid grid-cols-2 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
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
          <Link to="/catalogue/prenoms/mixtes" className="group block">
            <div className="aspect-square overflow-hidden bg-white border border-border">
              <img
                src="/images/prenoms/sacha.png"
                alt="Prénoms mixtes"
                loading="lazy"
                className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </div>
            <p className="mt-3 text-center font-display text-lg group-hover:text-primary transition-colors">
              Prénoms mixtes
            </p>
          </Link>
        </div>
      )}

      {/* Sous-catégorie Drapeau cœur */}
      {active === "drapeau-coeur" && (
        <div className="mb-12 grid grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link to="/catalogue/drapeau-coeur" className="group block">
            <div className="aspect-square overflow-hidden bg-white border border-border">
              <img
                src="/images/drapeau-coeur/drapeau-coeur.png"
                alt="Catalogue Drapeau cœur"
                loading="lazy"
                className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </div>
            <p className="mt-3 text-center font-display text-lg group-hover:text-primary transition-colors">
              Drapeau cœur
            </p>
          </Link>
          <Link to="/catalogue/drapeau-coeur" className="group block">
            <div className="aspect-square overflow-hidden bg-white border border-border">
              <img
                src="/images/drapeau-coeur/drapeau-coeur-verso.png"
                alt="QR Code Drapeau cœur"
                loading="lazy"
                className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-700 ease-out"
              />
            </div>
            <p className="mt-3 text-center font-display text-lg group-hover:text-primary transition-colors">
              QR Code
            </p>
          </Link>
        </div>
      )}

      {/* Encart d'aide Drapeau cœur */}
      {active === "drapeau-coeur" && (
        <div className="max-w-2xl mx-auto -mt-2 mb-12">
          <Link
            to="/catalogue/drapeau-coeur"
            className="group block border-2 border-primary/40 bg-primary/5 px-8 py-6 text-center hover:border-primary hover:bg-primary/10 transition-colors"
          >
            <p className="font-display text-xl md:text-2xl leading-snug">
              Choisis le pays que tu souhaites — Tu auras un <span className="text-primary">QR Code</span> à scanner
              au dos du magnet, te dirigeant vers la page de recherche du pays.
            </p>
            <p className="mt-3 inline-flex items-center gap-2 text-sm text-primary font-medium">
              Voir les 196 pays <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
