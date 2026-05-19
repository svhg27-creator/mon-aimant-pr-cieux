import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload, Trash2, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { FAMILIES } from "@/components/site/FamilyChips";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/photos")({
  component: AdminPhotosPage,
  head: () => ({ meta: [{ title: "Admin — Photos par famille" }] }),
});

function AdminPhotosPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user, loading, isAdmin } = useAuth();

  const { data: photos, isLoading } = useQuery({
    queryKey: ["family_photos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("family_photos").select("*");
      if (error) throw error;
      return data ?? [];
    },
  });

  if (loading) {
    return <div className="max-w-7xl mx-auto px-6 py-24 text-center text-muted-foreground">Chargement…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Connexion requise</h1>
        <Button asChild className="rounded-none"><Link to="/auth">Se connecter</Link></Button>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <h1 className="font-display text-3xl mb-4">Accès refusé</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Votre compte ({user.email}) n'a pas le rôle <strong>admin</strong>.
          Ajoutez ce rôle depuis la base de données pour accéder à cette page.
        </p>
        <Button
          variant="outline"
          className="rounded-none"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
        >
          Se déconnecter
        </Button>
      </div>
    );
  }

  const photoMap = new Map((photos ?? []).map((p) => [p.family_id, p.photo_url]));
  const items = FAMILIES.filter((f) => f.id !== "all");

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="flex items-center justify-between mb-12">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="font-display text-4xl mt-2">Photos par famille</h1>
          <p className="text-sm text-muted-foreground mt-2">Connecté en tant que {user.email}</p>
        </div>
        <Button
          variant="outline"
          className="rounded-none"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/" });
          }}
        >
          <LogOut className="h-4 w-4 mr-2" /> Déconnexion
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-muted-foreground">Chargement…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((f) => (
            <FamilyPhotoCard
              key={f.id}
              familyId={f.id}
              label={f.label}
              photoUrl={photoMap.get(f.id) ?? null}
              onChange={() => qc.invalidateQueries({ queryKey: ["family_photos"] })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FamilyPhotoCard({
  familyId,
  label,
  photoUrl,
  onChange,
}: {
  familyId: string;
  label: string;
  photoUrl: string | null;
  onChange: () => void;
}) {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${familyId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("family-photos")
        .upload(path, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from("family-photos").getPublicUrl(path);
      const url = pub.publicUrl;

      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbErr } = await supabase
        .from("family_photos")
        .upsert({ family_id: familyId, photo_url: url, updated_by: user?.id });
      if (dbErr) throw dbErr;

      toast.success("Photo mise à jour");
      onChange();
    } catch (err: any) {
      toast.error(err.message || "Erreur upload");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleRemove = async () => {
    if (!confirm(`Supprimer la photo de "${label}" ?`)) return;
    try {
      const { error } = await supabase
        .from("family_photos")
        .update({ photo_url: null })
        .eq("family_id", familyId);
      if (error) throw error;
      toast.success("Photo supprimée");
      onChange();
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    }
  };

  return (
    <div className="bg-background border border-border p-3 pb-4">
      <div className="aspect-square bg-muted relative overflow-hidden">
        {photoUrl ? (
          <img src={photoUrl} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-muted-foreground text-xs">
            Aucune photo
          </div>
        )}
      </div>
      <h3 className="font-display text-sm mt-3 text-center leading-tight min-h-[2.5rem]">{label}</h3>
      <div className="mt-3 flex gap-2">
        <label className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
          <span className="cursor-pointer inline-flex items-center justify-center gap-1 w-full h-9 border border-primary/40 text-primary text-xs hover:bg-primary/5 transition-colors">
            <Upload className="h-3.5 w-3.5" />
            {uploading ? "..." : photoUrl ? "Remplacer" : "Ajouter"}
          </span>
        </label>
        {photoUrl && (
          <button
            onClick={handleRemove}
            className="h-9 w-9 grid place-items-center border border-border hover:border-destructive hover:text-destructive transition-colors"
            title="Supprimer"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
