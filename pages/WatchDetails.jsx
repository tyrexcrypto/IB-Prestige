import { useState } from "react";
import { useParams, Link } from "react-router-dom";

import formatPrice from "../utils/priceFormatter";
import Nav from "../src/components/Nav";
import Footer from "../src/components/Footer";
import IconContainer from "../src/components/IconContainer";
import ArrowLeftIcon from "../src/components/icons/ArrowLeftIcon";

function WatchDetails({
  products,
  productsLoading,
  productsError,
  cart = [],
  cartCount,
  wishlist = [],
  wishlistCount,
  addToCart,
  addToWishlist,
  removeFromWishlist,
}) {
  const { watchId } = useParams();

  const [quantity, setQuantity] = useState(1);

  const watch = products.find((item) => item.id === Number(watchId));

  const cartItem = watch
    ? cart.find((item) => item.id === watch.id)
    : undefined;

  const cartQuantity = cartItem?.quantity ?? 0;

  const availableQuantity = watch
    ? Math.max(0, watch.stockQuantity - cartQuantity)
    : 0;

  const inStock = availableQuantity > 0;

  const displayedQuantity = Math.min(quantity, Math.max(1, availableQuantity));

  const isWishlisted = watch
    ? wishlist.some((item) => item.id === watch.id)
    : false;

  if (productsLoading) {
    return <p role="status">Loading watch details...</p>;
  }

  if (productsError) {
    return <p role="alert">We couldn't load this watch: {productsError}</p>;
  }

  if (!watch) {
    return <h2>Watch Not Found</h2>;
  }

  return (
    <>
      <Nav cartCount={cartCount} wishlistCount={wishlistCount} />

      <main className="watch-details-page">
        <section
          className="watch-details"
          aria-label={`Details for ${watch.name}`}
        >
          <div className="top container">
            <Link className="link" to="/shop">
              <IconContainer>
                <ArrowLeftIcon />
              </IconContainer>
              BACK TO SHOP
            </Link>
          </div>
          <div className="container">
            <article className="watch-card">
              <div className="product-img-container">
                <img src={watch.img.src} alt={watch.name} />
              </div>

              <div className="actual-watch-detail">
                <div>
                  <p>{watch.brand.toUpperCase()}</p>
                  <h1>{watch.name.toUpperCase()}</h1>
                  <p className="price">{formatPrice(watch.price)}</p>
                </div>

                <article className="watch-description">
                  <h3>Description</h3>
                  {watch.description}
                </article>
              </div>

              <div className="watch-detail-buttons button-container">
                <span className="quantity-control">
                  <button
                    className="btn decreaseBtn"
                    onClick={() =>
                      setQuantity((previous) => Math.max(1, previous - 1))
                    }
                    disabled={displayedQuantity === 1}
                  >
                    -
                  </button>

                  <span>{displayedQuantity}</span>

                  <button
                    className="btn increaseBtn"
                    onClick={() =>
                      setQuantity((previous) =>
                        Math.min(availableQuantity, previous + 1),
                      )
                    }
                    disabled={
                      !inStock || displayedQuantity >= availableQuantity
                    }
                  >
                    +
                  </button>
                </span>

                <button
                  className={inStock ? "btn primary-btn" : "btn btn-disabled"}
                  disabled={!inStock}
                  onClick={() => addToCart(watch, displayedQuantity)}
                >
                  {inStock ? "Add To Bag" : "Out Of Stock"}
                </button>

                <button
                  className="btn secondary-btn"
                  onClick={() =>
                    isWishlisted
                      ? removeFromWishlist(watch)
                      : addToWishlist(watch)
                  }
                >
                  {isWishlisted ? "Remove from wishlist" : "Add To Wishlist"}
                </button>
              </div>
            </article>
          </div>
        </section>
        <section>
          <div className="refund-policy container">
            <p className="refund-text">
              RETURNS ARE ACCEPTED WITHIN 3 DAYS. VIEW REFUND POLICY.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default WatchDetails;
