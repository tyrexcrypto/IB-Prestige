import NavBar from "../src/components/Nav";

import Footer from "../src/components/Footer";

import { Link } from "react-router-dom";

import WatchCard from "../src/components/WatchCard";

function Wishlist({
  cartCount,

  wishlist,

  wishlistCount,

  removeFromWishlist,

  addToCart,
}) {
  return (
    <>
      <NavBar cartCount={cartCount} wishlistCount={wishlistCount} />

      <main>
        <section className="wishlist">
          <div className="container">
            <h1>MY WISHLIST</h1>

            {wishlist.length === 0 ? (
              <div>
                <p>Your wishlist is currently empty.</p>
                <Link to="/shop">Explore The Collection</Link>
              </div>
            ) : (
              <div className="products-grid">
                {wishlist.map((watch) => (
                  <WatchCard
                    key={watch.id}
                    watch={watch}
                    addToCart={addToCart}
                    removeFromWishlist={removeFromWishlist}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Wishlist;
