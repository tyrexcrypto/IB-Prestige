import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";
import "./PaymentCallback.css";

export default function PaymentCallback({ setCart }) {
  const location = useLocation();

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState(
    "Please wait while we confirm your payment.",
  );
  const [orderNumber, setOrderNumber] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function verifyPayment() {
      const params = new URLSearchParams(location.search);
      const reference = params.get("reference") || params.get("trxref");

      if (!reference) {
        setStatus("error");
        setMessage(
          "We couldn't find a payment reference in this URL. Please contact support before attempting another payment.",
        );
        return;
      }

      setStatus("verifying");
      setMessage("Please wait while we confirm your payment.");

      try {
        const { data, error } = await supabase.functions.invoke(
          "verify-payment",
          {
            body: { reference },
          },
        );

        if (error) {
          throw new Error(error.message || "Payment verification failed.");
        }

        if (data?.success !== true) {
          throw new Error(
            data?.error ||
              data?.message ||
              "We couldn't confirm your payment yet.",
          );
        }

        if (cancelled) return;

        setOrderNumber(data.orderNumber || data.order_number || "");
        setStatus("success");
        setMessage(
          "Your payment has been verified. Thank you for shopping with IB Prestige.",
        );

        if (typeof setCart === "function") {
          setCart([]);
        }
      } catch (error) {
        if (cancelled) return;

        console.error("Payment callback verification error:", error);

        setStatus("error");
        setMessage(
          `We couldn't confirm your payment right now. Your payment may still have succeeded, so please don't pay again. Contact support with this reference: ${reference}`,
        );
      }
    }

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [location.search, setCart]);

  return (
    <main className="payment-callback">
      <section className="payment-callback__card" aria-live="polite">
        {status === "verifying" && (
          <>
            <div className="payment-callback__spinner" />
            <p className="payment-callback__eyebrow">PAYMENT STATUS</p>
            <h1>Confirming your payment</h1>
            <p>{message}</p>
            <p className="payment-callback__note">
              Please keep this page open. Do not pay again while verification is
              in progress.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="payment-callback__icon payment-callback__icon--success">
              ✓
            </div>
            <p className="payment-callback__eyebrow">PAYMENT CONFIRMED</p>
            <h1>Thank you for your order!</h1>
            <p>{message}</p>

            {orderNumber && (
              <p className="payment-callback__order">
                Order number: <strong>{orderNumber}</strong>
              </p>
            )}

            <Link to="/" className="payment-callback__button">
              Continue shopping
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <div className="payment-callback__icon payment-callback__icon--error">
              !
            </div>
            <p className="payment-callback__eyebrow">VERIFICATION PENDING</p>
            <h1>We haven't confirmed your payment</h1>
            <p>{message}</p>

            <button
              type="button"
              className="payment-callback__button"
              onClick={() => window.location.reload()}
            >
              Check payment again
            </button>

            <Link to="/" className="payment-callback__secondary">
              Return to store
            </Link>
          </>
        )}
      </section>
    </main>
  );
}
