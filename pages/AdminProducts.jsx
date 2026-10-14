import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      setProducts(data ?? []);
      setIsLoading(false);
    }

    fetchProducts();
  }, []);

  async function handleDeleteProduct(product) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${product.name}"?`,
    );

    if (!confirmed) return;

    setDeletingId(product.id);
    setDeleteError("");

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    setDeletingId(null);

    if (error) {
      setDeleteError(error.message);
      return;
    }

    setProducts((previousProducts) =>
      previousProducts.filter((item) => item.id !== product.id),
    );
  }

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase();

    return (
      product.name.toLowerCase().includes(query) ||
      product.brand.toLowerCase().includes(query)
    );
  });

  function formatPrice(price) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(price);
  }

  return (
    <main className="admin-products-page container">
      <header className="admin-products-header">
        <div>
          <p>IB PRESTIGE</p>
          <h1>Products</h1>
          <p>Manage your watch catalogue.</p>
        </div>

        <Link to="/admin/products/new" className="btn primary-btn">
          Add Product
        </Link>
      </header>

      <div className="admin-products-summary">
        <p>
          Total products: <strong>{products.length}</strong>
        </p>
      </div>

      <label htmlFor="product-search">Search products</label>
      <input
        id="product-search"
        type="search"
        placeholder="Search by name or brand..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {isLoading && <p role="status">Loading products...</p>}

      {errorMessage && (
        <p role="alert">Couldn't load products: {errorMessage}</p>
      )}

      {deleteError && (
        <p role="alert">Couldn't delete product: {deleteError}</p>
      )}

      {!isLoading && !errorMessage && (
        <div className="admin-products-list">
          {filteredProducts.length === 0 ? (
            <p>No products found.</p>
          ) : (
            filteredProducts.map((product) => (
              <article className="admin-product-row" key={product.id}>
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="admin-product-image"
                />

                <div className="admin-product-info">
                  <h2>{product.name}</h2>
                  <p>{product.brand}</p>
                  <p>{product.category}</p>
                </div>

                <div className="admin-product-stock">
                  <p>{formatPrice(Number(product.price))}</p>
                  <p>Stock: {product.stock_quantity}</p>
                </div>

                <Link
                  to={`/admin/products/${product.id}/edit`}
                  className="btn secondary-btn"
                >
                  Edit
                </Link>

                <button
                  type="button"
                  className="btn secondary-btn"
                  onClick={() => handleDeleteProduct(product)}
                  disabled={deletingId === product.id}
                >
                  {deletingId === product.id ? "Deleting..." : "Delete"}
                </button>
              </article>
            ))
          )}
        </div>
      )}
    </main>
  );
}

export default AdminProducts;
