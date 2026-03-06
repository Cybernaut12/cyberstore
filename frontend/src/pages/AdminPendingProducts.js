import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import Button from "../components/ui/Button";
import ConfirmModal from "../components/ui/ConfirmModal";
import InputField from "../components/ui/InputField";
import { useToast } from "../components/ui/ToastContext";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../utils/image";

function AdminPendingProducts() {
  const { pushToast } = useToast();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejecting, setRejecting] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [reason, setReason] = useState("");

  const fetchPending = async () => {
    try {
      const { data } = await API.get("/products/admin/pending");
      setProducts(data);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to load pending products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const approve = async (id) => {
    try {
      setActionLoading(true);
      await API.put(`/products/admin/${id}/approve`, {});
      pushToast("Product approved", "success");
      await fetchPending();
    } catch (error) {
      pushToast(error.response?.data?.message || "Approve failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async () => {
    if (!rejecting) return;
    try {
      setActionLoading(true);
      await API.put(`/products/admin/${rejecting}/reject`, { reason });
      pushToast("Product rejected", "success");
      setRejecting(null);
      setReason("");
      await fetchPending();
    } catch (error) {
      pushToast(error.response?.data?.message || "Reject failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProduct = async () => {
    if (!deletingId) return;
    try {
      setActionLoading(true);
      await API.delete(`/products/admin/${deletingId}`);
      pushToast("Product deleted", "success");
      setDeletingId(null);
      await fetchPending();
    } catch (error) {
      pushToast(error.response?.data?.message || "Delete failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="container-app"><Loader label="Loading pending products..." /></div>;

  return (
    <div className="container-app space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">Pending Products</h1>
        <div className="flex flex-wrap gap-2">
          <Link to="/admin/add-product" className="btn-primary">Add Product</Link>
          <Link to="/admin/products" className="btn-secondary">All Products</Link>
        </div>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No pending products" description="Everything is approved or rejected already." />
      ) : (
        <div className="grid gap-3">
          {products.map((p) => (
            <div key={p._id} className="card flex flex-wrap items-center gap-3 p-4">
              <img
                src={resolveImageUrl(p.image, "https://via.placeholder.com/100x80?text=No+Image")}
                alt={p.name}
                className="h-16 w-20 rounded-lg object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold md:text-base">{p.name}</p>
                <p className="text-xs text-[color:var(--text-muted)]">₦{p.price} • {p.category}</p>
                <p className="text-xs text-[color:var(--text-muted)]">Seller: {p.seller?.name} ({p.seller?.email})</p>
              </div>

              <div className="flex gap-2">
                <Button disabled={actionLoading} onClick={() => approve(p._id)}>Approve</Button>
                <Button variant="danger" disabled={actionLoading} onClick={() => setRejecting(p._id)}>Reject</Button>
                <Button variant="danger" disabled={actionLoading} onClick={() => setDeletingId(p._id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(rejecting)}
        title="Reject product"
        description="Provide a reason so the seller can fix and resubmit."
        confirmText="Reject"
        danger
        onCancel={() => {
          setRejecting(null);
          setReason("");
        }}
        onConfirm={reject}
      >
        <InputField
          label="Rejection reason (optional)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Poor image quality, incomplete description"
        />
      </ConfirmModal>

      <ConfirmModal
        open={Boolean(deletingId)}
        title="Delete product"
        description="This action permanently removes the product."
        confirmText="Delete"
        danger
        onCancel={() => setDeletingId(null)}
        onConfirm={deleteProduct}
      />
    </div>
  );
}

export default AdminPendingProducts;
