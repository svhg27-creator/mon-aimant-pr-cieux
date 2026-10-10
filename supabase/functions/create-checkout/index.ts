import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";
import Stripe from "https://esm.sh/stripe@13.10.0";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing environment variables");
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" });

const allowedOrigins = new Set([
  "https://speedvision70.com",
  "https://www.speedvision70.com",
  "https://speedvision70.netlify.app",
  "https://lustrous-biscotti-931bec.netlify.app",
  "http://localhost:5173",
  "http://localhost:3000",
]);

function getAllowedOrigin(origin: string | null): string | null {
  if (!origin) return null;
  if (allowedOrigins.has(origin)) return origin;
  if (origin.endsWith(".netlify.app")) return origin;
  return null;
}

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = getAllowedOrigin(origin);
  return {
    "Access-Control-Allow-Origin": allowedOrigin || "https://speedvision70.com",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

interface CartItemRequest {
  product_id: string;
  quantity: number;
}

interface Product {
  id: string;
  name: string;
  unit_price: number;
  currency: string;
}

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (!getAllowedOrigin(origin)) {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { items, success_url, cancel_url }: {
      items: CartItemRequest[];
      success_url: string;
      cancel_url: string;
    } = body;

    if (!Array.isArray(items) || items.length === 0 || items.length > 25 || !success_url || !cancel_url) {
      return new Response(JSON.stringify({ error: "Invalid payload" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let successUrl: URL;
    let cancelUrl: URL;
    try {
      successUrl = new URL(success_url);
      cancelUrl = new URL(cancel_url);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid redirect URL" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (successUrl.origin !== cancelUrl.origin || !allowedOrigins.has(successUrl.origin)) {
      return new Response(JSON.stringify({ error: "Invalid redirect URL origin" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const quantities = new Map<string, number>();
    for (const item of items) {
      if (!item || typeof item.product_id !== "string" || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) {
        return new Response(JSON.stringify({ error: "Invalid cart item" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const quantity = (quantities.get(item.product_id) ?? 0) + item.quantity;
      if (quantity > 20) {
        return new Response(JSON.stringify({ error: "Maximum quantity per product is 20" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      quantities.set(item.product_id, quantity);
    }

    const productIds = [...quantities.keys()];
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, name, unit_price, currency")
      .in("id", productIds)
      .eq("is_active", true);

    if (productsError || !products || products.length !== productIds.length) {
      return new Response(JSON.stringify({ error: "One or more products are unavailable" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productRows = products as Product[];
    const productsById = new Map(productRows.map((product) => [product.id, product]));
    const currency = productRows[0].currency;
    if (productRows.some((product) => product.currency !== currency)) {
      return new Response(JSON.stringify({ error: "All products must use the same currency" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const orderItems = productIds.map((productId) => {
      const product = productsById.get(productId)!;
      return {
        product_id: product.id,
        product_name: product.name,
        quantity: quantities.get(product.id)!,
        unit_price: product.unit_price,
      };
    });

    const total = orderItems.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const lineItems = orderItems.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.product_name },
        unit_amount: item.unit_price,
      },
      quantity: item.quantity,
    }));

    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      line_items: lineItems,
      mode: "payment",
      success_url,
      cancel_url,
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "DE", "ES", "IT", "GB", "PT", "NL", "MC"],
      },
      phone_number_collection: { enabled: true },
      metadata: {
        supabase_user_id: user.id,
        order_origin: "supabase_edge_function",
      },
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        amount_total: total,
        currency,
        stripe_checkout_session_id: session.id,
        stripe_customer_id: customer.id,
        metadata: { items: orderItems },
      })
      .select()
      .single();

    if (orderError || !order) {
      throw new Error(`Order insertion failed: ${orderError?.message}`);
    }

    const persistedOrderItems = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(persistedOrderItems);
    if (itemsError) throw new Error(`Order items insertion failed: ${itemsError.message}`);

    return new Response(
      JSON.stringify({ checkout_url: session.url }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error: any) {
    console.error("create-checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
