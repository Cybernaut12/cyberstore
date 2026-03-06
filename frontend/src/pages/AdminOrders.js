import React, { useEffect, useMemo, useState } from "react";
import API from "../api/axios";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import StatusPill from "../components/ui/StatusPill";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/ToastContext";

function AdminOrders() {
  const { pushToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [search, setSearch] = useState("");

  const fetchOrders = async () => {
    try {
      const { data } = await API.get("/orders");
      setOrders(data);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;
    return orders.filter((o) =>
      o._id.toLowerCase().includes(query) || o.user?.email?.toLowerCase().includes(query)
    );
  }, [orders, search]);

  const markDelivered = async (id) => {
    try {
      setActionLoading(true);
      await API.put(`/orders/${id}/deliver`, {});
      pushToast("Order marked delivered", "success");
      await fetchOrders();
    } catch (error) {
      pushToast(error.response?.data?.message || "Delivery update failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="container-app"><Loader label="Loading all orders..." /></div>;

  return (
    <div className="container-app space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="page-title">All Orders</h1>
        <input
          className="input w-full max-w-sm"
          placeholder="Search by order ID or buyer email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState title="No orders found" description="Try another search query." />
      ) : (
        <div className="grid gap-3">
          {filteredOrders.map((o) => (
            <div key={o._id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="text-sm font-semibold">Order #{o._id.slice(-8)}</p>
                <p className="text-xs text-[color:var(--text-muted)]">{o.user?.name} ({o.user?.email})</p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">{o.createdAt ? new Date(o.createdAt).toLocaleString() : "-"}</p>
              </div>

              <div className="text-right">
                <p className="font-bold">₦{o.totalPrice}</p>
                <div className="mt-2 flex justify-end gap-2">
                  <StatusPill status={o.isPaid ? "paid" : "unpaid"}>{o.isPaid ? "Paid" : "Not Paid"}</StatusPill>
                  <StatusPill status={String(o.status).toLowerCase() === "delivered" ? "delivered" : "pending"}>{o.status}</StatusPill>
                </div>
              </div>

              <Button
                variant={String(o.status).toLowerCase() === "delivered" ? "secondary" : "primary"}
                disabled={actionLoading || String(o.status).toLowerCase() === "delivered"}
                onClick={() => markDelivered(o._id)}
              >
                {String(o.status).toLowerCase() === "delivered" ? "Delivered" : "Mark Delivered"}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
