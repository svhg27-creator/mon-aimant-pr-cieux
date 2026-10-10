import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Order {
  id: string;
  status: string;
  amount_total: number;
  currency: string;
  order_number: string | null;
  created_at: string;
  updated_at: string;
  stripe_checkout_session_id: string;
  shipping_carrier: string | null;
  tracking_number: string | null;
  estimated_delivery_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  metadata: any;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  product_image_url: string | null;
  customization: any;
}

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_intent_id: string | null;
  stripe_charge_id: string | null;
  amount: number;
  currency: string;
  status: string;
  receipt_url: string | null;
  payment_method: string | null;
  refunded_amount: number;
  created_at: string;
}

export function useOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["orders", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });
}

export function useOrder(userId: string | undefined, orderId: string | undefined) {
  return useQuery({
    queryKey: ["order", userId, orderId],
    enabled: !!userId && !!orderId,
    queryFn: async () => {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId!)
        .eq("user_id", userId!)
        .single();
      if (orderError) throw orderError;

      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId!);
      if (itemsError) throw itemsError;

      const { data: payments, error: paymentsError } = await supabase
        .from("payments")
        .select("*")
        .eq("order_id", orderId!);
      if (paymentsError) throw paymentsError;

      return {
        order: order as Order,
        items: (items ?? []) as OrderItem[],
        payments: (payments ?? []) as Payment[],
      };
    },
  });
}

export function useRequestRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ orderId, reason }: { orderId: string; reason: string }) => {
      const { data, error } = await supabase.functions.invoke("request-refund", {
        body: { order_id: orderId, reason },
      });
      if (error) throw new Error(error.message || "Erreur lors de la demande");
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
