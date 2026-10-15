import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient.js";

function PaymentCallback({ setCart }) {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking");
  const [message, setMessage] = useState("Verifying your payment securely...");

  useEffect(() => {
    let active = true;

    async function verify() {
      const reference =
        searchParams.get("reference") || searchParams.get("trxref");

      if (!reference) {
        setStatus("unknown");
        setMessage(
          "We couldn't find a payment reference. Please contact support if you completed payment.",
        );
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke(
          "verify-payment",
          { body: { reference } },
        );

        if (error) throw error;

        if (!active) return;

        if (data?.status === "success") {
          setStatus("success");
          setMessage(
            "Your payment has been verified and your order is confirmed.",
          );
          setCart([]);
        } else {
          setStatus("pending");
          setMessage(
            "Your payment is not confirmed yet. Please wait a moment before trying again, and do not pay a second time.",
          );
        }
      } catch {
        if (!active) return;
        setStatus("pending");
        setMessage(
          "We couldn't verify the payment right now. Your payment may still be processing. Please check again shortly or contact support.",
        );
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [searchParams, setCart]);

  return (
    <main className="container" style={{ paddingBlock: "5rem" }}>
      <h1>
        {status === "checking" && "VERIFYING PAYMENT"}
        {status === "success" && "PAYMENT CONFIRMED"}
        {status === "pending" && "PAYMENT PROCESSING"}
        {status === "unknown" && "PAYMENT STATUS"}
      </h1>

      <p role="status">{message}</p>

      {status === "success" ? (
        <Link className="btn secondary-btn" to="/">
          Continue shopping
        </Link>
      ) : (
        <>
          <button
            className="btn secondary-btn"
            type="button"
            onClick={() => window.location.reload()}
            disabled={status === "checking"}
          >
            Check payment again
          </button>
          <p>
            <Link to="/shop">Return to shop</Link>
          </p>
        </>
      )}
    </main>
  );
}

export default PaymentCallback;
