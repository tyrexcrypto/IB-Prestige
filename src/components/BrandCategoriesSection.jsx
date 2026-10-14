import brands from "../../data/brands";
import BrandCard from "./BrandCard";

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
          <button className="btn primary-btn section-button">
            VIEW ALL BRANDS
          </button>
        </div>
      </div>
    </section>
  );
}

export default BrandCategoriesSection;
