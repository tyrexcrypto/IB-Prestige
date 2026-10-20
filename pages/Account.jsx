import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import NavBar from "../src/components/Nav.jsx";
import Footer from "../src/components/Footer.jsx";
import { supabase } from "../src/lib/supabaseClient.js";
import formatPrice from "../utils/priceFormatter.js";
import "./Account.css";

const dateFormatter = new Intl.DateTimeFormat("en-NG", {
  dateStyle: "medium",
  timeStyle: "short",
});

function labelStatus(value) {
  return String(value || "pending")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function Account({ cartCount = 0, wishlistCount = 0 }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [itemsByOrder, setItemsByOrder] = useState({});
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data, error: sessionError }) => {
      if (!active) return;
      if (sessionError)
        setError(
          "We couldn't check your sign-in session. Please refresh and try again.",
        );
      setSession(data?.session ?? null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setAuthLoading(false);
      },
    );
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const loadOrders = useCallback(async () => {
    if (!session?.user?.id) {
      setOrders([]);
      setItemsByOrder({});
      setOrdersLoading(false);
      return;
    }

    setOrdersLoading(true);
    setError("");
    const { data: orderRows, error: ordersError } = await supabase
      .from("orders")
      .select(
        "id, order_number, customer_name, customer_email, currency, subtotal, shipping_fee, total, payment_status, order_status, created_at, updated_at",
      )
      .eq("customer_id", session.user.id)
      .order("created_at", { ascending: false });

    if (ordersError) {
      setError("We couldn't load your orders. Please try again in a moment.");
      setOrdersLoading(false);
      return;
    }

    const safeOrders = orderRows ?? [];
    setOrders(safeOrders);
    if (safeOrders.length) {
      const ids = safeOrders.map((order) => order.id);
      const { data: itemRows, error: itemsError } = await supabase
        .from("order_items")
        .select(
          "id, order_id, product_name, brand, image_url, unit_price, quantity, line_total",
        )
        .in("order_id", ids);

      if (itemsError) {
        setError(
          "Your orders loaded, but some item details couldn't be loaded. Refresh to try again.",
        );
        setItemsByOrder({});
      } else {
        const grouped = (itemRows ?? []).reduce((result, item) => {
          (result[item.order_id] ??= []).push(item);
          return result;
        }, {});
        setItemsByOrder(grouped);
      }
    } else {
      setItemsByOrder({});
    }
    setOrdersLoading(false);
  }, [session?.user?.id]);

  useEffect(() => {
    if (!authLoading) loadOrders();
  }, [authLoading, loadOrders]);

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId],
  );

  async function handleSignOut() {
    setSigningOut(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError("We couldn't sign you out. Please try again.");
      setSigningOut(false);
      return;
    }
    setSession(null);
    setSigningOut(false);
  }

  if (authLoading) {
    return (
      <main className="account-page">
        <p className="account-state">Checking your account…</p>
      </main>
    );
  }
  if (!session)
    return (
      <Navigate
        to="/signin"
        replace
        state={{ from: { pathname: "/account" } }}
      />
    );

  const user = session.user;
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "Customer";

  return (
    <>
      <NavBar cartCount={cartCount} wishlistCount={wishlistCount} />
      <main className="account-page container">
        <div className="account-heading">
          <div>
            <p className="account-eyebrow">IB PRESTIGE ACCOUNT</p>
            <h1>
              Welcome back
              {displayName && user.email
                ? `, ${displayName.split(" ")[0]}`
                : ""}
              .
            </h1>
            <p className="account-muted">
              Manage your account and keep track of your orders.
            </p>
          </div>
          <button
            className="account-secondary-button"
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>

        <section className="account-profile" aria-label="Account details">
          <div>
            <span>Name</span>
            <strong>{displayName}</strong>
          </div>
          <div>
            <span>Email address</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Orders</span>
            <strong>{orders.length}</strong>
          </div>
        </section>

        <section className="account-orders-section">
          <div className="account-section-heading">
            <div>
              <p className="account-eyebrow">YOUR PURCHASES</p>
              <h2>Order history</h2>
            </div>
            <Link to="/shop" className="account-text-link">
              Continue shopping <span aria-hidden="true">→</span>
            </Link>
          </div>

          {error && (
            <div className="account-error" role="alert">
              {error}{" "}
              <button type="button" onClick={loadOrders}>
                Try again
              </button>
            </div>
          )}
          {ordersLoading ? (
            <p className="account-state">Loading your orders…</p>
          ) : orders.length === 0 ? (
            <div className="account-empty">
              <h3>No orders yet</h3>
              <p>
                Your paid and pending orders associated with this account will
                appear here.
              </p>
              <Link to="/shop" className="account-primary-button">
                Explore watches
              </Link>
            </div>
          ) : (
            <div className="account-order-list">
              {orders.map((order) => {
                const itemCount = (itemsByOrder[order.id] ?? []).reduce(
                  (total, item) => total + Number(item.quantity || 0),
                  0,
                );
                return (
                  <article className="account-order-card" key={order.id}>
                    <div className="account-order-topline">
                      <div>
                        <span className="account-order-label">ORDER</span>
                        <h3>{order.order_number}</h3>
                        <p>
                          {dateFormatter.format(new Date(order.created_at))}
                        </p>
                      </div>
                      <strong className="account-order-total">
                        {formatPrice(Number(order.total))}
                      </strong>
                    </div>
                    <div className="account-order-meta">
                      <span
                        className={`account-status account-status--${String(order.payment_status || "pending").toLowerCase()}`}
                      >
                        Payment: {labelStatus(order.payment_status)}
                      </span>
                      <span
                        className={`account-status account-status--${String(order.order_status || "pending").toLowerCase()}`}
                      >
                        Order: {labelStatus(order.order_status)}
                      </span>
                      <span>
                        {itemCount || "—"} item{itemCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <button
                      className="account-order-toggle"
                      type="button"
                      aria-expanded={selectedOrderId === order.id}
                      onClick={() =>
                        setSelectedOrderId(
                          selectedOrderId === order.id ? null : order.id,
                        )
                      }
                    >
                      {selectedOrderId === order.id
                        ? "Hide order details"
                        : "View order details"}
                      <span aria-hidden="true">
                        {selectedOrderId === order.id ? "−" : "+"}
                      </span>
                    </button>
                    {selectedOrderId === order.id && (
                      <div className="account-order-details">
                        {(itemsByOrder[order.id] ?? []).map((item) => (
                          <div className="account-line-item" key={item.id}>
                            <div className="account-line-image">
                              {item.image_url ? (
                                <img
                                  src={item.image_url}
                                  alt={item.product_name}
                                  loading="lazy"
                                />
                              ) : (
                                <span>IB</span>
                              )}
                            </div>
                            <div className="account-line-copy">
                              <strong>{item.product_name}</strong>
                              {item.brand && <span>{item.brand}</span>}
                              <small>
                                Qty: {item.quantity} ·{" "}
                                {formatPrice(Number(item.unit_price))} each
                              </small>
                            </div>
                            <strong>
                              {formatPrice(
                                Number(
                                  item.line_total ??
                                    Number(item.unit_price) *
                                      Number(item.quantity),
                                ),
                              )}
                            </strong>
                          </div>
                        ))}
                        <div className="account-totals">
                          <div>
                            <span>Subtotal</span>
                            <span>{formatPrice(Number(order.subtotal))}</span>
                          </div>
                          <div>
                            <span>Shipping</span>
                            <span>
                              {Number(order.shipping_fee) === 0
                                ? "—"
                                : formatPrice(Number(order.shipping_fee))}
                            </span>
                          </div>
                          <div className="account-grand-total">
                            <strong>Total</strong>
                            <strong>{formatPrice(Number(order.total))}</strong>
                          </div>
                        </div>
                        <p className="account-order-note">
                          For delivery updates or help with this order, contact
                          IB Prestige and include your order number.
                        </p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}

export default Account;
