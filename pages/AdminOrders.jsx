import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";
import "./AdminOrders.css";

const STATUSES = [
  "all",
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatPrice(value) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
}

function formatDate(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function readableStatus(value) {
  return String(value || "unknown").replaceAll("_", " ");
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      setLoadError(error.message);
      setOrders([]);
      setLoading(false);
      return;
    }

    setOrders(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.order_status === statusFilter;
      const matchesSearch =
        !query ||
        [
          order.order_number,
          order.payment_reference,
          order.customer_name,
          order.customer_email,
          order.customer_phone,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const selectedOrder =
    orders.find((order) => order.id === selectedOrderId) ?? null;
  const paidOrders = orders.filter((order) => order.payment_status === "paid");
  const paidRevenue = paidOrders.reduce(
    (sum, order) => sum + Number(order.total || 0),
    0,
  );
  const processingCount = paidOrders.filter(
    (order) => order.order_status === "processing",
  ).length;

  async function updateFulfilment(order, nextStatus) {
    const allowedNextStatus = {
      processing: "shipped",
      shipped: "delivered",
    }[order.order_status];

    if (order.payment_status !== "paid" || allowedNextStatus !== nextStatus) {
      setActionMessage(
        "That status change isn't allowed. Only paid orders can move from processing to shipped, then delivered.",
      );
      return;
    }

    setUpdatingId(order.id);
    setActionMessage("");

    const { data, error } = await supabase
      .from("orders")
      .update({
        order_status: nextStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order.id)
      .eq("payment_status", "paid")
      .eq("order_status", order.order_status)
      .select("id, order_status")
      .maybeSingle();

    setUpdatingId(null);

    if (error) {
      setActionMessage(`Couldn't update this order: ${error.message}`);
      return;
    }

    if (!data) {
      setActionMessage(
        "The order wasn't changed. Refresh the page and check its current status.",
      );
      await fetchOrders();
      return;
    }

    setOrders((current) =>
      current.map((item) =>
        item.id === order.id
          ? {
              ...item,
              order_status: data.order_status,
              updated_at: new Date().toISOString(),
            }
          : item,
      ),
    );
    setActionMessage(`Order ${order.order_number || ""} marked ${nextStatus}.`);
  }

  return (
    <main className="admin-orders-page container">
      <header className="admin-orders-header">
        <div>
          <p className="admin-orders-eyebrow">IB PRESTIGE / ADMINISTRATION</p>
          <h1>Orders</h1>
          <p className="admin-orders-subtitle">
            Review payments and manage order fulfilment.
          </p>
        </div>
        <div className="admin-orders-header-actions">
          <button
            className="admin-orders-button admin-orders-button-light"
            type="button"
            onClick={fetchOrders}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh orders"}
          </button>
          <Link
            className="admin-orders-button admin-orders-button-dark"
            to="/admin/products"
          >
            Manage products
          </Link>
        </div>
      </header>

      <section className="admin-orders-stats" aria-label="Order summary">
        <article className="admin-orders-stat">
          <span>Total orders</span>
          <strong>{orders.length}</strong>
        </article>
        <article className="admin-orders-stat">
          <span>Paid revenue</span>
          <strong>{formatPrice(paidRevenue)}</strong>
        </article>
        <article className="admin-orders-stat">
          <span>Awaiting fulfilment</span>
          <strong>{processingCount}</strong>
        </article>
        <article className="admin-orders-stat">
          <span>Paid orders</span>
          <strong>{paidOrders.length}</strong>
        </article>
      </section>

      {actionMessage && (
        <p className="admin-orders-message" role="status">
          {actionMessage}
        </p>
      )}
      {loadError && (
        <div className="admin-orders-error" role="alert">
          <strong>Couldn't load orders.</strong>
          <span>{loadError}</span>
          <p>
            Check the admin orders RLS policies in the SQL file supplied with
            this update.
          </p>
        </div>
      )}

      <section className="admin-orders-panel">
        <div className="admin-orders-toolbar">
          <label
            className="admin-orders-search-label"
            htmlFor="admin-order-search"
          >
            Search orders
            <input
              id="admin-order-search"
              type="search"
              placeholder="Order number, customer, email, reference…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
          <label
            className="admin-orders-filter-label"
            htmlFor="admin-order-status"
          >
            Order status
            <select
              id="admin-order-status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : readableStatus(status)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {loading && (
          <p className="admin-orders-empty" role="status">
            Loading orders…
          </p>
        )}
        {!loading && !loadError && filteredOrders.length === 0 && (
          <p className="admin-orders-empty">No orders match these filters.</p>
        )}

        {!loading && !loadError && filteredOrders.length > 0 && (
          <div className="admin-orders-table-wrap">
            <table className="admin-orders-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Fulfilment</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.order_number || "Order"}</strong>
                      <small>{order.payment_reference || "No reference"}</small>
                    </td>
                    <td>
                      <strong>{order.customer_name || "Customer"}</strong>
                      <small>
                        {order.customer_email ||
                          order.customer_phone ||
                          "No contact details"}
                      </small>
                    </td>
                    <td>{formatDate(order.created_at)}</td>
                    <td className="admin-orders-total">
                      {formatPrice(order.total)}
                    </td>
                    <td>
                      <span
                        className={`admin-orders-pill status-${String(order.payment_status || "unknown").toLowerCase()}`}
                      >
                        {readableStatus(order.payment_status)}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-orders-pill status-${String(order.order_status || "unknown").toLowerCase()}`}
                      >
                        {readableStatus(order.order_status)}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="admin-orders-text-button"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        View order
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedOrder && (
        <div
          className="admin-orders-modal-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedOrderId(null);
          }}
        >
          <section
            className="admin-orders-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-order-detail-title"
          >
            <header className="admin-orders-modal-header">
              <div>
                <p className="admin-orders-eyebrow">ORDER DETAILS</p>
                <h2 id="admin-order-detail-title">
                  {selectedOrder.order_number || "Order details"}
                </h2>
                <p>{formatDate(selectedOrder.created_at)}</p>
              </div>
              <button
                type="button"
                className="admin-orders-close"
                onClick={() => setSelectedOrderId(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </header>

            <div className="admin-orders-detail-grid">
              <div>
                <span>Customer</span>
                <strong>{selectedOrder.customer_name || "—"}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{selectedOrder.customer_email || "—"}</strong>
              </div>
              <div>
                <span>Phone</span>
                <strong>{selectedOrder.customer_phone || "—"}</strong>
              </div>
              <div>
                <span>Payment status</span>
                <strong>{readableStatus(selectedOrder.payment_status)}</strong>
              </div>
              <div>
                <span>Payment reference</span>
                <strong className="admin-orders-break">
                  {selectedOrder.payment_reference || "—"}
                </strong>
              </div>
              <div>
                <span>Shipping address</span>
                <strong>
                  {[
                    selectedOrder.shipping_address,
                    selectedOrder.city,
                    selectedOrder.state,
                  ]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </strong>
              </div>
            </div>

            <h3 className="admin-orders-items-heading">Items ordered</h3>
            <div className="admin-orders-items">
              {(selectedOrder.order_items || []).map((item) => (
                <article className="admin-orders-item" key={item.id}>
                  {item.image_url ? (
                    <img src={item.image_url} alt="" />
                  ) : (
                    <div className="admin-orders-item-placeholder">IB</div>
                  )}
                  <div>
                    <strong>{item.product_name}</strong>
                    <span>
                      {item.brand || "IB Prestige"} · Qty {item.quantity}
                    </span>
                    <small>{formatPrice(item.unit_price)} each</small>
                  </div>
                  <strong>
                    {formatPrice(
                      item.line_total ??
                        Number(item.unit_price) * Number(item.quantity),
                    )}
                  </strong>
                </article>
              ))}
              {(!selectedOrder.order_items ||
                selectedOrder.order_items.length === 0) && (
                <p>No order items were returned.</p>
              )}
            </div>

            <div className="admin-orders-totals">
              <p>
                <span>Subtotal</span>
                <strong>{formatPrice(selectedOrder.subtotal)}</strong>
              </p>
              <p>
                <span>Shipping</span>
                <strong>{formatPrice(selectedOrder.shipping_fee)}</strong>
              </p>
              <p className="grand-total">
                <span>Total paid/order total</span>
                <strong>{formatPrice(selectedOrder.total)}</strong>
              </p>
            </div>

            <div className="admin-orders-fulfilment">
              <div>
                <span>Current fulfilment status</span>
                <strong>{readableStatus(selectedOrder.order_status)}</strong>
              </div>
              {selectedOrder.payment_status === "paid" &&
                selectedOrder.order_status === "processing" && (
                  <button
                    className="admin-orders-button admin-orders-button-dark"
                    disabled={updatingId === selectedOrder.id}
                    onClick={() => updateFulfilment(selectedOrder, "shipped")}
                  >
                    {updatingId === selectedOrder.id
                      ? "Saving…"
                      : "Mark as shipped"}
                  </button>
                )}
              {selectedOrder.payment_status === "paid" &&
                selectedOrder.order_status === "shipped" && (
                  <button
                    className="admin-orders-button admin-orders-button-dark"
                    disabled={updatingId === selectedOrder.id}
                    onClick={() => updateFulfilment(selectedOrder, "delivered")}
                  >
                    {updatingId === selectedOrder.id
                      ? "Saving…"
                      : "Mark as delivered"}
                  </button>
                )}
              {selectedOrder.payment_status !== "paid" && (
                <p>
                  Fulfilment actions are disabled until payment is confirmed.
                </p>
              )}
              {selectedOrder.payment_status === "paid" &&
                ["delivered", "cancelled"].includes(
                  selectedOrder.order_status,
                ) && (
                  <p>
                    No further fulfilment action is available for this status.
                  </p>
                )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminOrders;
