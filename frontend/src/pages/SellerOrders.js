import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import StatusPill from "../components/ui/StatusPill";
import { useToast } from "../components/ui/ToastContext";

function SellerOrders() {
  const { pushToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerOrders = async () => {
      try {
        const { data } = await API.get("/seller/orders");
        setOrders(data);
      } catch (error) {
        pushToast(error.response?.data?.message || "Failed to load seller orders", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchSellerOrders();
  }, [pushToast]);

  if (loading) return <div className="container-app"><Loader label="Loading seller orders..." /></div>;

  return (
    <div className="container-app space-y-4">
      <h1 className="page-title">Orders for My Products</h1>

      {orders.length === 0 ? (
        <EmptyState title="No seller orders yet" description="Orders containing your products will appear here." />
      ) : (
        <div className="grid gap-3">
          {orders.map((o) => (
            <details key={o._id} className="card overflow-hidden">
              <summary className="cursor-pointer list-none p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Order #{o._id.slice(-8)}</p>
                    <p className="text-xs text-[color:var(--text-muted)]">Buyer: {o.buyer?.name || "-"} ({o.buyer?.email || "-"})</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">₦{o.totalPrice}</p>
                    <div className="mt-2 flex justify-end gap-2">
                      <StatusPill status={o.isPaid ? "paid" : "unpaid"}>{o.isPaid ? "Paid" : "Not Paid"}</StatusPill>
                      <StatusPill status={String(o.status).toLowerCase() === "delivered" ? "delivered" : "pending"}>{o.status}</StatusPill>
                    </div>
                  </div>
                </div>
              </summary>
              <div className="border-t border-[color:var(--border)] p-4">
                <p className="mb-2 text-sm font-semibold">Items belonging to you</p>
                <div className="grid gap-2">
                  {o.orderItems.map((it) => (
                    <div key={it._id} className="rounded-xl border border-[color:var(--border)] p-3 text-sm">
                      <b>{it.name}</b> <span className="text-[color:var(--text-muted)]">Qty {it.qty} × ₦{it.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerOrders;
