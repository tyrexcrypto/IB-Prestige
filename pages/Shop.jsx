import NavBar from "../src/components/Nav";
import Footer from "../src/components/Footer";

import WatchCard from "../src/components/WatchCard";

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

function Shop({
  products,
  productsLoading,
  productsError,
  cart,
  cartCount,
  wishlist,
  wishlistCount,
  addToCart,
  addToWishlist,
  removeFromWishlist,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedBrand = searchParams.get("brand") || "all";
  const brands = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((product) => String(product.brand || "").trim())
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [products],
  );

  const query = searchTerm.trim().toLowerCase();

  const filteredWatches = products.filter((watch) => {
    const matchesBrand =
      selectedBrand === "all" ||
      String(watch.brand || "").toLowerCase() === selectedBrand.toLowerCase();
    const matchesSearch = [watch.name, watch.brand, watch.category ?? ""].some(
      (value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
    );
    return matchesBrand && matchesSearch;
  });
  const sortedWatches = [...filteredWatches];

  if (sortOption === "high-low") {
    sortedWatches.sort((a, b) => b.price - a.price);
  }

  if (sortOption === "low-high") {
    sortedWatches.sort((a, b) => a.price - b.price);
  }

  return (
    <>
      <header>
        <NavBar cartCount={cartCount} wishlistCount={wishlistCount} />
      </header>

      <main>
        <section className="shop">
          <div className="container">
            <div className="section-header">
              <h2>THE IB PRESTIGE COLLECTION</h2>
              <p>Explore our full collection of timepieces.</p>

              <label className="shop-brand-filter-label">
                Shop by brand
                <select
                  aria-label="Filter by brand"
                  value={selectedBrand}
                  onChange={(event) => {
                    const next = new URLSearchParams(searchParams);
                    if (event.target.value === "all") next.delete("brand");
                    else next.set("brand", event.target.value);
                    setSearchParams(next);
                  }}
                >
                  <option value="all">All brands</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </label>

              <input
                type="text"
                value={searchTerm}
                placeholder="Search..."
                onChange={(event) => setSearchTerm(event.target.value)}
              />

              <select
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
              >
                <option value="all">All Watches</option>
                <option value="high-low">High to Low</option>
                <option value="low-high">Low to High</option>
              </select>
            </div>

            <div className="section-contents products-grid">
              {productsLoading ? (
                <p role="status">Loading watches...</p>
              ) : productsError ? (
                <p role="alert">
                  We couldn't load the watches: {productsError}
                </p>
              ) : sortedWatches.length > 0 ? (
                sortedWatches.map((watch) => (
                  <WatchCard
                    key={watch.id}
                    cart={cart}
                    watch={watch}
                    wishlist={wishlist}
                    addToCart={addToCart}
                    addToWishlist={addToWishlist}
                    removeFromWishlist={removeFromWishlist}
                  />
                ))
              ) : (
                <p role="status">
                  No watches found
                  {selectedBrand !== "all" ? ` for ${selectedBrand}` : ""}
                  {searchTerm ? ` matching “${searchTerm}”` : ""}. Try another
                  brand or search.
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Shop;
