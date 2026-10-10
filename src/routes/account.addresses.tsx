import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses, useAddressMutations, type Address } from "@/hooks/useAddresses";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { MapPin, Plus, Pencil, Trash2, Star, Check } from "lucide-react";

export const Route = createFileRoute("/account/addresses")({
  component: AddressesPage,
  head: () => ({ meta: [{ title: "Mes adresses — Mémora" }] }),
});

const addressSchema = z.object({
  type: z.enum(["billing", "shipping"]),
  label: z.string().min(1, "Nommez cette adresse"),
  first_name: z.string().min(1, "Prénom requis"),
  last_name: z.string().min(1, "Nom requis"),
  company: z.string().optional().or(z.literal("")),
  address_line1: z.string().min(1, "Adresse requise"),
  address_line2: z.string().optional().or(z.literal("")),
  city: z.string().min(1, "Ville requise"),
  postal_code: z.string().min(1, "Code postal requis"),
  country: z.string().min(2).max(2),
  phone: z.string().optional().or(z.literal("")),
  is_default: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

function AddressesPage() {
  const { user } = useAuth();
  const userId = user?.id;
  const { data: addresses, isLoading } = useAddresses(userId);
  const { create, update, remove, setDefault } = useAddressMutations(userId!);
  const [editing, setEditing] = useState<Address | null>(null);
  const [open, setOpen] = useState(false);

  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema) as any,
    defaultValues: {
      type: "shipping",
      label: "",
      first_name: "",
      last_name: "",
      company: "",
      address_line1: "",
      address_line2: "",
      city: "",
      postal_code: "",
      country: "FR",
      phone: "",
      is_default: false,
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        type: editing.type,
        label: editing.label || "",
        first_name: editing.first_name || "",
        last_name: editing.last_name || "",
        company: editing.company || "",
        address_line1: editing.address_line1,
        address_line2: editing.address_line2 || "",
        city: editing.city,
        postal_code: editing.postal_code,
        country: editing.country,
        phone: editing.phone || "",
        is_default: editing.is_default,
      });
    } else {
      form.reset({
        type: "shipping",
        label: "",
        first_name: "",
        last_name: "",
        company: "",
        address_line1: "",
        address_line2: "",
        city: "",
        postal_code: "",
        country: "FR",
        phone: "",
        is_default: false,
      });
    }
  }, [editing, form]);

  const onSubmit = async (values: AddressFormValues) => {
    const payload = {
      type: values.type,
      label: values.label,
      first_name: values.first_name,
      last_name: values.last_name,
      company: values.company || null,
      address_line1: values.address_line1,
      address_line2: values.address_line2 || null,
      city: values.city,
      postal_code: values.postal_code,
      country: values.country,
      phone: values.phone || null,
      is_default: values.is_default,
    };
    try {
      if (editing) {
        await update.mutateAsync({ id: editing.id, ...payload });
        toast.success("Adresse mise à jour");
      } else {
        await create.mutateAsync(payload);
        toast.success("Adresse ajoutée");
      }
      setOpen(false);
      setEditing(null);
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette adresse ?")) return;
    try {
      await remove.mutateAsync(id);
      toast.success("Adresse supprimée");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const handleSetDefault = async (id: string, type: Address["type"]) => {
    try {
      await setDefault.mutateAsync({ id, type });
      toast.success("Adresse par défaut mise à jour");
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  const billingAddresses = addresses?.filter((a) => a.type === "billing") ?? [];
  const shippingAddresses = addresses?.filter((a) => a.type === "shipping") ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Mes adresses</h1>
          <p className="text-muted-foreground mt-1">Gérez vos adresses de facturation et de livraison.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-none" onClick={() => setEditing(null)}>
              <Plus className="h-4 w-4 mr-2" /> Ajouter une adresse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg rounded-none">
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                {editing ? "Modifier l’adresse" : "Nouvelle adresse"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v as any)}>
                    <SelectTrigger id="type" className="rounded-none">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="shipping">Livraison</SelectItem>
                      <SelectItem value="billing">Facturation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="label">Nom de l’adresse</Label>
                  <Input id="label" {...form.register("label")} placeholder="Domicile, Bureau…" />
                  {form.formState.errors.label && <p className="text-xs text-destructive">{form.formState.errors.label.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="company">Société (facultatif)</Label>
                <Input id="company" {...form.register("company")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line1">Adresse</Label>
                <Input id="address_line1" {...form.register("address_line1")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address_line2">Complément</Label>
                <Input id="address_line2" {...form.register("address_line2")} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label htmlFor="postal_code">Code postal</Label>
                  <Input id="postal_code" {...form.register("postal_code")} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" {...form.register("city")} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Pays (ISO 2)</Label>
                  <Input id="country" maxLength={2} {...form.register("country")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" {...form.register("phone")} />
                </div>
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">Adresse par défaut</p>
                  <p className="text-sm text-muted-foreground">Utiliser comme adresse principale pour ce type.</p>
                </div>
                <Switch
                  checked={form.watch("is_default")}
                  onCheckedChange={(v) => form.setValue("is_default", v)}
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" className="rounded-none" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" className="rounded-none" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Enregistrement…" : (editing ? "Mettre à jour" : "Ajouter")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>
      ) : (
        <div className="space-y-8">
          <AddressGroup
            title="Adresses de livraison"
            icon={MapPin}
            addresses={shippingAddresses}
            onEdit={(a) => { setEditing(a); setOpen(true); }}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
          <AddressGroup
            title="Adresses de facturation"
            icon={MapPin}
            addresses={billingAddresses}
            onEdit={(a) => { setEditing(a); setOpen(true); }}
            onDelete={handleDelete}
            onSetDefault={handleSetDefault}
          />
        </div>
      )}
    </div>
  );
}

function AddressGroup({
  title,
  addresses,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  title: string;
  icon: any;
  addresses: Address[];
  onEdit: (a: Address) => void;
  onDelete: (id: string) => void;
  onSetDefault: (id: string, type: Address["type"]) => void;
}) {
  return (
    <Card className="rounded-none border shadow-none">
      <CardHeader className="pb-3">
        <CardTitle className="font-display text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {addresses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4">Aucune adresse enregistrée.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="border p-4 space-y-2 relative">
                {address.is_default && (
                  <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1">
                    <Star className="h-3 w-3" /> Par défaut
                  </span>
                )}
                <p className="font-medium">{address.label}</p>
                <p className="text-sm text-muted-foreground">
                  {address.first_name} {address.last_name}<br />
                  {address.company && <>{address.company}<br /></>}
                  {address.address_line1}<br />
                  {address.address_line2 && <>{address.address_line2}<br /></>}
                  {address.postal_code} {address.city}, {address.country}
                </p>
                <div className="flex gap-2 pt-2">
                  <Button variant="ghost" size="sm" className="rounded-none h-8" onClick={() => onEdit(address)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="rounded-none h-8" onClick={() => onDelete(address.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                  {!address.is_default && (
                    <Button variant="ghost" size="sm" className="rounded-none h-8" onClick={() => onSetDefault(address.id, address.type)}>
                      <Check className="h-4 w-4" /> Définir par défaut
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
