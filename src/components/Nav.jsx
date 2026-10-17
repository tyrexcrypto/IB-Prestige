import { Link } from "react-router-dom";
import MenuIcon from "./icons/MenuIcon";
import UserIcon from "./icons/UserIcon";
import CartIcon from "./icons/CartIcon";
import WishlistIcon from "./icons/WishlistIcon";

function NavBar({ cartCount, wishlistCount }) {
  // nav-actions should be svgs not texts
  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="logo">
          <Link to="/" className="link logo">
            IB PRESTIGE
          </Link>
        </div>

        <div className="nav-links">
          <Link to="/shop" className="link">
            SHOP
          </Link>
          <Link to="/shop" className="link">
            BRANDS
          </Link>
          <Link to="/about" className="link">
            ABOUT
          </Link>
        </div>

        <div className="nav-actions">
          <div>
            <Link to="/cart" className="link">
              <CartIcon />
              <span>{cartCount}</span>
            </Link>
          </div>

          <div>
            <Link to="/wishlist" className="link">
              <WishlistIcon />
              <span>{wishlistCount}</span>
            </Link>
          </div>

          <div>
            <Link
              to="/signin"
              className="link"
              aria-label="navigate to sign-in"
            >
              <UserIcon />
            </Link>
          </div>

          <button className="menu-button">
            <MenuIcon />
          </button>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
