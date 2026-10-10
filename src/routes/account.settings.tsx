import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings, Moon, Globe, Bell, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/account/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Paramètres — Mémora" }] }),
});

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Paramètres</h1>
        <p className="text-muted-foreground mt-1">Personnalisez votre expérience et gérez vos données.</p>
      </div>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Moon className="h-5 w-5 text-primary" /> Apparence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Mode sombre</p>
              <p className="text-sm text-muted-foreground">Activer le thème sombre (implémentation à venir).</p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" /> Langue & devise
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Français / EUR. Le choix multilingue sera activé prochainement.</p>
        </CardContent>
      </Card>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Notifications
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Emails de commande</p>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Offres promotionnelles</p>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-none border shadow-none border-destructive/20">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" /> Zone sensible
          </CardTitle>
          <CardDescription>Demandez l’export ou la suppression de vos données personnelles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="rounded-none" disabled>Télécharger mes données (RGPD)</Button>
          <Button variant="destructive" className="rounded-none" disabled>Supprimer mon compte</Button>
        </CardContent>
      </Card>
    </div>
  );
}
