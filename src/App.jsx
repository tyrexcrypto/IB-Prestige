import { useEffect, useState } from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "../pages/Home";

import Shop from "../pages/Shop";

import WatchDetails from "../pages/WatchDetails";

import Cart from "../pages/Cart";

import CheckOutPage from "../pages/CheckOutPage";

import Wishlist from "../pages/Wishlist";

import SignUp from "../pages/SignUp";

import SignIn from "../pages/SignIn";

import About from "../pages/About";

import SupabaseTest from "../pages/SupabaseTest";

import { supabase } from "./lib/supabaseClient";

import AdminAddProducts from "../pages/AdminAddProducts";

import AdminLogin from "../pages/AdminLogin";

import AdminProducts from "../pages/AdminProducts";

import RequireAdmin from "./components/RequireAdmin";

import AdminEditProduct from "../pages/AdminEditProduct";

function App() {
  function readStoredArray(key) {
    try {
      const stored = JSON.parse(localStorage.getItem(key));

      if (!Array.isArray(stored)) return [];

      return stored.filter(
        (item) =>
          item !== null && typeof item === "object" && item.id !== undefined,
      );
    } catch {
      return [];
    }
  }

  const [cart, setCart] = useState(() => readStoredArray("ib-prestige-cart"));

  const [wishlist, setWishlist] = useState(() =>
    readStoredArray("ib-prestige-wishlist"),
  );

  useEffect(() => {
    localStorage.setItem("ib-prestige-cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("ib-prestige-wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setProductsLoading(true);
      setProductsError("");
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: true });

      if (error) {
        setProductsError(error.message);
        setProductsLoading(false);
        return;
      }

      const formattedProducts = data.map((product) => ({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        price: Number(product.price),
        stockQuantity: product.stock_quantity,
        description: product.description,
        img: {
          src: product.image_url,
        },
      }));
      setProducts(formattedProducts);
      setProductsLoading(false);
    }
    fetchProducts();
  }, []);

  function addToCart(watch, quantity = 1) {
    if (
      !watch ||
      watch.stockQuantity <= 0 ||
      quantity < 1 ||
      quantity > watch.stockQuantity
    ) {
      return;
    }

    setCart((previousCart) => {
      const existingItem = previousCart.find((item) => item.id === watch.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;

        if (newQuantity > watch.stockQuantity) {
          return previousCart;
        }

        return previousCart.map((item) =>
          item.id === watch.id
            ? {
                ...item,
                quantity: newQuantity,
              }
            : item,
        );
      }
      return [
        ...previousCart,
        {
          ...watch,
          quantity,
        },
      ];
    });
  }

  function removeFromCart(watchId) {
    setCart((previousCart) =>
      previousCart.filter((item) => item.id !== watchId),
    );
  }

  function increaseQuantity(watchId) {
    setCart((previousCart) =>
      previousCart.map((item) => {
        if (item.id !== watchId) return item;
        if (item.quantity >= item.stockQuantity) return item;

        return {
          ...item,
          quantity: item.quantity + 1,
        };
      }),
    );
  }

  function decreaseQuantity(watchId) {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === watchId
            ? {
                ...item,

                quantity: item.quantity - 1,
              }
            : item,
        )

        .filter((item) => item.quantity > 0),
    );
  }

  function addToWishlist(watch) {
    setWishlist((previousWishlist) => {
      if (previousWishlist.some((item) => item.id === watch.id)) {
        return previousWishlist;
      }

      return [...previousWishlist, watch];
    });
  }

  function removeFromWishlist(watch) {
    setWishlist((previousWishlist) =>
      previousWishlist.filter((item) => item.id !== watch.id),
    );
  }

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const wishlistCount = wishlist.length;
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              products={products}
              productsLoading={productsLoading}
              productsError={productsError}
              cart={cart}
              cartCount={cartCount}
              wishlist={wishlist}
              wishlistCount={wishlistCount}
              addToCart={addToCart}
              addToWishlist={addToWishlist}
              removeFromWishlist={removeFromWishlist}
            />
          }
        />

        <Route
          path="/shop"
          element={
            <Shop
              products={products}
              productsLoading={productsLoading}
              productsError={productsError}
              cart={cart}
              cartCount={cartCount}
              wishlist={wishlist}
              wishlistCount={wishlistCount}
              removeFromWishlist={removeFromWishlist}
              addToCart={addToCart}
              addToWishlist={addToWishlist}
            />
          }
        />

        <Route
          path="/shop/:watchId"
          element={
            <WatchDetails
              products={products}
              productsLoading={productsLoading}
              productsError={productsError}
              cart={cart}
              cartCount={cartCount}
              wishlist={wishlist}
              wishlistCount={wishlistCount}
              addToCart={addToCart}
              addToWishlist={addToWishlist}
              removeFromWishlist={removeFromWishlist}
            />
          }
        />

        <Route
          path="/cart"
          element={
            <Cart
              cart={cart}
              cartCount={cartCount}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              removeFromCart={removeFromCart}
            />
          }
        />

        <Route
          path="/wishlist"
          element={
            <Wishlist
              cart={cart}
              cartCount={cartCount}
              wishlist={wishlist}
              wishlistCount={wishlistCount}
              removeFromWishlist={removeFromWishlist}
              addToCart={addToCart}
            />
          }
        />

        <Route
          path="/checkoutpage"
          element={
            <CheckOutPage
              cart={cart}
              cartCount={cartCount}
              wishlistCount={wishlistCount}
            />
          }
        />

        <Route path="/about" element={<About />} />

        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        <Route path="/supabasetest" element={<SupabaseTest />} />

        <Route
          path="/admin/products/new"
          element={
            <RequireAdmin>
              <AdminAddProducts />
            </RequireAdmin>
          }
        />

        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/products"
          element={
            <RequireAdmin>
              <AdminProducts />
            </RequireAdmin>
          }
        />

        <Route
          path="/admin/products/:productId/edit"
          element={
            <RequireAdmin>
              <AdminEditProduct />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
