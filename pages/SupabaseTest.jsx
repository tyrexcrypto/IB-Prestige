import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabaseClient";

function SupabaseTest() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      const { data, error } = await supabase.from("products").select("*");
      if (error) {
        setError(error.mesage);
      } else {
        setProducts(data);
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  if (loading) return <p>Loading Products...</p>;

  if (error) return <p>Error: {error}</p>;

  return (
    <main>
      <h1>Supabase Product Test</h1>

      {products.length === 0
        ? "No products returned"
        : products.map((product) => (
            <article key={product.id}>
              <h2>{product.name}</h2>
              <p>{product.brand}</p>
              <p>{product.price}</p>
              <p>{product.stock_quantity}</p>
            </article>
          ))}
    </main>
  );
}

export default SupabaseTest;
