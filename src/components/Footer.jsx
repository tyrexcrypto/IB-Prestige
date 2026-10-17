import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-container container">
        <div className="footer-top brand-name-and-logo">
          <span className="logo-container footer-logo" aria-hidden="true">
            IP
          </span>
          <span className="logo-text">IB PRESTIGE</span>
        </div>

        <div className="footer-sections footer-contents">
          <div className="footer-section footer-shop">
            <div className="footer-section-header">
              <h2>THE COLLECTION</h2>
            </div>
            <div className="footer-section-contents">
              <Link to="/shop" className="link">
                Shop all watches
              </Link>
              <Link to="/shop" className="link">
                New arrivals
              </Link>
              <Link to="/wishlist" className="link">
                Your wishlist
              </Link>
            </div>
          </div>

          <div className="footer-section footer-discover">
            <div className="footer-section-header">
              <h2>IB PRESTIGE</h2>
            </div>
            <div className="footer-section-contents">
              <Link to="/about" className="link">
                Our story
              </Link>
              <Link to="/signin" className="link">
                My account
              </Link>
              <Link to="/cart" className="link">
                Shopping bag
              </Link>
            </div>
          </div>

          <div className="footer-section footer-socials">
            <div className="footer-section-header">
              <h2>NEED ASSISTANCE?</h2>
            </div>
            <div className="footer-section-contents">
              <a
                href="https://wa.me/"
                className="link"
                target="_blank"
                rel="noreferrer"
              >
                Contact us on WhatsApp
              </a>
              <a
                href="https://instagram.com/"
                className="link"
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
              <span className="footer-assistance-note">
                Questions about a timepiece or an order? We’re here to help.
              </span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} IB PRESTIGE. ALL RIGHTS RESERVED.</p>
          <p>TIME, REFINED.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
