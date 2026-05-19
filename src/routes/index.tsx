import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Magnet, Gift, Truck, Factory } from "lucide-react";
import { storefrontApiRequest, PRODUCTS_QUERY, formatPrice, type ShopifyProduct } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import { FamilyChips } from "@/components/site/FamilyChips";
import heroKitchen from "@/assets/hero-kitchen.jpg";

function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "home"],
    queryFn: async () => {
      const res = await storefrontApiRequest(PRODUCTS_QUERY, { first: 8, query: null });
      return (res?.data?.products?.edges ?? []) as ShopifyProduct[];
    },
  });

  return (
    <div>
      {/* HERO */}
      <section className="relative">
        <div className="relative h-[560px] md:h-[640px] overflow-hidden">
          <img
            src={heroKitchen}
            alt="Cuisine élégante avec magnets Mémora"
            width={1920}
            height={1080}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/40 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-6 h-full flex items-center">
            <div className="max-w-xl">
              <p className="eyebrow">Édition Printemps 2026</p>
              <h1 className="font-display text-5xl md:text-6xl leading-[1.05] mt-4">
                Vos plus beaux moments,<br/>
                <span className="italic text-primary">fixés avec élégance.</span>
              </h1>
              <p className="mt-5 text-foreground/80 leading-relaxed max-w-md">
                Transformez vos souvenirs numériques en objets tactiles d'exception. Des magnets artisanaux conçus pour durer et embellir votre quotidien.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="rounded-none h-12 bg-primary hover:bg-primary/90">
                  <Link to="/personnalisation">Personnaliser mes magnets <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="rounded-none h-12 border-primary/30 text-primary hover:bg-primary/5">
                  <Link to="/collections">Découvrir la collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAMILY CHIPS */}
      <section className="max-w-7xl mx-auto px-6 pt-10">
        <FamilyChips linkMode />
      </section>

      {/* 3 STEPS */}
      <section className="bg-secondary/40 mt-24 py-20">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl">Trois étapes vers votre héritage digital</h2>
          <div className="grid md:grid-cols-3 gap-10 mt-14">
            {[
              { icon: Sparkles, t: "Sélectionnez vos photos", d: "Importez vos clichés préférés directement depuis votre téléphone ou Instagram." },
              { icon: Magnet, t: "Personnalisez le style", d: "Choisissez vos formats, cadres et filtres pour un rendu unique et haut de gamme." },
              { icon: Gift, t: "Recevez votre écrin", d: "Vos magnets arrivent dans un packaging élégant, prêts à être exposés ou offerts." },
            ].map((s) => (
              <div key={s.t}>
                <div className="mx-auto w-14 h-14 grid place-items-center bg-background border border-border">
                  <s.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-lg mt-5">{s.t}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS FROM SHOPIFY */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <p className="eyebrow">Nouveautés</p>
          <h2 className="font-display text-4xl mt-2">Mémora dans vos intérieurs</h2>
          <p className="text-muted-foreground mt-3">Partagé par notre communauté avec amour.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-border">
            <h3 className="font-display text-2xl">No products found</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
              Aucun produit pour l'instant. Décrivez votre premier magnet dans le chat (nom, prix, description) et je le crée pour vous.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.map((product) => (
              <Link
                key={product.node.id}
                to="/product/$handle"
                params={{ handle: product.node.handle }}
                className="group"
              >
                <div className="aspect-square overflow-hidden bg-muted">
                  {product.node.images.edges[0]?.node && (
                    <img
                      src={product.node.images.edges[0].node.url}
                      alt={product.node.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  )}
                </div>
                <div className="pt-4">
                  <h3 className="font-display text-lg group-hover:text-primary transition-colors">{product.node.title}</h3>
                  <p className="text-sm text-primary mt-1">
                    {formatPrice(product.node.priceRange.minVariantPrice.amount, product.node.priceRange.minVariantPrice.currencyCode)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* REASSURANCE */}
      <section className="bg-secondary/40 py-16">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10 text-center md:text-left">
          {[
            { i: Sparkles, t: "Impression premium mate", d: "Un rendu velouté qui sublime chaque détail sans reflets indésirables." },
            { i: Magnet, t: "Aimant ultra-puissant", d: "Conçu pour tenir fermement sur toutes vos surfaces métalliques préférées." },
            { i: Gift, t: "Packaging écrin", d: "Chaque commande arrive dans un coffret haut de gamme prêt à être offert." },
          ].map((r) => (
            <div key={r.t} className="flex flex-col md:flex-row gap-4">
              <r.i className="h-6 w-6 text-primary shrink-0 mx-auto md:mx-0" strokeWidth={1.5} />
              <div>
                <h4 className="font-medium">{r.t}</h4>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{r.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DELIVERY BAND */}
      <section className="max-w-7xl mx-auto px-6 py-12 flex flex-wrap justify-center gap-x-12 gap-y-3 text-sm text-foreground/80">
        <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-primary" strokeWidth={1.5} /> Livraison 48h en France</div>
        <div className="flex items-center gap-2"><Factory className="h-4 w-4 text-primary" strokeWidth={1.5} /> Fabrication française</div>
        <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" strokeWidth={1.5} /> Satisfait ou remboursé 30 jours</div>
      </section>
    </div>
  );
}
