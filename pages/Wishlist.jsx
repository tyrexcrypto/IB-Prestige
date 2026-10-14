import NavBar from "../src/components/Nav";

import Footer from "../src/components/Footer";

import { Link } from "react-router-dom";

import formatPrice from "../utils/priceFormatter";

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
                  <article key={watch.id}>
                    <Link to={`/shop/${watch.id}`}>
                      <img src={watch.img.src} alt={watch.name} />

                      <p>{watch.brand}</p>

                      <h2>{watch.name}</h2>

                      <p>{formatPrice(watch.price)}</p>
                    </Link>

                    <button
                      type="button"
                      disabled={watch.stockQuantity <= 0}
                      onClick={() => addToCart(watch)}
                    >
                      {watch.stockQuantity ? "Add To Bag" : "Out Of Stock"}
                    </button>

                    <button
                      type="button"
                      onClick={() => removeFromWishlist(watch)}
                    >
                      Remove
                    </button>
                  </article>
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
