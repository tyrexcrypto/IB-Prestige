import { Link } from "react-router-dom";

function BrandCard({ brand }) {
  return (
    <Link
      className="brand-interface"
      to={`/shop?brand=${encodeURIComponent(brand)}`}
      aria-label={`Shop ${brand} watches`}
    >
      {String(brand).toUpperCase()}
      <span className="brand-card-cta">SHOP BRAND ↗</span>
    </Link>
  );
}

export default BrandCard;
