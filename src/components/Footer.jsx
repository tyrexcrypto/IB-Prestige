import { Link } from "react-router-dom";

function Footer() {
  // footer not completed ... add legal protocols
  return (
    <footer>
      <div className="footer-container container">
        <div className="footer-top brand-name-and-logo">
          <span className="logo-container footer-logo">LOGO</span>
          <span className=" logo-text">IB PRESTIGE</span>
        </div>

        <div className="footer-sections footer-contents">
          <div className="footer-section footer-shop">
            <div className="footer-section-header">
              <h2>SHOP</h2>
            </div>
            <div className="footer-section-contents">
              <Link to="" className="link">
                New Arrivals
              </Link>
              <Link to="/shop" className="link">
                All Watches
              </Link>
              <Link to="" className="link">
                Collections
              </Link>
              <Link to="/brands" className="link">
                Brands
              </Link>
            </div>
          </div>

          <div className="footer-section footer-discover">
            <div className="footer-section-header">
              <h2>DISCOVER</h2>
            </div>
            <div className="footer-section-contents">
              <Link to="" className="link">
                About
              </Link>
              <Link to="" className="link">
                Contact
              </Link>
            </div>
          </div>

          <div className="footer-section footer-socials">
            <div className="footer-section-header">
              <h2>CONNECT</h2>
            </div>
            <div className="footer-section-contents">
              <Link to="" className="link">
                Instagram
              </Link>
              <Link to="" className="link">
                Tiktok
              </Link>
              <Link to="" className="link">
                WhatsApp
              </Link>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 IB PRESTIGE. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
