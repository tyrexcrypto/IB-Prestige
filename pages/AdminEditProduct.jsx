import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { supabase } from "../src/lib/supabaseClient";

const ADMIN_UID = "d18f58e1-1fc0-4138-ba13-0dda15c55979";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const IMAGE_BUCKET = "product-images";

const INITIAL_FORM = {
  name: "",
  brand: "",
  category: "",
  price: "",
  stockQuantity: "",
  description: "",
};

function AdminEditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [currentImageUrl, setCurrentImageUrl] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef(null);

  // Load the selected product from Supabase.
  useEffect(() => {
    let active = true;

    async function fetchProduct() {
      setIsLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .maybeSingle();

        if (error) throw error;

        if (!data) {
          throw new Error("Product not found.");
        }

        if (!active) return;

        setFormData({
          name: data.name ?? "",
          brand: data.brand ?? "",
          category: data.category ?? "",
          price: String(data.price ?? ""),
          stockQuantity: String(data.stock_quantity ?? ""),
          description: data.description ?? "",
        });

        setCurrentImageUrl(data.image_url ?? "");
      } catch (error) {
        if (active) {
          setErrorMessage(error.message || "Couldn't load product.");
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    fetchProduct();

    return () => {
      active = false;
    };
  }, [productId]);

  // Clean up the temporary image preview when this page unmounts.
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));

    setErrorMessage("");
    setSuccessMessage("");
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setErrorMessage("The image must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    // Release the previous preview URL before creating another.
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
    }

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setImageFile(file);
    setImagePreview(previewUrl);
    setErrorMessage("");
    setSuccessMessage("");
  }

  function cancelImageReplacement() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setImageFile(null);
    setImagePreview("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setErrorMessage("");
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
      formData.stockQuantity.trim() === "" ||
      !Number.isFinite(price) ||
      price < 0 ||
      !Number.isInteger(stockQuantity) ||
      stockQuantity < 0
    ) {
      setErrorMessage(
        "Enter all required fields. Price must be non-negative, and stock must be a whole number of zero or more.",
      );
      return;
    }

    setIsSaving(true);

    let uploadedFilePath = null;

    try {
      let imageUrl = currentImageUrl;

      // Upload a replacement only if the admin selected one.
      if (imageFile) {
        const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");

        const filePath = `${ADMIN_UID}/${crypto.randomUUID()}-${safeFileName}`;

        const { error: uploadError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .upload(filePath, imageFile, {
            contentType: imageFile.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        uploadedFilePath = filePath;

        const { data: imageData } = supabase.storage
          .from(IMAGE_BUCKET)
          .getPublicUrl(filePath);

        imageUrl = imageData.publicUrl;
      }

      // Update the existing product rather than inserting a new row.
      const { data, error } = await supabase
        .from("products")
        .update({
          name: formData.name.trim(),
          brand: formData.brand.trim(),
          category: formData.category,
          price,
          stock_quantity: stockQuantity,
          description: formData.description.trim(),
          image_url: imageUrl,
        })
        .eq("id", productId)
        .select()
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        throw new Error(
          "No product was updated. It may have been deleted or you may not have permission.",
        );
      }

      // The database now references the replacement image.
      setCurrentImageUrl(imageUrl);
      setImageFile(null);
      setSuccessMessage("Product updated successfully.");

      navigate("/admin/products");
    } catch (error) {
      setErrorMessage(error.message || "Couldn't update product.");

      // If the upload succeeded but the database update failed,
      // try to remove the unused uploaded image.
      if (uploadedFilePath) {
        const { error: cleanupError } = await supabase.storage
          .from(IMAGE_BUCKET)
          .remove([uploadedFilePath]);

        if (cleanupError) {
          console.error(
            "Replacement image cleanup failed:",
            cleanupError.message,
          );
        }
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p role="status">Loading product...</p>;
  }

  if (errorMessage === "Product not found.") {
    return (
      <main className="admin-edit-product container">
        <h1>Product not found</h1>
        <p>This product may have been deleted.</p>
        <Link to="/admin/products">Back to products</Link>
      </main>
    );
  }

  return (
    <main className="admin-edit-product container">
      <h1>Edit Product</h1>
      <p>Update the details of this watch.</p>

      {errorMessage && <p role="alert">{errorMessage}</p>}
      {successMessage && <p role="status">{successMessage}</p>}

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

        <fieldset>
          <legend>Product image</legend>

          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Replacement product preview"
              style={{
                width: "180px",
                height: "180px",
                objectFit: "contain",
              }}
            />
          ) : currentImageUrl ? (
            <img
              src={currentImageUrl}
              alt={`${formData.name} product`}
              style={{
                width: "180px",
                height: "180px",
                objectFit: "contain",
              }}
            />
          ) : (
            <p>No product image available.</p>
          )}

          <label htmlFor="image">Choose replacement image (optional)</label>

          <input
            ref={fileInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
          />

          {imageFile && (
            <button
              type="button"
              onClick={cancelImageReplacement}
              disabled={isSaving}
            >
              Cancel image replacement
            </button>
          )}

          <p>Maximum image size: 5 MB.</p>
        </fieldset>

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </button>

        <Link to="/admin/products">Cancel</Link>
      </form>
    </main>
  );
}

export default AdminEditProduct;
