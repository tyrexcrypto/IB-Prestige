
import { createClient } from "npm:@supabase/supabase-js@2";

const projectUrl = Deno.env.get("SUPABASE_URL")!;
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const paystackKey = Deno.env.get("PAYSTACK_SECRET_KEY")!;
const siteUrl = Deno.env.get("IB_PRESTIGE_SITE_URL")!;
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

const supabase = createClient(projectUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

  if (req.method !== "POST") {
    return respond({ error: "Method not allowed" }, 405);
  }

  if (!projectUrl || !serviceKey || !paystackKey || !siteUrl) {
    return respond({ error: "Checkout is not configured on the server" }, 500);
  }

  let orderReference: string | null = null;

  try {
    const body = await req.json();

    // Validate the caller's Supabase access token. Never accept a customer ID
    // from the browser; derive it only from a verified access token.
    let authenticatedCustomerId: string | null = null;
    const authorization = req.headers.get("Authorization") ?? "";
    const bearerMatch = authorization.match(/^Bearer\s+(.+)$/i);
    const accessToken = bearerMatch?.[1];

    if (accessToken && accessToken !== anonKey) {
      const { data: authData, error: authError } = await supabase.auth.getUser(accessToken);
      if (authError || !authData.user) {
        return respond({ error: "Your session has expired. Please sign in again or continue as a guest." }, 401);
      }
      authenticatedCustomerId = authData.user.id;
    }

    const customerName = String(body.customerName ?? "").trim();
    const customerEmail = String(body.customerEmail ?? "").trim();
    const customerPhone = String(body.customerPhone ?? "").trim();
    const shippingAddress = String(body.shippingAddress ?? "").trim();
    const shippingCity = String(body.shippingCity ?? "").trim();
    const shippingState = String(body.shippingState ?? "").trim();
    const items = body.items;

    if (
      !customerName || customerName.length > 120 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail) ||
      customerEmail.length > 254 ||
      !customerPhone || customerPhone.length > 30 ||
      !shippingAddress || shippingAddress.length > 300 ||
      !shippingCity || shippingCity.length > 100 ||
      !shippingState || shippingState.length > 100
    ) {
      return respond({ error: "Please provide valid customer and delivery details." }, 400);
    }

    if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
      return respond({ error: "Your cart is empty or contains too many items." }, 400);
    }

    const cleanItems = items.map((item: { id: unknown; quantity: unknown }) => ({
      id: Number(item.id),
      quantity: Number(item.quantity),
    }));

    if (cleanItems.some((item) =>
      !Number.isSafeInteger(item.id) || item.id <= 0 ||
      !Number.isSafeInteger(item.quantity) || item.quantity <= 0 ||
      item.quantity > 100
    )) {
      return respond({ error: "Your cart contains an invalid product or quantity." }, 400);
    }

    // The reference is generated on the server, not supplied by the browser.
    orderReference = `IB-${crypto.randomUUID()}`;

    const { data: orderRows, error: orderError } = await supabase.rpc(
      "create_order_from_cart",
      {
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_customer_phone: customerPhone,
        p_shipping_address: shippingAddress,
        p_shipping_city: shippingCity,
        p_shipping_state: shippingState,
        p_payment_reference: orderReference,
        p_items: cleanItems,
      },
    );

    if (orderError) {
      console.error("Order creation failed:", orderError.message);
      return respond({ error: orderError.message }, 400);
    }

    const order = orderRows?.[0];

    if (!order) {
      return respond({ error: "We couldn't create your order." }, 500);
    }

    // Associate the order with the verified user before payment starts.
    // Guest checkouts intentionally keep customer_id NULL.
    if (authenticatedCustomerId) {
      const { error: linkError } = await supabase
        .from("orders")
        .update({ customer_id: authenticatedCustomerId })
        .eq("payment_reference", orderReference);

      if (linkError) {
        console.error("Could not link order to customer:", linkError.message);
        await supabase.rpc("release_order_stock", { p_payment_reference: orderReference });
        return respond({ error: "We couldn't securely link this order to your account. Please try again." }, 500);
      }
    }

    const amountKobo = Math.round(Number(order.created_total) * 100);

    const paymentResponse = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${paystackKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: customerEmail,
          amount: amountKobo,
          currency: "NGN",
          reference: orderReference,
          callback_url: `${siteUrl.replace(/\/$/, "")}/payment/callback`,
          metadata: {
            order_id: order.created_order_id,
            order_number: order.created_order_number,
          },
        }),
      },
    );

    const payment = await paymentResponse.json();

    if (!paymentResponse.ok || !payment.status || !payment.data?.authorization_url) {
      const { error: releaseError } = await supabase.rpc("release_order_stock", {
        p_payment_reference: orderReference,
      });

      if (releaseError) {
        console.error("Stock release failed:", releaseError.message);
      }

      return respond({ error: "Paystack could not initialize payment. Please try again." }, 502);
    }

    return respond({
      authorizationUrl: payment.data.authorization_url,
      reference: orderReference,
      orderNumber: order.created_order_number,
    });
  } catch (error) {
    console.error("Checkout error:", error);

    if (orderReference) {
      const { error: releaseError } = await supabase.rpc("release_order_stock", {
        p_payment_reference: orderReference,
      });

      if (releaseError) {
        console.error("Stock release failed:", releaseError.message);
      }
    }

    return respond({ error: "Checkout could not be completed. Please try again." }, 500);
  }
});
