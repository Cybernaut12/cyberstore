import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import { getCart, clearCart } from "../utils/cart";

function Checkout() {
  const navigate = useNavigate();
  const cartItems = getCart();

  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [loading, setLoading] = useState(false);

  const subtotal = cartItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      alert("Cart is empty");
      return;
    }

    try {
      setLoading(true);

      // 1️⃣ Create Order
      const { data: order } = await API.post("/orders", {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: {
          address,
          city,
          postalCode,
          country,
        },
        paymentMethod: "Paystack",
        totalPrice: subtotal,
      });

      // 2️⃣ Initialize Paystack
      const { data: payment } = await API.post(
        "/paystack/initialize",
        {
          orderId: order._id,
        }
      );

      // 3️⃣ Redirect to Paystack
      window.location.href = payment.authorization_url;

    } catch (error) {
      alert(error.response?.data?.message || "Checkout failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "40px", maxWidth: "600px" }}>
      <h2>Checkout</h2>

      <form onSubmit={handleCheckout}>
        <input
          type="text"
          placeholder="Address"
          required
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="City"
          required
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Postal Code"
          required
          value={postalCode}
          onChange={(e) => setPostalCode(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />

        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "20px" }}
        />

        <h3>Total: ₦{subtotal}</h3>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: "10px",
            width: "100%",
            padding: "12px",
            backgroundColor: "black",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          {loading ? "Processing..." : "Pay with Paystack"}
        </button>
      </form>
    </div>
  );
}

export default Checkout;
