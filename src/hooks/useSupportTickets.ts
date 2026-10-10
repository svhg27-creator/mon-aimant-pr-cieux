import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  category: string | null;
  status: "open" | "waiting" | "closed";
  priority: "low" | "medium" | "high";
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
}

export function useSupportTickets(userId: string | undefined) {
  return useQuery({
    queryKey: ["support-tickets", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", userId!)
        .order("updated_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as SupportTicket[];
    },
  });
}

export function useCreateSupportTicket(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ subject, message }: { subject: string; message: string }) => {
      if (!userId) throw new Error("Vous devez être connecté pour contacter le support.");

      const { data: ticket, error: ticketError } = await supabase
        .from("support_tickets")
        .insert({ user_id: userId, subject, last_message_at: new Date().toISOString() })
        .select()
        .single();

      if (ticketError) throw ticketError;

      const { error: messageError } = await supabase
        .from("support_messages")
        .insert({ ticket_id: ticket.id, sender_type: "user", content: message });

      if (messageError) throw messageError;
      return ticket as SupportTicket;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets", userId] });
    },
  });
}
