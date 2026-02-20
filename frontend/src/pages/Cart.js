import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartQty, removeFromCart } from "../utils/cart";

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const changeQty = (id, qty, stock) => {
    const safeQty = Math.max(1, Math.min(Number(qty), stock));
    const updated = updateCartQty(id, safeQty);
    setCartItems(updated);
  };

  const removeItem = (id) => {
    const updated = removeFromCart(id);
    setCartItems(updated);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);

  return (
    <div style={{ padding: "40px" }}>
      <h2>Cart</h2>

      {cartItems.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/">Go shopping</Link>
        </p>
      ) : (
        <>
          <div style={{ display: "grid", gap: "16px", marginTop: "20px" }}>
            {cartItems.map((item) => (
              <div
                key={item._id}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 120px",
                  gap: "16px",
                  alignItems: "center",
                  border: "1px solid #eee",
                  padding: "12px",
                  borderRadius: "10px",
                }}
              >
                <img
                  src={item.image?.startsWith("http") ? item.image : "https://via.placeholder.com/200x150?text=No+Image"}
                  alt={item.name}
                  style={{ width: "120px", height: "90px", objectFit: "cover", borderRadius: "8px" }}
                />

                <div>
                  <Link to={`/product/${item._id}`} style={{ textDecoration: "none", color: "#000" }}>
                    <b>{item.name}</b>
                  </Link>
                  <p style={{ margin: "6px 0" }}>₦{item.price}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <label>Qty:</label>
                    <input
                      type="number"
                      value={item.qty}
                      min="1"
                      max={item.stock}
                      onChange={(e) => changeQty(item._id, e.target.value, item.stock)}
                      style={{ width: "70px", padding: "6px" }}
                    />
                    <small style={{ color: "#666" }}>Stock: {item.stock}</small>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <p style={{ fontWeight: "bold" }}>₦{item.price * item.qty}</p>
                  <button
                    onClick={() => removeItem(item._id)}
                    style={{
                      padding: "8px 10px",
                      border: "1px solid #ddd",
                      background: "white",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              marginTop: "24px",
              borderTop: "1px solid #eee",
              paddingTop: "16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>Subtotal: ₦{subtotal}</h3>

            <button
              onClick={() => navigate("/checkout")}
              style={{
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                background: "black",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
