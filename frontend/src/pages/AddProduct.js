import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import { useToast } from "../components/ui/ToastContext";
import { normalizeImageUrl, resolveImageUrl } from "../utils/image";

const initialForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  brand: "",
  size: "",
  color: "",
  stock: "",
  image: "",
};

function AddProduct() {
  const { user } = useContext(AuthContext);
  const { pushToast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [localPreview, setLocalPreview] = useState("");

  const isAdmin = user?.role === "admin";

  const backUrl = useMemo(() => {
    if (isAdmin) return "/admin/pending-products";
    return "/seller/products";
  }, [isAdmin]);

  useEffect(() => {
    return () => {
      if (localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const uploadImage = async (file) => {
    try {
      const body = new FormData();
      body.append("image", file);
      const { data } = await API.post("/upload", body, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const uploadedUrl = data?.url || data?.secure_url || data?.imageUrl || data?.image;
      if (!uploadedUrl) {
        throw new Error("Upload succeeded but image URL is missing");
      }

      setForm((f) => ({ ...f, image: uploadedUrl }));
      pushToast("Image uploaded", "success");
    } catch (error) {
      pushToast(error.response?.data?.message || "Image upload failed", "error");
    }
  };

  const handleFileSelect = (file) => {
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview((prev) => {
      if (prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    uploadImage(file);
  };

  const submitProduct = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const endpoint = isAdmin ? "/products/admin" : "/products";

      await API.post(endpoint, {
        ...form,
        image: normalizeImageUrl(form.image),
        price: Number(form.price),
        stock: Number(form.stock),
      });

      pushToast(isAdmin ? "Product added by admin" : "Product created and sent for approval", "success");
      navigate(backUrl);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to create product", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="container-app space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="page-title">Add Product</h1>
          <p className="page-subtitle">
            {isAdmin
              ? "Create a marketplace product directly as admin."
              : "Add your product listing for admin review."}
          </p>
        </div>
        <Link to={backUrl} className="btn-secondary">Back</Link>
      </div>

      <form onSubmit={submitProduct} className="card grid gap-3 p-5 md:grid-cols-2">
        <InputField label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        <InputField label="Category" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} required />
        <InputField label="Price" type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required />
        <InputField label="Stock" type="number" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} required />
        <InputField label="Brand" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} />
        <InputField label="Size" value={form.size} onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))} />
        <InputField label="Color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} />
        <InputField label="Image URL" value={form.image} onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))} />

        {localPreview || normalizeImageUrl(form.image) ? (
          <div className="md:col-span-2">
            <p className="label">Image preview</p>
            <img
              src={resolveImageUrl(localPreview || form.image, "https://via.placeholder.com/320x240?text=No+Image")}
              alt="Product preview"
              className="h-36 w-48 rounded-lg border border-[color:var(--border)] object-cover"
            />
          </div>
        ) : null}

        <div className="md:col-span-2">
          <label className="label">Upload image</label>
          <input
            className="input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
              e.target.value = "";
            }}
          />
        </div>

        <div className="md:col-span-2">
          <label className="label">Description</label>
          <textarea className="input min-h-[120px]" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} required />
        </div>

        <div className="md:col-span-2 flex gap-3">
          <Button disabled={saving}>{saving ? "Creating..." : "Create Product"}</Button>
          <Link to={backUrl} className="btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
