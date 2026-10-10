import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag } from "lucide-react";

export const Route = createFileRoute("/account/favorites")({
  component: FavoritesPage,
  head: () => ({ meta: [{ title: "Mes favoris — Mémora" }] }),
});

function FavoritesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Liste d’envies</h1>
        <p className="text-muted-foreground mt-1">Les articles et créations que vous avez aimés.</p>
      </div>
      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" /> Favoris
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          <p className="mb-4">Vous n’avez encore rien ajouté à votre liste d’envies.</p>
          <Button asChild variant="outline" className="rounded-none">
            <Link to={"/collections" as any}>
              <ShoppingBag className="h-4 w-4 mr-2" /> Parcourir la boutique
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
