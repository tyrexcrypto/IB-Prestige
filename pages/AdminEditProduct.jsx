import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";

function AdminEditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    stockQuantity: "",
    description: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      setErrorMessage("");

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .maybeSingle();

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
        return;
      }

      if (!data) {
        setErrorMessage("Product not found.");
        setIsLoading(false);
        return;
      }

      setFormData({
        name: data.name ?? "",
        brand: data.brand ?? "",
        category: data.category ?? "",
        price: String(data.price ?? ""),
        stockQuantity: String(data.stock_quantity ?? ""),
        description: data.description ?? "",
      });

      setIsLoading(false);
    }

    fetchProduct();
  }, [productId]);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const price = Number(formData.price);
    const stockQuantity = Number(formData.stockQuantity);

    if (
      !formData.name.trim() ||
      !formData.brand.trim() ||
      !formData.category ||
      !formData.description.trim() ||
      formData.price.trim() === "" ||
      formData.stockQuantity.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setErrorMessage(
        "Check your fields. Price must be non-negative and stock must be a whole number of zero or more.",
      );
      return;
    }

    setIsSaving(true);

    const { data, error } = await supabase
      .from("products")
      .update({
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category,
        price,
        stock_quantity: stockQuantity,
        description: formData.description.trim(),
      })
      .eq("id", productId)
      .select()
      .maybeSingle();

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    if (!data) {
      setErrorMessage(
        "No product was updated. It may have been deleted or you may not have permission.",
      );
      return;
    }

    setSuccessMessage("Product updated successfully.");
    navigate("/admin/products");
  }

  if (isLoading) {
    return <p role="status">Loading product...</p>;
  }

  return (
    <main className="admin-edit-product container">
      <h1>Edit Product</h1>
      <p>Update the details of this watch.</p>

      {errorMessage && <p role="alert">{errorMessage}</p>}

      {successMessage && <p role="status">{successMessage}</p>}

      {errorMessage === "Product not found." ? (
        <Link to="/admin/products">Back to products</Link>
      ) : (
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">Watch name</label>
          <input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label htmlFor="brand">Brand</label>
          <input
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            required
          />

          <label htmlFor="category">Category</label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="luxury">Luxury</option>
            <option value="classic">Classic</option>
            <option value="sport">Sport</option>
            <option value="casual">Casual</option>
          </select>

          <label htmlFor="price">Price (₦)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={handleChange}
            required
          />

          <label htmlFor="stockQuantity">Stock quantity</label>
          <input
            id="stockQuantity"
            name="stockQuantity"
            type="number"
            min="0"
            step="1"
            value={formData.stockQuantity}
            onChange={handleChange}
            required
          />

          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </button>

          <Link to="/admin/products">Cancel</Link>
        </form>
      )}
    </main>
  );
}

export default AdminEditProduct;
