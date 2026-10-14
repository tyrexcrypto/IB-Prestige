import NavBar from "../src/components/Nav";
import Footer from "../src/components/Footer";

import WatchCard from "../src/components/WatchCard";

import { useState } from "react";

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

  const query = searchTerm.trim().toLowerCase();

  const filteredWatches = products.filter((watch) =>
    [watch.name, watch.brand, watch.category ?? ""].some((value) =>
      String(value ?? "")
        .toLowerCase()
        .includes(query),
    ),
  );
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
              <p>Explore our full...</p>

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
                  No Watches Found For "{searchTerm}". Try another name or
                  brand.
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
