import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/ui/Loader";
import { useToast } from "../components/ui/ToastContext";

function AdminDashboard() {
  const { pushToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await API.get("/admin/stats");
        setStats(data);
      } catch (error) {
        pushToast(error.response?.data?.message || "Failed to load admin stats", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [pushToast]);

  if (loading) return <div className="container-app"><Loader label="Loading admin dashboard..." /></div>;
  if (!stats) return <div className="container-app">No stats available.</div>;

  const cards = [
    ["Total Users", stats.totalUsers || 0],
    ["Total Products", stats.totalProducts || 0],
    ["Pending Products", stats.pendingProducts || 0],
    ["Total Orders", stats.totalOrders || 0],
    ["Total Revenue", `₦${stats.totalRevenue || 0}`],
  ];

  return (
    <div className="container-app space-y-6">
      <div>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Marketplace-wide metrics and moderation controls.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c[0]} className="card p-4">
            <p className="text-sm text-[color:var(--text-muted)]">{c[0]}</p>
            <p className="mt-2 text-xl font-bold">{c[1]}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link className="btn-primary" to="/admin/add-product">Add Product</Link>
        <Link className="btn-secondary" to="/admin/products">All Products</Link>
        <Link className="btn-secondary" to="/admin/pending-products">Pending Products</Link>
        <Link className="btn-secondary" to="/admin/orders">All Orders</Link>
      </div>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Order Trend</h2>
        <div className="mt-5 flex items-end gap-3">
          {[20, 35, 55, 40, 68, 80, 70].map((h, i) => (
            <div key={i} className="flex-1 rounded-t-md bg-slate-900/80 dark:bg-slate-200/80" style={{ height: `${h}px` }} />
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
