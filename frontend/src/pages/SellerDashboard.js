import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function SellerDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await API.get("/seller/summary");
        setSummary(data);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load seller summary");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;
  if (!summary) return <div style={{ padding: "40px" }}>No summary</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Seller Dashboard</h2>

      <div style={{ display: "flex", gap: "16px", marginTop: "20px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <p style={labelStyle}>Total Revenue</p>
          <h2 style={valueStyle}>₦{summary.totalRevenue || 0}</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Total Orders</p>
          <h2 style={valueStyle}>{summary.totalOrders || 0}</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Total Products</p>
          <h2 style={valueStyle}>{summary.totalProducts || 0}</h2>
        </div>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
        <Link to="/seller/products" style={{ textDecoration: "none" }}>
          <button style={btnStyle}>My Products</button>
        </Link>

        <Link to="/seller/orders" style={{ textDecoration: "none" }}>
          <button style={btnStyle}>My Orders</button>
        </Link>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #eee",
  borderRadius: "12px",
  padding: "16px",
  width: "260px",
};

const labelStyle = { margin: 0, color: "#666" };
const valueStyle = { margin: "8px 0 0" };

const btnStyle = {
  padding: "10px 14px",
  borderRadius: "8px",
  border: "none",
  background: "black",
  color: "white",
  cursor: "pointer",
};

export default SellerDashboard;
