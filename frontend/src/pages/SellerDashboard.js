import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/ui/Loader";
import { useToast } from "../components/ui/ToastContext";

function SellerDashboard() {
  const { pushToast } = useToast();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const { data } = await API.get("/seller/summary");
        setSummary(data);
      } catch (error) {
        pushToast(error.response?.data?.message || "Failed to load summary", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [pushToast]);

  if (loading) return <div className="container-app"><Loader label="Loading seller dashboard..." /></div>;
  if (!summary) return <div className="container-app">No summary available.</div>;

  const stats = [
    ["Total Revenue", `₦${summary.totalRevenue || 0}`],
    ["Total Orders", summary.totalOrders || 0],
    ["Total Products", summary.totalProducts || 0],
    ["Pending/Undelivered", (summary.totalOrders || 0) - (summary.deliveredOrders || 0)],
  ];

  return (
    <div className="container-app space-y-6">
      <div>
        <h1 className="page-title">Seller Dashboard</h1>
        <p className="page-subtitle">Track your sales performance and product status.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s[0]} className="card p-4">
            <p className="text-sm text-[color:var(--text-muted)]">{s[0]}</p>
            <p className="mt-2 text-2xl font-bold">{s[1]}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/seller/add-product" className="btn-primary">Add Product</Link>
        <Link to="/seller/products" className="btn-secondary">My Products</Link>
        <Link to="/seller/orders" className="btn-secondary">Orders</Link>
      </div>

      <section className="card p-5">
        <h2 className="text-lg font-semibold">Revenue Snapshot</h2>
        <div className="mt-5 flex items-end gap-3">
          {[45, 60, 30, 80, 65, 90, 70].map((h, i) => (
            <div key={i} className="flex-1">
              <div className="rounded-t-md bg-blue-500/80" style={{ height: `${h}px` }} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default SellerDashboard;
