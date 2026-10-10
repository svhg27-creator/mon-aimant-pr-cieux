import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useProfile, useUserPreferences, type Profile, type UserPreferences } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Save, Lock, User } from "lucide-react";

export const Route = createFileRoute("/account/profile")({
  component: ProfilePage,
  head: () => ({ meta: [{ title: "Mon profil — Mémora" }] }),
});

const profileSchema = z.object({
  first_name: z.string().optional().or(z.literal("")),
  last_name: z.string().optional().or(z.literal("")),
  display_name: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  birth_date: z.string().optional().or(z.literal("")),
  address_line1: z.string().optional().or(z.literal("")),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().optional().or(z.literal("")),
  postal_code: z.string().optional().or(z.literal("")),
  country: z.string().min(2).max(2),
  language: z.string(),
  gdpr_consent: z.boolean(),
  marketing_email: z.boolean(),
  marketing_sms: z.boolean(),
  marketing_push: z.boolean(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function ProfilePage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: profile, isLoading: profileLoading } = useProfile(userId);
  const { data: preferences, isLoading: prefsLoading } = useUserPreferences(userId);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema) as any,
    defaultValues: {
      first_name: "",
      last_name: "",
      display_name: "",
      phone: "",
      birth_date: "",
      address_line1: "",
      address_line2: "",
      city: "",
      postal_code: "",
      country: "FR",
      language: "fr",
      gdpr_consent: false,
      marketing_email: false,
      marketing_sms: false,
      marketing_push: false,
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        display_name: profile.display_name || "",
        phone: profile.phone || "",
        birth_date: profile.birth_date ? profile.birth_date.slice(0, 10) : "",
        address_line1: profile.address_line1 || "",
        address_line2: profile.address_line2 || "",
        city: profile.city || "",
        postal_code: profile.postal_code || "",
        country: profile.country || "FR",
        language: profile.language || "fr",
        gdpr_consent: profile.gdpr_consent,
        marketing_email: profile.marketing_email,
        marketing_sms: profile.marketing_sms,
        marketing_push: profile.marketing_push,
      });
    }
    if (preferences) {
      form.setValue("language", preferences.language);
    }
  }, [profile, preferences, form]);

  const onSubmit = async (values: ProfileFormValues) => {
    if (!userId) return;
    try {
      const profileUpdate: Partial<Profile> = {
        first_name: values.first_name || null,
        last_name: values.last_name || null,
        display_name: values.display_name || null,
        phone: values.phone || null,
        birth_date: values.birth_date || null,
        address_line1: values.address_line1 || null,
        address_line2: values.address_line2 || null,
        city: values.city || null,
        postal_code: values.postal_code || null,
        country: values.country,
        language: values.language,
        gdpr_consent: values.gdpr_consent,
        marketing_email: values.marketing_email,
        marketing_sms: values.marketing_sms,
        marketing_push: values.marketing_push,
      };

      const { error: profileError } = await supabase
        .from("profiles")
        .update({ ...profileUpdate, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (profileError) throw profileError;

      const prefsUpdate: Partial<UserPreferences> = {
        language: values.language,
      };

      const { error: prefsError } = await supabase
        .from("user_preferences")
        .upsert({ user_id: userId, ...prefsUpdate }, { onConflict: "user_id" });

      if (prefsError) throw prefsError;

      toast.success("Profil mis à jour");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la mise à jour");
    }
  };

  const handlePasswordChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("new_password") as string;
    const confirm = formData.get("confirm_password") as string;
    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else toast.success("Mot de passe mis à jour");
    (e.target as HTMLFormElement).reset();
  };

  if (profileLoading || prefsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl">Mon profil</h1>
        <p className="text-muted-foreground mt-1">Gérez vos informations personnelles et préférences.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="rounded-none border shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl flex items-center gap-2">
              <User className="h-5 w-5 text-primary" /> Identité
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Prénom</Label>
                <Input id="first_name" {...form.register("first_name")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Nom</Label>
                <Input id="last_name" {...form.register("last_name")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="display_name">Pseudo affiché</Label>
              <Input id="display_name" {...form.register("display_name")} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input id="phone" {...form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Date de naissance</Label>
                <Input id="birth_date" type="date" {...form.register("birth_date")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Langue</Label>
              <Select
                value={form.watch("language")}
                onValueChange={(v) => form.setValue("language", v)}
              >
                <SelectTrigger id="language" className="rounded-none">
                  <SelectValue placeholder="Langue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl">Adresse par défaut</CardTitle>
            <CardDescription>Utilisée pour la facturation et la livraison si aucune autre adresse n’est sélectionnée.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address_line1">Adresse</Label>
              <Input id="address_line1" {...form.register("address_line1")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address_line2">Complément</Label>
              <Input id="address_line2" {...form.register("address_line2")} />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="city">Ville</Label>
                <Input id="city" {...form.register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postal_code">Code postal</Label>
                <Input id="postal_code" {...form.register("postal_code")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Pays</Label>
                <Input id="country" maxLength={2} {...form.register("country")} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-none border shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-xl">Préférences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Consentement RGPD</p>
                <p className="text-sm text-muted-foreground">J’accepte l’utilisation de mes données.</p>
              </div>
              <Switch
                checked={form.watch("gdpr_consent")}
                onCheckedChange={(v) => form.setValue("gdpr_consent", v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Emails marketing</p>
                <p className="text-sm text-muted-foreground">Offres et nouveautés par email.</p>
              </div>
              <Switch
                checked={form.watch("marketing_email")}
                onCheckedChange={(v) => form.setValue("marketing_email", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">SMS marketing</p>
                <p className="text-sm text-muted-foreground">Promotions par SMS.</p>
              </div>
              <Switch
                checked={form.watch("marketing_sms")}
                onCheckedChange={(v) => form.setValue("marketing_sms", v)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications push</p>
                <p className="text-sm text-muted-foreground">Alertes commande sur navigateur.</p>
              </div>
              <Switch
                checked={form.watch("marketing_push")}
                onCheckedChange={(v) => form.setValue("marketing_push", v)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="rounded-none" disabled={form.formState.isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {form.formState.isSubmitting ? "Enregistrement…" : "Enregistrer les modifications"}
          </Button>
        </div>
      </form>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-4">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <Lock className="h-5 w-5 text-primary" /> Sécurité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="new_password">Nouveau mot de passe</Label>
              <Input id="new_password" name="new_password" type="password" minLength={6} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
              <Input id="confirm_password" name="confirm_password" type="password" required />
            </div>
            <Button type="submit" variant="outline" className="rounded-none">
              Changer le mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
