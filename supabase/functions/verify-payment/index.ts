
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") return respond({ error: "Method not allowed" }, 405);

  try {
    const { reference } = await req.json();

    if (
      typeof reference !== "string" ||
      !/^IB-[0-9a-f-]{36}$/i.test(reference)
    ) {
      return respond({ error: "Invalid payment reference." }, 400);
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      { headers: { Authorization: `Bearer ${paystackKey}` } },
    );

    const result = await response.json();

    if (!response.ok || !result.status || !result.data) {
      return respond({ error: "Unable to verify this payment yet." }, 502);
    }

    const payment = result.data;

    if (payment.reference !== reference) {
      return respond({ error: "Payment reference mismatch." }, 400);
    }

    if (payment.status !== "success") {
      return respond({
        status: payment.status || "pending",
        message: "Payment has not been confirmed.",
      });
    }

    if (
      payment.currency !== "NGN" ||
      !Number.isSafeInteger(payment.amount)
    ) {
      return respond({ error: "Invalid payment amount or currency." }, 400);
    }

    const { error } = await supabase.rpc("confirm_order_payment", {
      p_payment_reference: reference,
      p_amount_kobo: payment.amount,
      p_currency: payment.currency,
    });

    if (error) {
      console.error("Order confirmation error:", error.message);
      return respond({ error: "Payment was received, but order confirmation is pending." }, 500);
    }

    return respond({
      status: "success",
      reference,
      message: "Payment verified successfully.",
    });
  } catch (error) {
    console.error("Verification error:", error);
    return respond({ error: "Unable to verify payment right now." }, 500);
  }
});
