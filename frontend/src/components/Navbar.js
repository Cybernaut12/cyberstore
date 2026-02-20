import React, { useContext, useEffect, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { getCart } from "../utils/cart";
// import {  } from "react";


function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  const [cartCount, setCartCount] = useState(0);

useEffect(() => {
  const updateCount = () => {
    const cart = getCart();
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    setCartCount(count);
  };

  updateCount();
  window.addEventListener("storage", updateCount);
  return () => window.removeEventListener("storage", updateCount);
}, []);


  return (
    <div
      style={{
        padding: "16px 40px",
        borderBottom: "1px solid #eee",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        background: "#fff",
        zIndex: 10,
      }}
    >
      <Link to="/" style={{ textDecoration: "none", color: "#000" }}>
        <h2 style={{ margin: 0 }}>CyberStore</h2>
      </Link>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <Link to="/cart" style={{ textDecoration: "none" }}>
  Cart ({cartCount})
</Link>

        {user && (
          <Link to="/my-orders" style={{ textDecoration: "none" }}>
            My Orders
          </Link>
        )}

        {user?.role === "seller" && (
  <Link to="/seller" style={{ textDecoration: "none" }}>
    Seller Dashboard
  </Link>
)}
         {user?.role === "admin" && (
  <Link to="/admin" style={{ textDecoration: "none" }}>
    Admin
  </Link>
)}



        {!user ? (
          <Link to="/login" style={{ textDecoration: "none" }}>Login</Link>
        ) : (
          <>
            <span style={{ fontSize: "14px" }}>
              {user.name} ({user.role})
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 12px",
                border: "1px solid #ddd",
                background: "white",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default Navbar;
