import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({ meta: [{ title: "Connexion — Mémora" }] }),
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin/photos" });
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Connecté");
        navigate({ to: "/admin/photos" });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin/photos` },
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
