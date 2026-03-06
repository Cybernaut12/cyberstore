import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import StatusPill from "../components/ui/StatusPill";
import { useToast } from "../components/ui/ToastContext";
import { resolveImageUrl } from "../utils/image";

function AdminProducts() {
  const { pushToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const { data } = await API.get("/products/admin/all");
      setProducts(data);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.brand?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q) ||
      p.seller?.email?.toLowerCase().includes(q)
    );
  }, [products, search]);

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      setActionLoading(true);
      await API.delete(`/products/admin/${deletingId}`);
      pushToast("Product deleted", "success");
      setDeletingId(null);
      await fetchProducts();
    } catch (error) {
      pushToast(error.response?.data?.message || "Delete failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="container-app"><Loader label="Loading products..." /></div>;

  return (
    <div className="container-app space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-title">All Products</h1>
          <p className="page-subtitle">Admin can search and delete any product.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/add-product" className="btn-primary">Add Product</Link>
          <Link to="/admin/pending-products" className="btn-secondary">Pending</Link>
        </div>
      </div>

      <input
        className="input w-full md:max-w-lg"
        placeholder="Search name, category, status, brand, seller email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filteredProducts.length === 0 ? (
        <EmptyState title="No products found" description="Try a different search query." />
      ) : (
        <div className="grid gap-3">
          {filteredProducts.map((p) => (
            <div key={p._id} className="card flex flex-wrap items-center gap-3 p-4">
              <img
                src={resolveImageUrl(p.image, "https://via.placeholder.com/100x80?text=No+Image")}
                alt={p.name}
                className="h-16 w-20 rounded-lg object-cover"
              />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold md:text-base">{p.name}</p>
                <p className="text-xs text-[color:var(--text-muted)]">₦{p.price} • {p.category} {p.brand ? `• ${p.brand}` : ""}</p>
                <p className="text-xs text-[color:var(--text-muted)]">Seller: {p.seller?.name || "-"} ({p.seller?.email || "-"})</p>
                <div className="mt-2">
                  <StatusPill status={p.status}>{p.status}</StatusPill>
                </div>
              </div>

              <Button variant="danger" disabled={actionLoading} onClick={() => setDeletingId(p._id)}>
                Delete
              </Button>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deletingId)}
        title="Delete product"
        description="This will permanently remove the product from the marketplace."
        confirmText="Delete"
        danger
        onCancel={() => setDeletingId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

export default AdminProducts;
