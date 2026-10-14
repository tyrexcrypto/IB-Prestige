import { useEffect, useState } from "react";
import { supabase } from "../src/lib/supabaseClient";

function AdminAddProduct() {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    price: "",
    stockQuantity: "",
    description: "",
    imageUrl: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((previousData) => ({ ...previousData, [name]: value }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please Select an Image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1034 * 1024) {
      setErrorMessage("Image must be 5mb or smaller.");
      event.target.value = "";
      return;
    }

    setErrorMessage("");
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    if (!imageFile) {
      setErrorMessage("Please select a product image.");
      setIsSaving(false);
      return;
    }

    const safeFileName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-");

    const filePath = `${crypto.randomUUID()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(filePath, imageFile, {
        contentType: imageFile.type,
        upsert: false,
      });

    if (uploadError) {
      setErrorMessage(uploadError.message);
      setIsSaving(false);
      return;
    }

    const { data: imageData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    const imageUrl = imageData.publicUrl;

    const { data, error } = await supabase
      .from("products")
      .insert([
        {
          name: formData.name.trim(),
          brand: formData.brand.trim(),
          category: formData.category,
          price: Number(formData.price),
          stock_quantity: Number(formData.stockQuantity),
          description: formData.description.trim(),
          image_url: imageUrl,
        },
      ])
      .select()
      .single();

    setIsSaving(false);

    if (error) {
      setErrorMessage(error.message);
    }

    setSuccessMessage(`${data.name} was saved successfully.`);

    setFormData({
      name: "",
      brand: "",
      category: "",
      price: "",
      stockQuantity: "",
      description: "",
      imageUrl: "",
    });
    setImageFile(null);
    setImagePreview("");
  }

  return (
    <main className="add-admin-product container">
      <h2>Add a new watch</h2>
      <p>Enter the details of the product you want to list.</p>

      <form onSubmit={handleSubmit}>
        {successMessage && <p role="status">Success Message</p>}

        {errorMessage && <p role="alert">Error Message</p>}

        <label htmlFor="name">Name</label>
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
          <option value="">Select A Category</option>
          <option value="luxury">Luxury</option>
          <option value="classic">Classic</option>
          <option value="sport">Sport</option>
          <option value="casual">Casual</option>
          <option value="expensive">Expensive</option>
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

        <label htmlFor="productImage">Product Image</label>
        <input
          id="productImage"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
        />

        {imagePreview && (
          <div className="image-preview">
            <img
              src={imagePreview}
              alt="preview of selected watch"
              style={{ width: "220px", maxWidth: "100%", objectFit: "contain" }}
            />
          </div>
        )}

        <button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Add Product"}
        </button>
      </form>
    </main>
  );
}

export default AdminAddProduct;
