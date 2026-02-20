import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
// import { clearCart } from "../utils/cart";

function OrderDetails() {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  const handlePayNow = async () => {
    try {
      setPaying(true);

      const { data: payment } = await API.post("/paystack/initialize", {
        orderId: order._id,
      });

      window.location.href = payment.authorization_url;
    } catch (error) {
      alert(error.response?.data?.message || "Payment init failed");
      setPaying(false);
    }
  };


  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;
  if (!order) return <div style={{ padding: "40px" }}>Order not found</div>;

  return (
    <div style={{ padding: "40px", maxWidth: "900px" }}>
      <Link to="/my-orders" style={{ textDecoration: "none" }}>← Back to Orders</Link>

      <h2 style={{ marginTop: "15px" }}>Order Details</h2>

      <div
        style={{
          marginTop: "20px",
          border: "1px solid #eee",
          borderRadius: "10px",
          padding: "16px",
        }}
      >
        <p style={{ margin: 0 }}>
          <b>Order ID:</b> {order._id}
        </p>
        <p style={{ margin: "8px 0", color: "#555" }}>
          <b>Date:</b> {order.createdAt ? new Date(order.createdAt).toLocaleString() : "—"}
        </p>

        <p style={{ margin: "8px 0" }}>
          <b>Status:</b>{" "}
          {order.isPaid ? "✅ Paid" : "❌ Not Paid"}{" "}
          {order.status === "Delivered" ? "📦 Delivered" : ""}
        </p>

        <p style={{ margin: "8px 0" }}>
          <b>Total:</b> ₦{order.totalPrice}
        </p>

        <p style={{ margin: "8px 0" }}>
          <b>Payment Method:</b> {order.paymentMethod}
        </p>

        {order.isPaid && (
          <p style={{ margin: "8px 0", color: "#555" }}>
            <b>Paid At:</b>{" "}
            {order.paidAt ? new Date(order.paidAt).toLocaleString() : "—"}
          </p>
        )}

        <div style={{ marginTop: "14px", color: "#555" }}>
          <b>Shipping Address:</b><br />
          {order.shippingAddress?.address}, {order.shippingAddress?.city},{" "}
          {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
        </div>

        {!order.isPaid && (
          <button
            onClick={handlePayNow}
            disabled={paying}
            style={{
              marginTop: "18px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: "black",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              width: "100%",
            }}
          >
            {paying ? "Redirecting..." : "Pay Now (Paystack)"}
          </button>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <h3>Order Items</h3>

        <div style={{ display: "grid", gap: "12px" }}>
          {order.orderItems.map((item) => (
            <div
              key={item._id}
              style={{
                display: "grid",
                gridTemplateColumns: "90px 1fr 120px",
                gap: "14px",
                alignItems: "center",
                border: "1px solid #eee",
                borderRadius: "10px",
                padding: "12px",
              }}
            >
              <img
                src={
                  item.image?.startsWith("http")
                    ? item.image
                    : "https://via.placeholder.com/120x90?text=No+Image"
                }
                alt={item.name}
                style={{ width: "90px", height: "70px", objectFit: "cover", borderRadius: "8px" }}
              />

              <div>
                <b>{item.name}</b>
                <p style={{ margin: "6px 0", color: "#555" }}>
                  Qty: {item.qty} × ₦{item.price}
                </p>
              </div>

              <div style={{ textAlign: "right", fontWeight: "bold" }}>
                ₦{item.qty * item.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
