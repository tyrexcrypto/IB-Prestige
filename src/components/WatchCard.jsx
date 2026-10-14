import formatPrice from "../../utils/priceFormatter";
import { useNavigate } from "react-router-dom";
import WishlistIcon from "./icons/WishlistIcon";
import Button from "./Button";

function WatchCard({
  watch,
  cart = [],
  wishlist = [],
  addToCart,
  addToWishlist,
  removeFromWishlist,
}) {
  const navigate = useNavigate();

  const isWishlisted = wishlist.some((item) => item.id === watch.id);

  function handleAddToCart(event) {
    event.stopPropagation();
    if (watch.stockQuantity <= 0) return;
    addToCart(watch);
  }

  function handleWishlistClick(event) {
    event.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(watch);
    } else {
      addToWishlist(watch);
    }
  }

  //const inStock = watch.stockQuantity > 0;

  const cartItem = cart.find((item) => item.id === watch.id);

  const cartQuantity = cartItem?.quantity ?? 0;

  const inStock = watch.stockQuantity > cartQuantity;

  return (
    <article
      className="watch-card"
      onClick={() => navigate(`/shop/${watch.id}`)}
    >
      <button
        type="button"
        onClick={handleWishlistClick}
        aria-pressed={isWishlisted}
        aria-label={
          isWishlisted
            ? `remove ${watch.name} to wishlist`
            : `Add ${watch.name} to wishlist`
        }
        className="like-btn-status"
      >
        {isWishlisted ? (
          <WishlistIcon variant="liked" />
        ) : (
          <WishlistIcon variant="not-liked" />
        )}
      </button>

      <div className="top product-img-container">
        <img src={watch.img.src} alt={watch.name} />
      </div>

      <div className="bottom">
        <div className="product-details">
          <div className="">
            <p className="product-brand-name">{watch.brand.toUpperCase()}</p>
            <h3 className="product-name">{watch.name.toUpperCase()}</h3>
          </div>

          <div className="product-price">
            <p>{formatPrice(watch.price)}</p>
          </div>
        </div>

        <Button inStock={inStock} onClick={handleAddToCart}>
          {inStock ? "Add To Bag" : "Out Of Stock"}
        </Button>
      </div>
    </article>
  );
}

export default WatchCard;
