import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, Clock, CheckCircle2, XCircle } from "lucide-react";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Connexion — Mémora" }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Si déjà admin → redirection directe vers l'admin
  useEffect(() => {
    if (!authLoading && user && isAdmin) {
      navigate({ to: "/admin/photos" });
    }
  }, [authLoading, user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connecté");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth` },
        });
        if (error) throw error;
        toast.success("Compte créé — vérifiez vos emails.");
      }
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return <div className="max-w-md mx-auto px-6 py-24 text-center text-muted-foreground">Chargement…</div>;
  }

  // Connecté mais pas admin → panneau "demander le rôle admin"
  if (user && !isAdmin) {
    return <RequestAdminPanel email={user.email ?? ""} />;
  }

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <div className="text-center mb-10">
        <p className="eyebrow">Espace privé</p>
        <h1 className="font-display text-4xl mt-3">
          {mode === "login" ? "Connexion" : "Créer un compte"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" disabled={loading} className="w-full rounded-none h-11">
          {loading ? "..." : mode === "login" ? "Se connecter" : "Créer le compte"}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground mt-6">
        {mode === "login" ? (
          <>Pas encore de compte ? <button onClick={() => setMode("signup")} className="text-primary hover:underline">Créer un compte</button></>
        ) : (
          <>Déjà inscrit ? <button onClick={() => setMode("login")} className="text-primary hover:underline">Se connecter</button></>
        )}
      </p>

      <p className="text-center text-xs text-muted-foreground mt-8">
        <Link to="/" className="hover:underline">← Retour à la boutique</Link>
      </p>
    </div>
  );
}

function RequestAdminPanel({ email }: { email: string }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const { data: latestRequest, isLoading } = useQuery({
    queryKey: ["my_role_request"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("role_requests")
        .select("id, status, created_at, reviewed_at")
        .eq("requested_role", "admin")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const status = latestRequest?.status;
  const hasPending = status === "pending";

  const handleRequest = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Session expirée");
      const { error } = await supabase
        .from("role_requests")
        .insert({ user_id: user.id, requested_role: "admin", message: message || null });
      if (error) throw error;
      toast.success("Demande envoyée — un administrateur va l'examiner.");
      setMessage("");
      qc.invalidateQueries({ queryKey: ["my_role_request"] });
    } catch (err: any) {
      toast.error(err.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-24">
      <div className="text-center mb-8">
        <p className="eyebrow">Espace privé</p>
        <h1 className="font-display text-4xl mt-3">Accès administrateur</h1>
        <p className="text-sm text-muted-foreground mt-3">Connecté en tant que <strong>{email}</strong></p>
      </div>

      <div className="border border-border bg-background p-6">
        {isLoading ? (
          <p className="text-center text-sm text-muted-foreground">Chargement…</p>
        ) : hasPending ? (
          <div className="text-center space-y-3">
            <Clock className="h-10 w-10 mx-auto text-amber-600" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Demande en attente</h2>
            <p className="text-sm text-muted-foreground">
              Votre demande de rôle admin a bien été reçue. Un administrateur va l'examiner prochainement.
            </p>
          </div>
        ) : status === "rejected" ? (
          <div className="text-center space-y-3">
            <XCircle className="h-10 w-10 mx-auto text-destructive" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Demande refusée</h2>
            <p className="text-sm text-muted-foreground">Votre dernière demande a été refusée. Vous pouvez en soumettre une nouvelle.</p>
            <RequestForm message={message} setMessage={setMessage} onSubmit={handleRequest} submitting={submitting} />
          </div>
        ) : status === "approved" ? (
          <div className="text-center space-y-3">
            <CheckCircle2 className="h-10 w-10 mx-auto text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Demande approuvée</h2>
            <p className="text-sm text-muted-foreground">Reconnectez-vous pour activer vos privilèges admin.</p>
            <Button
              onClick={async () => { await supabase.auth.signOut(); qc.clear(); }}
              className="rounded-none w-full h-11 mt-2"
            >
              Se déconnecter
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <ShieldCheck className="h-10 w-10 mx-auto text-primary" strokeWidth={1.5} />
            <h2 className="font-display text-xl">Demander le rôle admin</h2>
            <p className="text-sm text-muted-foreground">
              Votre compte n'a pas encore les droits administrateur. Soumettez une demande pour accéder à la gestion des photos.
            </p>
            <RequestForm message={message} setMessage={setMessage} onSubmit={handleRequest} submitting={submitting} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-6 text-xs text-muted-foreground">
        <button
          onClick={async () => { await supabase.auth.signOut(); qc.clear(); navigate({ to: "/auth" }); }}
          className="hover:underline"
        >
          Se déconnecter
        </button>
        <Link to="/" className="hover:underline">← Boutique</Link>
      </div>
    </div>
  );
}

function RequestForm({
  message, setMessage, onSubmit, submitting,
}: {
  message: string;
  setMessage: (v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
}) {
  return (
    <div className="space-y-3 text-left">
      <div>
        <Label htmlFor="msg" className="text-xs">Message (facultatif)</Label>
        <Input
          id="msg"
          placeholder="Expliquez brièvement pourquoi…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
        />
      </div>
      <Button onClick={onSubmit} disabled={submitting} className="w-full rounded-none h-11">
        {submitting ? "Envoi…" : "Envoyer la demande"}
      </Button>
    </div>
  );
}
