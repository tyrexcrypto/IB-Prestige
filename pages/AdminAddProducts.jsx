import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";

const ADMIN_UID = "d18f58e1-1fc0-4138-ba13-0dda15c55979";
const IMAGE_BUCKET = "product-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const INITIAL_FORM = {
  name: "",
  brand: "",
  category: "",
  price: "",
  stockQuantity: "",
  description: "",
};

function AdminAddProduct() {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previous) => ({ ...previous, [name]: value }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Choose a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("Image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setImageFile(file);
    setImagePreview(previewUrl);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function resetForm() {
    setFormData(INITIAL_FORM);
    setImageFile(null);
    setImagePreview("");
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;

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
      !Number.isFinite(price) ||
      price < 0 ||
      formData.stockQuantity.trim() === "" ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setErrorMessage(
        "Complete every required field. Price must be zero or more, and stock must be a whole number of zero or more.",
      );
      return;
    }

    if (!imageFile) {
      setErrorMessage("Please select a product image.");
      return;
    }

    setIsSaving(true);
    let uploadedPath = null;

    try {
      // Keep uploads in the authenticated admin's folder to match the existing
      // product-image storage policy used by the edit-product page.
      const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");
      uploadedPath = `${ADMIN_UID}/${crypto.randomUUID()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from(IMAGE_BUCKET)
        .upload(uploadedPath, imageFile, {
          contentType: imageFile.type,
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: imageData } = supabase.storage
        .from(IMAGE_BUCKET)
        .getPublicUrl(uploadedPath);

      if (!imageData?.publicUrl) {
        throw new Error("The uploaded image URL could not be created.");
      }

      const { data: product, error: insertError } = await supabase
        .from("products")
        .insert({
          name: formData.name.trim(),
          brand: formData.brand.trim(),
          category: formData.category,
          price,
          stock_quantity: stockQuantity,
          description: formData.description.trim(),
          image_url: imageData.publicUrl,
        })
        .select("id, name")
        .single();

      if (insertError) throw insertError;
      if (!product)
        throw new Error("The product was not returned after saving.");

      setSuccessMessage(`${product.name} was added successfully.`);
      resetForm();
    } catch (error) {
      setErrorMessage(error?.message || "Couldn't add this product.");

      // If the database insert failed after upload, remove the orphaned image.
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error(
            "Unused product image cleanup failed:",
            cleanupError.message,
          );
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="add-admin-product container">
      <header>
        <h1>Add a new watch</h1>
        <p>Enter the product details to add a watch to the catalogue.</p>
        <p>
          <Link to="/admin/products">Back to products</Link> ·{" "}
          <Link to="/admin/orders">View orders</Link>
        </p>
      </header>

      {successMessage && <p role="status">{successMessage}</p>}
      {errorMessage && <p role="alert">{errorMessage}</p>}

      <form onSubmit={handleSubmit}>
        <label htmlFor="name">Watch name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          maxLength={120}
        />

        <label htmlFor="brand">Brand</label>
        <input
          id="brand"
          name="brand"
          value={formData.brand}
          onChange={handleChange}
          required
          maxLength={80}
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
          maxLength={5000}
        />

        <label htmlFor="productImage">Product image (maximum 5 MB)</label>
        <input
          ref={fileInputRef}
          id="productImage"
          name="productImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />

        {imagePreview && (
          <div className="image-preview">
            <img
              src={imagePreview}
              alt="Preview of the selected watch"
              style={{ width: "220px", maxWidth: "100%", objectFit: "contain" }}
            />
          </div>
        )}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving product…" : "Add product"}
        </button>
      </form>
    </main>
  );
}

export default AdminAddProduct;
