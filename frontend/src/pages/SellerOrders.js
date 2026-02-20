import React, { useEffect, useState } from "react";
import API from "../api/axios";

function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const { data } = await API.get("/orders/seller");
        setOrders(data);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load seller orders");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, []);

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Orders for My Products</h2>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "14px", marginTop: "18px" }}>
          {orders.map((o) => (
            <div
              key={o._id}
              style={{ border: "1px solid #eee", borderRadius: "10px", padding: "14px" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0 }}>
                    <b>Order:</b> {o._id}
                  </p>
                  <p style={{ margin: "6px 0", color: "#555" }}>
                    <b>Buyer:</b> {o.buyer?.name || o.user?.name || "—"} ({o.buyer?.email || o.user?.email || "—"})
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <b>₦{o.totalPrice}</b>
                  <p style={{ margin: "6px 0" }}>{o.isPaid ? "✅ Paid" : "❌ Not Paid"}</p>
                  <p style={{ margin: 0 }}>{o.status === "Delivered" ? "📦 Delivered" : o.status}</p>
                </div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <b>Items:</b>
                <div style={{ marginTop: "8px", display: "grid", gap: "8px" }}>
                  {o.orderItems.map((it) => (
                    <div key={it._id} style={{ borderTop: "1px solid #f1f1f1", paddingTop: "8px" }}>
                      <b>{it.name}</b> — Qty: {it.qty} × ₦{it.price}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerOrders;
