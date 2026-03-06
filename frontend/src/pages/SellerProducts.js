import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Button from "../components/ui/Button";
import InputField from "../components/ui/InputField";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import StatusPill from "../components/ui/StatusPill";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useToast } from "../components/ui/ToastContext";
import { normalizeImageUrl, resolveImageUrl } from "../utils/image";

const emptyForm = {
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

function SellerProducts() {
  const { pushToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [localPreview, setLocalPreview] = useState("");

  const fetchMine = async () => {
    try {
      const { data } = await API.get("/products/mine");
      setProducts(data);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMine();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      if (localPreview.startsWith("blob:")) {
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name || "",
      description: p.description || "",
      price: p.price || "",
      category: p.category || "",
      brand: p.brand || "",
      size: p.size || "",
      color: p.color || "",
      stock: p.stock || "",
      image: p.image || "",
    });
    setLocalPreview("");
    setShowForm(true);
  };

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
      const payload = {
        ...form,
        image: normalizeImageUrl(form.image),
        price: Number(form.price),
        stock: Number(form.stock),
      };

      if (editing?._id) {
        await API.put(`/products/${editing._id}`, payload);
        pushToast("Product updated", "success");
      } else {
        await API.post("/products", payload);
        pushToast("Product created and sent for approval", "success");
      }

      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);
      setLocalPreview("");
      await fetchMine();
    } catch (error) {
      pushToast(error.response?.data?.message || "Save failed", "error");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      await API.delete(`/products/${deleteId}`);
      pushToast("Product deleted", "success");
      await fetchMine();
    } catch (error) {
      pushToast(error.response?.data?.message || "Delete failed", "error");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) return <div className="container-app"><Loader label="Loading your products..." /></div>;

  return (
    <div className="container-app space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">My Products</h1>
          <p className="page-subtitle">Manage your listings, status, images, and stock.</p>
        </div>
        <Link to="/seller/add-product" className="btn-primary">Add New Product</Link>
      </div>

      {showForm ? (
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
            <Button disabled={saving}>{saving ? "Saving..." : editing ? "Update Product" : "Create Product"}</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </form>
      ) : null}

      {products.length === 0 ? (
        <EmptyState title="No products listed" description="Create your first product listing to start selling." action={<Link to="/seller/add-product" className="btn-primary">Add Product</Link>} />
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <div key={p._id} className="card flex flex-wrap items-center gap-3 p-4">
              <img src={resolveImageUrl(p.image, "https://via.placeholder.com/100x80?text=No+Image")} alt={p.name} className="h-16 w-20 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold md:text-base">{p.name}</p>
                <p className="text-xs text-[color:var(--text-muted)]">₦{p.price} • Stock {p.stock}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusPill status={p.status}>{p.status}</StatusPill>
                  {p.status === "rejected" && p.rejectionReason ? <span className="text-xs text-[color:var(--danger)]">Reason: {p.rejectionReason}</span> : null}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                <Button variant="danger" onClick={() => setDeleteId(p._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteId)}
        title="Delete product"
        description="This action cannot be undone."
        confirmText="Delete"
        danger
        onCancel={() => setDeleteId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default SellerProducts;
