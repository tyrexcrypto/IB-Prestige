import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import "./AdminLayout.css";

const links = [
  { to: "/admin/orders", label: "Orders", icon: "▤" },
  { to: "/admin/products", label: "Products", icon: "◫" },
  { to: "/admin/products/new", label: "Add product", icon: "+" },
];

export default function AdminLayout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const title = location.pathname.includes("/orders")
    ? "Orders"
    : location.pathname.includes("/new")
      ? "Add product"
      : location.pathname.includes("/edit")
        ? "Edit product"
        : "Products";

  async function signOut() {
    await supabase.auth.signOut();
    navigate("/admin/login", { replace: true });
  }

  return (
    <div className="ib-admin-shell">
      <button
        className="ib-admin-mobile-toggle"
        type="button"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-label="Toggle admin navigation"
      >
        ☰
      </button>
      <aside className={`ib-admin-sidebar ${menuOpen ? "is-open" : ""}`}>
        <NavLink
          to="/admin/orders"
          className="ib-admin-brand"
          onClick={() => setMenuOpen(false)}
        >
          <span className="ib-admin-brand-mark">IB</span>
          <span>
            IB PRESTIGE<small>STORE MANAGEMENT</small>
          </span>
        </NavLink>
        <p className="ib-admin-nav-label">WORKSPACE</p>
        <nav aria-label="Admin navigation" className="ib-admin-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `ib-admin-nav-link ${isActive ? "active" : ""}`
              }
              onClick={() => setMenuOpen(false)}
            >
              <span className="ib-admin-nav-icon">{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="ib-admin-sidebar-bottom">
          <NavLink to="/" className="ib-admin-nav-link">
            ↗ View storefront
          </NavLink>
          <button type="button" className="ib-admin-signout" onClick={signOut}>
            ↪ Sign out
          </button>
        </div>
      </aside>
      {menuOpen && (
        <button
          className="ib-admin-backdrop"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <main className="ib-admin-main">
        <header className="ib-admin-topbar">
          <div>
            <span className="ib-admin-breadcrumb">Admin / </span>
            <strong>{title}</strong>
          </div>
          <span className="ib-admin-status">
            <i /> Store admin
          </span>
        </header>
        <div className="ib-admin-content">{children}</div>
      </main>
    </div>
  );
}
