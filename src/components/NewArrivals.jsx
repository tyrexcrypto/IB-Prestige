import WatchCard from "./WatchCard";
import { Link } from "react-router-dom";

function NewArrivals({
  products = [],
  productsLoading,
  productsError,
  cart = [],
  addToCart,
  addToWishlist,
  wishlist,
  removeFromWishlist,
}) {
  // add products

  if (productsLoading) {
    return (
      <section className="new-arrivals">
        <div className="container">
          <p role="status">Loading new arrivals...</p>
        </div>
      </section>
    );
  }

  if (productsError) {
    return (
      <section className="new-arrivals">
        <div className="container">
          <p role="alert">We couldn't load new arrivals: {productsError}</p>
        </div>
      </section>
    );
  }

  const newArrivals = products.slice(0, 4);

  return (
    <section className="new-arrivals">
      <div className="container">
        <div className="section-header">
          <p className="eyebrow">JUST IN</p>
          <h2>NEW ARRIVALS</h2>
          <p>The latest additions to the IB Prestige collection.</p>
        </div>

        <div className="section-contents products-grid">
          {newArrivals.length > 0 ? (
            newArrivals.map((watch) => (
              <WatchCard
                key={watch.id}
                watch={watch}
                cart={cart}
                addToCart={addToCart}
                wishlist={wishlist}
                addToWishlist={addToWishlist}
                removeFromWishlist={removeFromWishlist}
              />
            ))
          ) : (
            <p>No watches are available yet.</p>
          )}
        </div>

        <div className="button-container section-button-container">
          <Link to="/shop" className="link btn primary-btn section-button">
            VIEW ALL
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NewArrivals;
