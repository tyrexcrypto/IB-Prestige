import { Link } from "react-router-dom";
import MenuIcon from "./icons/MenuIcon";
import UserIcon from "./icons/UserIcon";
import CartIcon from "./icons/CartIcon";
import WishlistIcon from "./icons/WishlistIcon";
import SearchIcon from "./icons/SearchIcon";
import IconContainer from "./IconContainer";

function NavBar({ cartCount, wishlistCount }) {
  // nav-actions should be svgs not texts
  return (
    <nav>
      <div className="nav-container container">
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
          <SearchIcon />

          <Link to="/cart" className="link">
            <IconContainer>
              <CartIcon />
              <span>{cartCount}</span>
            </IconContainer>
          </Link>

          <Link to="/wishlist" className="link">
            <IconContainer>
              <WishlistIcon />
              <span>{wishlistCount}</span>
            </IconContainer>
          </Link>

          <Link to="/signin" className="link" aria-label="navigate to sign-in">
            <IconContainer>
              <UserIcon />
            </IconContainer>
          </Link>

          <MenuIcon />
        </div>
      </div>
    </nav>
  );
}

export default NavBar;
