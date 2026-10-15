import { Link, Navigate } from "react-router-dom";
import { useState } from "react";
import NavBar from "../src/components/Nav.jsx";
import Footer from "../src/components/Footer.jsx";
import formatPrice from "../utils/priceFormatter.js";
import { supabase } from "../src/lib/supabaseClient.js";

function CheckOutPage({ cart, cartCount, wishlistCount }) {
  const [formData, setFormData] = useState({
    email: "",
    recipientName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = cart.reduce(
    (total, item) => total + Number(item.price) * item.quantity,
    0,
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Please accept the terms and return policy.");
      return;
    }

    if (!cart.length) {
      setError("Your cart is empty.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error: functionError } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            customerName: formData.recipientName,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            shippingAddress: formData.address,
            shippingCity: formData.city,
            shippingState: formData.state,
            // Never send prices as trusted values. The server uses product IDs
            // and quantities and calculates the total from the database.
            items: cart.map((item) => ({
              id: item.id,
              quantity: item.quantity,
            })),
          },
        },
      );

      if (functionError) {
        throw new Error(
          data?.error || functionError.message || "Unable to start checkout.",
        );
      }

      if (!data?.authorizationUrl) {
        throw new Error(
          data?.error || "Paystack did not return a payment link.",
        );
      }

      window.location.assign(data.authorizationUrl);
    } catch (err) {
      setError(err.message || "Checkout failed. Please try again.");
      setIsSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <>
      <header>
        <NavBar cartCount={cartCount} wishlistCount={wishlistCount} />
        <div className="container">
          <h4>Order Amount</h4>
          <Link to="/shop">Continue Shopping</Link>
        </div>
      </header>

      <main>
        <section className="form-section">
          <div className="container">
            <h1>CHECKOUT</h1>
            <p>Order Total: {formatPrice(subtotal)}</p>
            <p>Delivery fees, if applicable, will be shown before payment.</p>

            <form className="checkout-form" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email">EMAIL</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="recipientName">RECIPIENT NAME</label>
                <input
                  id="recipientName"
                  name="recipientName"
                  autoComplete="name"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="phone">CONTACT NUMBER</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="address">DELIVERY ADDRESS</label>
                <input
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="city">CITY</label>
                <input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  value={formData.city}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label htmlFor="state">STATE</label>
                <input
                  id="state"
                  name="state"
                  autoComplete="address-level1"
                  value={formData.state}
                  onChange={handleChange}
                  required
                />
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                />
                I agree to the terms and conditions and return policy.
              </label>

              {error && <p role="alert">{error}</p>}

              <button
                className="btn secondary-btn"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Preparing secure payment..." : "Pay securely"}
              </button>
            </form>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default CheckOutPage;
