import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing environment variables");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function buf2hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
): Promise<{ valid: true; event: any } | { valid: false; error: string }> {
  const elements = signatureHeader.split(",");
  const signatureData: Record<string, string> = {};
  for (const element of elements) {
    const [key, value] = element.split("=");
    signatureData[key.trim()] = value.trim();
  }

  const timestamp = signatureData["t"];
  const signatures = signatureData["v1"];
  if (!timestamp || !signatures) {
    return { valid: false, error: "Invalid signature header" };
  }

  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const expectedSignature = buf2hex(mac);

  // Stripe peut envoyer plusieurs signatures v1 séparées par des virgules
  const providedSignatures = signatures.split(" ").map((s) => s.trim());
  const isValid = providedSignatures.some((sig) => sig === expectedSignature);

  if (!isValid) {
    return { valid: false, error: "Signature mismatch" };
  }

  try {
    const event = JSON.parse(payload);
    return { valid: true, event };
  } catch {
    return { valid: false, error: "Invalid JSON payload" };
  }
}

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const verification = await verifyStripeSignature(body, signature, STRIPE_WEBHOOK_SECRET);

  if (!verification.valid) {
    console.error("Webhook signature verification failed:", verification.error);
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const event = verification.event;

  const { data: existingEvent } = await supabase
    .from("stripe_events")
    .select("id, processed")
    .eq("id", event.id)
    .maybeSingle();

  if (existingEvent?.processed) {
    return new Response(JSON.stringify({ received: true, alreadyProcessed: true }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!existingEvent) {
    const { error: eventInsertError } = await supabase.from("stripe_events").insert({
      id: event.id,
      type: event.type,
      object: JSON.stringify(event),
      processed: false,
    });

    if (eventInsertError) {
      console.error("Failed to log Stripe event", eventInsertError);
      return new Response(JSON.stringify({ error: "Failed to log event" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("stripe_checkout_session_id", session.id)
      .single();

    if (orderError || !order) {
      console.error("Order not found for session", session.id);
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const amountTotal = session.amount_total ?? 0;
    if (order.amount_total !== amountTotal) {
      console.error("Amount mismatch", order.amount_total, amountTotal);
      return new Response(JSON.stringify({ error: "Amount mismatch" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (order.status === "paid") {
      return new Response(JSON.stringify({ received: true, alreadyPaid: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const shippingDetails = session.shipping_details ?? null;
    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        shipping_address: shippingDetails?.address ?? null,
        customer_name: shippingDetails?.name ?? session.customer_details?.name ?? null,
        email: session.customer_details?.email ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id);

    if (updateOrderError) {
      console.error("Failed to update order", updateOrderError);
      return new Response(JSON.stringify({ error: "Failed to update order" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const chargeId = session.charges?.data?.[0]?.id ?? null;

    const { error: paymentError } = await supabase.from("payments").insert({
      order_id: order.id,
      stripe_payment_intent_id: session.payment_intent as string,
      stripe_charge_id: chargeId,
      amount: amountTotal,
      currency: session.currency || "eur",
      status: "succeeded",
      receipt_url: session.url || "",
    });

    if (paymentError) {
      console.error("Failed to insert payment", paymentError);
      return new Response(JSON.stringify({ error: "Failed to insert payment" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await supabase
      .from("stripe_events")
      .update({ processed: true })
      .eq("id", event.id);
  }

  if (event.type === "charge.refunded") {
    const charge = event.data.object as any;

    const chargeId = charge.id;
    const paymentIntentId = charge.payment_intent;

    let payment: any = null;
    let paymentError: any = null;

    if (chargeId) {
      const result = await supabase
        .from("payments")
        .select("id, order_id, amount")
        .eq("stripe_charge_id", chargeId)
        .maybeSingle();
      payment = result.data;
      paymentError = result.error;
    }

    if (!payment && paymentIntentId) {
      const result = await supabase
        .from("payments")
        .select("id, order_id, amount")
        .eq("stripe_payment_intent_id", paymentIntentId)
        .maybeSingle();
      payment = result.data;
      paymentError = result.error;
    }

    if (!chargeId && !paymentIntentId) {
      return new Response(JSON.stringify({ error: "Missing charge or payment intent id" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (paymentError || !payment) {
      console.error("Payment not found for refund", { chargeId, paymentIntentId });
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const refundedAmount = charge.amount_refunded ?? 0;
    const newPaymentStatus = refundedAmount >= payment.amount ? "refunded" : "partially_refunded";

    const { error: updatePaymentError } = await supabase
      .from("payments")
      .update({ status: newPaymentStatus, updated_at: new Date().toISOString() })
      .eq("id", payment.id);

    if (updatePaymentError) {
      console.error("Failed to update payment", updatePaymentError);
      return new Response(JSON.stringify({ error: "Failed to update payment" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("amount_total")
      .eq("id", payment.order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const newOrderStatus = refundedAmount >= order.amount_total ? "refunded" : "partially_refunded";

    const { error: updateOrderError } = await supabase
      .from("orders")
      .update({ status: newOrderStatus, updated_at: new Date().toISOString() })
      .eq("id", payment.order_id);

    if (updateOrderError) {
      console.error("Failed to update order", updateOrderError);
      return new Response(JSON.stringify({ error: "Failed to update order" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await supabase.from("stripe_events").update({ processed: true }).eq("id", event.id);
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
