import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Address {
  id: string;
  user_id: string;
  type: "billing" | "shipping";
  label: string | null;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  address_line1: string;
  address_line2: string | null;
  city: string;
  postal_code: string;
  country: string;
  phone: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export function useAddresses(userId: string | undefined) {
  return useQuery({
    queryKey: ["addresses", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", userId!)
        .order("is_default", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Address[];
    },
  });
}

export function useAddressMutations(userId: string) {
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: async (address: Omit<Address, "id" | "user_id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("addresses")
        .insert({ ...address, user_id: userId })
        .select()
        .single();
      if (error) throw error;

      if (address.is_default) {
        const { error: defaultError } = await supabase
          .from("addresses")
          .update({ is_default: false, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("type", address.type)
          .neq("id", data.id);
        if (defaultError) throw defaultError;
      }

      return data as Address;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses", userId] }),
  });

  const update = useMutation({
    mutationFn: async ({ id, ...address }: Partial<Address> & { id: string }) => {
      const { data, error } = await supabase
        .from("addresses")
        .update({ ...address, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;

      if (address.is_default) {
        const { error: defaultError } = await supabase
          .from("addresses")
          .update({ is_default: false, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .eq("type", data.type)
          .neq("id", id);
        if (defaultError) throw defaultError;
      }

      return data as Address;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses", userId] }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("addresses").delete().eq("id", id).eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses", userId] }),
  });

  const setDefault = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: Address["type"] }) => {
      await supabase
        .from("addresses")
        .update({ is_default: false, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .eq("type", type)
        .neq("id", id);
      const { data, error } = await supabase
        .from("addresses")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data as Address;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["addresses", userId] }),
  });

  return { create, update, remove, setDefault };
}
