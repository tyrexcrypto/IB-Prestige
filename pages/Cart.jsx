import formatPrice from "../utils/priceFormatter";

import { Link } from "react-router-dom";

import DeleteIcon from "../src/components/icons/DeleteIcon";
import IconContainer from "../src/components/IconContainer";

function Cart({
  cart,

  increaseQuantity,

  decreaseQuantity,

  removeFromCart,

  cartCount,
}) {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,

    0,
  );

  return (
    <div className="cart-page">
      <header className="cart-header">
        <div className="container">
          <h3>My Bag ({cartCount})</h3>

          <Link to="/shop">Continue Shopping</Link>
        </div>
      </header>

      <main>
        <section className="cart">
          <div className="container">
            {cart.length === 0 ? (
              <p>Your bag is currently empty.</p>
            ) : (
              <div className="cart-items">
                {cart.map((item) => (
                  <article className="cart-item" key={item.id}>
                    <div className="product-img-container">
                      <img src={item?.img?.src} alt={item.name} />
                    </div>

                    <div className="cart-item-details">
                      <div className="watch-details">
                        <p className="watch-brand-name">
                          {item.brand.toUpperCase()}
                        </p>
                        <h3>{item.name.toUpperCase()}</h3>
                        <p>{formatPrice(item.price)}</p>
                      </div>
                      <div className="quantity-setter">
                        {item.quantity === 1 ? (
                          <button disabled={item.quantity === 1}>-</button>
                        ) : (
                          <button onClick={() => decreaseQuantity(item.id)}>
                            -
                          </button>
                        )}

                        <span>{item.quantity}</span>

                        <button
                          type="button"
                          onClick={() => increaseQuantity(item.id)}
                          disabled={item.quantity >= item.stockQuantity}
                          aria-label={`increase ${item.name} quantity`}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="remove-btn-container">
                      <button onClick={() => removeFromCart(item.id)}>
                        <IconContainer>
                          <DeleteIcon />
                        </IconContainer>
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="cart-footer">
        <div className="cart-summary container">
          <div className="subtotal-container">
            <h2>Cart Subtotal</h2>

            <p>{formatPrice(subtotal)}</p>
          </div>

          {cart.length === 0 ? (
            <Link to="/shop">Continue Shopping</Link>
          ) : (
            <Link to="/checkoutpage">Proceed to Checkout</Link>
          )}
        </div>
      </footer>
    </div>
  );
}

export default Cart;
