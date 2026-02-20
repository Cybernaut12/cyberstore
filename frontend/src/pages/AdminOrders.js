import React, { useEffect, useState } from "react";
import API from "../api/axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders");
      setOrders(data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markDelivered = async (id) => {
    try {
      setActionLoading(true);
      await API.put(`/orders/${id}/deliver`, {});
      await fetchOrders();
    } catch (error) {
      alert(error.response?.data?.message || "Deliver update failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>All Orders</h2>

      {orders.length === 0 ? (
        <p>No orders.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px", marginTop: "18px" }}>
          {orders.map((o) => (
            <div key={o._id} style={card}>
              <div>
                <b>Order:</b> {o._id}
                <p style={{ margin: "6px 0", color: "#555" }}>
                  Buyer: {o.user?.name} ({o.user?.email})
                </p>
                <p style={{ margin: 0 }}>
                  ₦{o.totalPrice} — {o.isPaid ? "✅ Paid" : "❌ Not Paid"} — {o.status}
                </p>
              </div>

              <button
                disabled={actionLoading || o.status === "Delivered"}
                onClick={() => markDelivered(o._id)}
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: o.status === "Delivered" ? "#ddd" : "black",
                  color: o.status === "Delivered" ? "#555" : "white",
                  cursor: o.status === "Delivered" ? "not-allowed" : "pointer",
                }}
              >
                {o.status === "Delivered" ? "Delivered" : "Mark Delivered"}
              </button>
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

export default AdminOrders;
