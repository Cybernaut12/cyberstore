import React, { useEffect, useState } from "react";
import API from "../api/axios";

function AdminPendingProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPending = async () => {
    try {
      const { data } = await API.get("/products/admin/pending");
      setProducts(data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load pending products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const approve = async (id) => {
    try {
      setActionLoading(true);
      await API.put(`/products/admin/${id}/approve`, {});
      await fetchPending();
    } catch (error) {
      alert(error.response?.data?.message || "Approve failed");
    } finally {
      setActionLoading(false);
    }
  };

  const reject = async (id) => {
    const reason = prompt("Reason for rejection? (optional)") || "";
    try {
      setActionLoading(true);
      await API.put(`/products/admin/${id}/reject`, { reason });
      await fetchPending();
    } catch (error) {
      alert(error.response?.data?.message || "Reject failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Pending Products</h2>

      {products.length === 0 ? (
        <p>No pending products.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
          {products.map((p) => (
            <div key={p._id} style={card}>
              <div>
                <b>{p.name}</b>
                <p style={{ margin: "6px 0", color: "#555" }}>₦{p.price} — {p.category}</p>
                <small style={{ color: "#666" }}>
                  Seller: {p.seller?.name} ({p.seller?.email})
                </small>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button disabled={actionLoading} onClick={() => approve(p._id)} style={approveBtn}>
                  Approve
                </button>
                <button disabled={actionLoading} onClick={() => reject(p._id)} style={rejectBtn}>
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const card = {
  border: "1px solid #eee",
  borderRadius: "10px",
  padding: "14px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "14px",
};
const approveBtn = { padding: "10px 12px", borderRadius: "8px", border: "none", background: "black", color: "white", cursor: "pointer" };
const rejectBtn = { padding: "10px 12px", borderRadius: "8px", border: "1px solid #ddd", background: "white", cursor: "pointer" };

export default AdminPendingProducts;
