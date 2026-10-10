import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gift, Share2, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/account/loyalty")({
  component: LoyaltyPage,
  head: () => ({ meta: [{ title: "Fidélité & Parrainage — Mémora" }] }),
});

function LoyaltyPage() {
  const copyCode = () => {
    navigator.clipboard.writeText("MONAIMANT");
    toast.success("Code copié !");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Fidélité & parrainage</h1>
        <p className="text-muted-foreground mt-1">Gagnez des récompenses à chaque commande et en parrainant vos proches.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-none border shadow-none md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" /> Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-display font-semibold">0</p>
            <p className="text-sm text-muted-foreground">points fidélité accumulés</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border shadow-none md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <Gift className="h-5 w-5 text-primary" /> Parrainage
            </CardTitle>
            <CardDescription>Partagez votre code et recevez un crédit à chaque première commande.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input value="MONAIMANT" readOnly className="rounded-none font-mono" />
              <Button variant="outline" className="rounded-none" onClick={copyCode}>
                <Share2 className="h-4 w-4 mr-2" /> Copier
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Le programme complet sera activé prochainement.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl">Historique des récompenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune récompense pour le moment.</p>
        </CardContent>
      </Card>
    </div>
  );
}
