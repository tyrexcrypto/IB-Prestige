import brands from "../../data/brands";
import BrandCard from "./BrandCard";
import { Link } from "react-router-dom";

function BrandCategoriesSection() {
  return (
    <section className="brand-categories">
      <div className="container">
        <div className="section-header">
          <p className="eyebrow">EXPLORE</p>
          <h2>SHOP BY BRAND</h2>
        </div>

        <div className="section-contents">
          {brands.map((brand) => (
            <BrandCard key={brand} brand={brand} />
          ))}
        </div>

        <div className="button-container">
          <Link className="btn primary-btn section-button" to="/shop">
            VIEW ALL BRANDS
          </Link>
        </div>
      </div>
    </section>
  );
}

export default BrandCategoriesSection;
