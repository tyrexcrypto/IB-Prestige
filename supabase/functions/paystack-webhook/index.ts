
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

function toHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function validSignature(rawBody: string, signature: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(paystackKey),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"],
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(rawBody),
  );

  const expected = toHex(digest);

  if (expected.length !== signature.length) return false;

  let difference = 0;
  for (let i = 0; i < expected.length; i++) {
    difference |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }

  return difference === 0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!paystackKey) {
    return new Response("Webhook not configured", { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-paystack-signature") ?? "";

  if (!signature || !(await validSignature(rawBody, signature))) {
    return new Response("Invalid signature", { status: 401 });
  }

  try {
    const event = JSON.parse(rawBody);

    // Acknowledge other event types; only process successful charges here.
    if (event.event !== "charge.success") {
      return new Response("Event ignored", { status: 200 });
    }

    const payment = event.data;

    if (
      payment?.status !== "success" ||
      !payment?.reference ||
      !Number.isSafeInteger(payment?.amount) ||
      payment?.currency !== "NGN"
    ) {
      return new Response("Invalid payment data", { status: 400 });
    }

    const { error } = await supabase.rpc("confirm_order_payment", {
      p_payment_reference: payment.reference,
      p_amount_kobo: payment.amount,
      p_currency: payment.currency,
    });

    if (error) {
      console.error("Payment confirmation failed:", error.message);
      return new Response("Payment confirmation failed", { status: 500 });
    }

    return new Response("Payment confirmed", { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response("Webhook processing error", { status: 500 });
  }
});
