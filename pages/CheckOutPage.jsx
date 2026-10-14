import { Link, Navigate } from "react-router-dom";
import NavBar from "../src/components/Nav.jsx";
import Footer from "../src/components/Footer.jsx";
import formatPrice from "../utils/priceFormatter.js";
import { useState } from "react";

function CheckOutPage({ cart, cartCount, wishlistCount }) {
  const [formData, setFormData] = useState({
    email: "",
    recipientName: "",
    phone: "",
  });

  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [error, setError] = useState("");

  const subtotal = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({ ...previous, [name]: value }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!acceptedTerms) {
      setError("Please accept the terms and return policy");
      return;
    }

    setError(
      "Your details are validated. Payment processing will be enabled after backend integration",
    );
  }

  if (cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <>
      <header>
        <NavBar cartCount={cartCount} wishlistCount={wishlistCount} />
        <div className="container">
          <h4>(arrow down svg) Order Amount </h4>

          <Link to="/shop">Continue Shopping</Link>
        </div>
      </header>

      <main>
        <section className="form-section">
          <div className="container">
            <h1>CHECKOUT</h1>
            <p>Order Total: {formatPrice(subtotal)}</p>
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div>
                <span>
                  <label htmlFor="email">EMAIL</label>
                </span>

                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <span>
                  <label htmlFor="recipientName">RECIPIENT NAME</label>
                </span>

                <input
                  type="text"
                  id="recipientName"
                  name="recipientName"
                  autoComplete="name"
                  value={formData.recipientName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <span>
                  <label htmlFor="phone">CONTACT NUMBER</label>
                </span>

                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  autoComplete="tel"
                  value={formData.phone}
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
              {error && <p role="status">{error}</p>}
              <button className="btn secondary-btn" type="submit">
                Continue
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
