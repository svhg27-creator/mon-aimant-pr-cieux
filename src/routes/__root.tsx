import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet, Link, createRootRouteWithContext, useRouter,
  HeadContent, Scripts,
} from "@tanstack/react-router";
import appCss from "../styles.css?url";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { Toaster } from "@/components/ui/sonner";
import { useCartSync } from "@/hooks/useCartSync";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="eyebrow">Erreur 404</p>
        <h1 className="font-display text-5xl mt-3">Page introuvable</h1>
        <p className="mt-3 text-muted-foreground">Cette page n'existe pas ou a été déplacée.</p>
        <Link
          to="/"
          className="inline-flex mt-6 items-center justify-center bg-primary text-primary-foreground px-6 py-3 text-sm hover:bg-primary/90 transition-colors"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Cette page n'a pas pu charger</h1>
        <p className="mt-2 text-sm text-muted-foreground">Une erreur est survenue.</p>
        <div className="mt-6 flex gap-2 justify-center">
          <button
            onClick={() => { router.invalidate(); reset(); }}
            className="bg-primary text-primary-foreground px-5 py-2.5 text-sm hover:bg-primary/90"
          >
            Réessayer
          </button>
          <a href="/" className="border border-input px-5 py-2.5 text-sm hover:bg-accent hover:text-accent-foreground">
            Accueil
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Mémora — Magnets personnalisés premium" },
      { name: "description", content: "Transformez vos plus beaux souvenirs en magnets photo artisanaux. Fabrication française, livraison 48h." },
      { property: "og:title", content: "Mémora — Magnets personnalisés premium" },
      { property: "og:description", content: "L'art de transformer vos moments numériques en objets d'exception." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <CartSyncWrapper>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1"><Outlet /></main>
          <Footer />
        </div>
        <Toaster position="top-center" />
      </CartSyncWrapper>
    </QueryClientProvider>
  );
}

function CartSyncWrapper({ children }: { children: React.ReactNode }) {
  useCartSync();
  return <>{children}</>;
}
