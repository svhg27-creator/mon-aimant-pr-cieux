import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Sparkles } from "lucide-react";

export const Route = createFileRoute("/account/creations")({
  component: CreationsPage,
  head: () => ({ meta: [{ title: "Mes créations — Mémora" }] }),
});

function CreationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Mes créations</h1>
        <p className="text-muted-foreground mt-1">Retrouvez vos magnets personnalisés sauvegardés.</p>
      </div>
      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" /> Créations enregistrées
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12 text-muted-foreground">
          <p className="mb-4">Cette section sera bientôt alimentée avec l’éditeur de magnets.</p>
          <Button asChild className="rounded-none">
            <Link to={"/personnalisation" as any}>
              <Sparkles className="h-4 w-4 mr-2" /> Créer un magnet
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
