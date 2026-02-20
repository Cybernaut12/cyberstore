import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function BuyerOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/myorders");
        setOrders(data);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>My Orders</h2>

      {orders.length === 0 ? (
        <p>
          No orders yet. <Link to="/">Start shopping</Link>
        </p>
      ) : (
        <div style={{ marginTop: "20px", display: "grid", gap: "14px" }}>
          {orders.map((order) => (
            <div
              key={order._id}
              style={{
                border: "1px solid #eee",
                borderRadius: "10px",
                padding: "14px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <p style={{ margin: 0 }}>
                    <b>Order ID:</b> {order._id}
                  </p>
                  <p style={{ margin: "6px 0", color: "#555" }}>
                    <b>Date:</b>{" "}
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ margin: 0, fontWeight: "bold" }}>
                    ₦{order.totalPrice}
                  </p>
                  <p style={{ margin: "6px 0" }}>
                    {order.isPaid ? "✅ Paid" : "❌ Not Paid"}{" "}
                    {order.status === "Delivered" ? "📦 Delivered" : ""}
                  </p>
                </div>
              </div>

              <div style={{ marginTop: "10px" }}>
                <b>Items:</b>
                <div style={{ marginTop: "8px", display: "grid", gap: "8px" }}>
                  {order.orderItems.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        display: "flex",
                        gap: "10px",
                        alignItems: "center",
                        borderTop: "1px solid #f1f1f1",
                        paddingTop: "8px",
                      }}
                    >
                      <img
                        src={
                          item.image?.startsWith("http")
                            ? item.image
                            : "https://via.placeholder.com/80x60?text=No+Image"
                        }
                        alt={item.name}
                        style={{
                          width: "80px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <div>
                        <p style={{ margin: 0 }}>
                          <b>{item.name}</b>
                        </p>
                        <p style={{ margin: "4px 0", color: "#555" }}>
                          Qty: {item.qty} × ₦{item.price}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: "12px", color: "#555" }}>
                <b>Shipping:</b>{" "}
                {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
                {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
              </div>

              <Link to={`/orders/${order._id}`} style={{ textDecoration: "none" }}>
                <button
                  style={{
                    marginTop: "12px",
                    padding: "8px 12px",
                    border: "1px solid #ddd",
                    background: "white",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  View Details
                </button>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerOrders;
