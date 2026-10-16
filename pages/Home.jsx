import NavBar from "../src/components/Nav";
import Hero from "../src/components/Hero";
import NewArrivals from "../src/components/NewArrivals";
import BrandCategoriesSection from "../src/components/BrandCategoriesSection";
import FeaturedSection from "../src/components/FeaturedSection";
import EditorialSection from "../src/components//EditorialSection";
import Footer from "../src/components/Footer";
import IBPrestigeStandardSection from "../src/components/IBPrestigeStandardSection";

function Home({
  products,
  productsLoading,
  productsError,
  cart,
  cartCount,
  wishlistCount,
  addToCart,
  addToWishlist,
  wishlist,
  removeFromWishlist,
}) {
  return (
    <>
      <header>
        <NavBar cartCount={cartCount} wishlistCount={wishlistCount} />
      </header>

      <main>
        <Hero />
        <NewArrivals
          products={products}
          productsLoading={productsLoading}
          productsError={productsError}
          cart={cart}
          addToCart={addToCart}
          addToWishlist={addToWishlist}
          wishlist={wishlist}
          removeFromWishlist={removeFromWishlist}
        />
        <BrandCategoriesSection />
        <FeaturedSection />
        <EditorialSection />
        <IBPrestigeStandardSection />
      </main>
      <Footer />
    </>
  );
}

export default Home;
