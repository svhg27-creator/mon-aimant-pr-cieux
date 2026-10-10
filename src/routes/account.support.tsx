import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useCreateSupportTicket, useSupportTickets } from "@/hooks/useSupportTickets";
import { toast } from "sonner";
import { LifeBuoy, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/account/support")({
  component: SupportPage,
  head: () => ({ meta: [{ title: "Support — Mémora" }] }),
});

function SupportPage() {
  const { user } = useAuth();
  const { data: tickets, isLoading } = useSupportTickets(user?.id);
  const createTicket = useCreateSupportTicket(user?.id);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Renseignez le sujet et votre message.");
      return;
    }

    try {
      await createTicket.mutateAsync({ subject: subject.trim(), message: message.trim() });
      setSubject("");
      setMessage("");
      toast.success("Votre demande a été envoyée.");
    } catch (error: any) {
      toast.error(error.message || "Impossible d’envoyer votre demande.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Support client</h1>
        <p className="text-muted-foreground mt-1">Contactez-nous ou consultez l’historique de vos demandes.</p>
      </div>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" /> Nouveau ticket
          </CardTitle>
          <CardDescription>Décrivez votre demande, nous vous répondrons sous 24 h ouvrées.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="subject">Sujet</Label>
              <Input id="subject" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Ex : question sur ma commande" className="rounded-none" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Détaillez votre demande…" className="rounded-none min-h-32" />
            </div>
            <Button type="submit" className="rounded-none" disabled={createTicket.isPending}>
              <LifeBuoy className="h-4 w-4 mr-2" /> {createTicket.isPending ? "Envoi…" : "Envoyer"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-none border shadow-none">
        <CardHeader className="pb-3">
          <CardTitle className="font-display text-xl">Historique</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3"><Skeleton className="h-16" /><Skeleton className="h-16" /></div>
          ) : !tickets?.length ? (
            <p className="text-sm text-muted-foreground">Vous n’avez aucune demande en cours.</p>
          ) : (
            <div className="divide-y">
              {tickets.map((ticket) => (
                <div key={ticket.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-4 first:pt-0">
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground">Ouvert le {new Date(ticket.created_at).toLocaleDateString("fr-FR", { dateStyle: "long" })}</p>
                  </div>
                  <span className="text-sm capitalize bg-muted px-2.5 py-1 w-fit">{ticket.status === "open" ? "Ouvert" : ticket.status === "waiting" ? "En attente" : "Fermé"}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
