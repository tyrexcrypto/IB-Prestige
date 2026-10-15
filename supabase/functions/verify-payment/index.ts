import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  },
);

const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond(
      { success: false, error: "Method not allowed." },
      405,
    );
  }

  if (!paystackKey) {
    console.error("PAYSTACK_SECRET_KEY is not configured.");
    return respond(
      { success: false, error: "Payment verification is temporarily unavailable." },
      500,
    );
  }

  try {
    const body = await req.json();
    const reference = body?.reference;

    if (
      typeof reference !== "string" ||
      !/^IB-[0-9a-f-]{36}$/i.test(reference)
    ) {
      return respond(
        { success: false, error: "Invalid payment reference." },
        400,
      );
    }

    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${paystackKey}`,
        },
      },
    );

    const result = await response.json();

    if (!response.ok || !result.status || !result.data) {
      return respond(
        {
          success: false,
          error: "Unable to verify this payment yet. Please try again.",
        },
        502,
      );
    }

    const payment = result.data;

    if (payment.reference !== reference) {
      return respond(
        { success: false, error: "Payment reference mismatch." },
        400,
      );
    }

    if (payment.status !== "success") {
      return respond(
        {
          success: false,
          status: payment.status || "pending",
          error: "Paystack has not confirmed this payment yet.",
        },
        200,
      );
    }

    if (
      payment.currency !== "NGN" ||
      !Number.isSafeInteger(payment.amount)
    ) {
      return respond(
        {
          success: false,
          error: "The payment amount or currency could not be validated.",
        },
        400,
      );
    }

    // The database function validates the expected amount and currency
    // against the order before marking it as paid.
    const { error: confirmationError } = await supabase.rpc(
      "confirm_order_payment",
      {
        p_payment_reference: reference,
        p_amount_kobo: payment.amount,
        p_currency: payment.currency,
      },
    );

    if (confirmationError) {
      console.error(
        "Order confirmation error:",
        confirmationError.message,
      );

      return respond(
        {
          success: false,
          error:
            "Paystack reports a successful payment, but order confirmation is pending. Please do not pay again.",
          reference,
        },
        500,
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("order_number")
      .eq("payment_reference", reference)
      .maybeSingle();

    if (orderError) {
      // Payment has already been confirmed in the database. Don't turn
      // that successful confirmation into a payment failure just because
      // the optional order-number lookup failed.
      console.error("Order number lookup error:", orderError.message);
    }

    return respond({
      success: true,
      status: "success",
      reference,
      orderNumber: order?.order_number ?? null,
      message: "Payment verified successfully.",
    });
  } catch (error) {
    console.error("Verification error:", error);

    return respond(
      {
        success: false,
        error: "Unable to verify payment right now. Please try again.",
      },
      500,
    );
  }
});