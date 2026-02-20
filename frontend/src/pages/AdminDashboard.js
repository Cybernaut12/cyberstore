import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/admin/stats");
        setStats(data);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load admin stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;
  if (!stats) return <div style={{ padding: "40px" }}>No stats</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "flex", gap: "16px", marginTop: "20px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <p style={labelStyle}>Total Users</p>
          <h2 style={valueStyle}>{stats.totalUsers || 0}</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Total Products</p>
          <h2 style={valueStyle}>{stats.totalProducts || 0}</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Pending Products</p>
          <h2 style={valueStyle}>{stats.pendingProducts || 0}</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Total Orders</p>
          <h2 style={valueStyle}>{stats.totalOrders || 0}</h2>
        </div>

        <div style={cardStyle}>
          <p style={labelStyle}>Total Revenue</p>
          <h2 style={valueStyle}>₦{stats.totalRevenue || 0}</h2>
        </div>
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
        <Link to="/admin/pending-products" style={{ textDecoration: "none" }}>
          <button style={btnStyle}>Pending Products</button>
        </Link>

        <Link to="/admin/orders" style={{ textDecoration: "none" }}>
          <button style={btnStyle}>All Orders</button>
        </Link>
      </div>
    </div>
  );
}

const cardStyle = { border: "1px solid #eee", borderRadius: "12px", padding: "16px", width: "260px" };
const labelStyle = { margin: 0, color: "#666" };
const valueStyle = { margin: "8px 0 0" };
const btnStyle = { padding: "10px 14px", borderRadius: "8px", border: "none", background: "black", color: "white", cursor: "pointer" };

export default AdminDashboard;
