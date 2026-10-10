import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Profile {
  id: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  phone: string | null;
  birth_date: string | null;
  language: string;
  gdpr_consent: boolean;
  gdpr_consent_at: string | null;
  marketing_email: boolean;
  marketing_sms: boolean;
  marketing_push: boolean;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string;
}

export function useProfile(userId: string | undefined) {
  return useQuery({
    queryKey: ["profile", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId!)
        .single();
      if (error) throw error;
      return data as Profile;
    },
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      userId,
      profile,
    }: {
      userId: string;
      profile: Partial<Profile>;
    }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update({ ...profile, updated_at: new Date().toISOString() })
        .eq("id", userId)
        .select()
        .single();
      if (error) throw error;
      return data as Profile;
    },
    onSuccess: (_, { userId }) => {
      qc.invalidateQueries({ queryKey: ["profile", userId] });
    },
  });
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: string;
  language: string;
  currency: string;
  email_notifications: boolean;
  sms_notifications: boolean;
  push_notifications: boolean;
}

export function useUserPreferences(userId: string | undefined) {
  return useQuery({
    queryKey: ["user-preferences", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", userId!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as UserPreferences | null;
    },
  });
}
