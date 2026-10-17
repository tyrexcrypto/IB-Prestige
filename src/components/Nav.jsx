import { Link } from "react-router-dom";
import MenuIcon from "./icons/MenuIcon";
import UserIcon from "./icons/UserIcon";
import CartIcon from "./icons/CartIcon";
import WishlistIcon from "./icons/WishlistIcon";
import SearchIcon from "./icons/SearchIcon";
import IconContainer from "./IconContainer";

function NavBar({ cartCount = 0, wishlistCount = 0 }) {
  return (
    <nav aria-label="Main navigation">
      <div className="nav-container container">
        <Link to="/" className="link logo" aria-label="IB Prestige home">
          IB PRESTIGE
        </Link>

        <div className="nav-links">
          <Link to="/shop" className="link">
            SHOP ALL
          </Link>
          <Link to="/shop" className="link">
            COLLECTIONS
          </Link>
          <Link to="/about" className="link">
            OUR STORY
          </Link>
        </div>

        <div className="nav-actions">
          <Link
            to="/shop"
            className="link nav-search-link"
            aria-label="Search watches"
          >
            <SearchIcon />
          </Link>
          <Link
            to="/cart"
            className="link"
            aria-label={`Shopping bag, ${cartCount} items`}
          >
            <IconContainer>
              <CartIcon />
              <span>{cartCount}</span>
            </IconContainer>
          </Link>
          <Link
            to="/wishlist"
            className="link"
            aria-label={`Wishlist, ${wishlistCount} items`}
          >
            <IconContainer>
              <WishlistIcon />
              <span>{wishlistCount}</span>
            </IconContainer>
          </Link>
          <Link to="/signin" className="link" aria-label="Sign in">
            <IconContainer>
              <UserIcon />
            </IconContainer>
          </Link>
          <Link
            to="/shop"
            className="link menu-button"
            aria-label="Browse collection"
          >
            <MenuIcon />
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
