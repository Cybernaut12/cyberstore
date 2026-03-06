import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api/axios";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import StatusPill from "../components/ui/StatusPill";
import { useToast } from "../components/ui/ToastContext";

function BuyerOrders() {
  const { pushToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get("/orders/myorders");
        setOrders(data);
      } catch (error) {
        pushToast(error.response?.data?.message || "Failed to load orders", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [pushToast]);

  if (loading) return <div className="container-app"><Loader label="Loading your orders..." /></div>;

  return (
    <div className="container-app space-y-4">
      <h1 className="page-title">My Orders</h1>

      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="You have not made any purchase yet." action={<Link to="/" className="btn-primary">Start Shopping</Link>} />
      ) : (
        <div className="grid gap-3">
          {orders.map((order) => (
            <div key={order._id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">Order #{order._id.slice(-8)}</p>
                  <p className="text-xs text-[color:var(--text-muted)]">
                    {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">₦{order.totalPrice}</p>
                  <div className="mt-2 flex justify-end gap-2">
                    <StatusPill status={order.isPaid ? "paid" : "unpaid"}>{order.isPaid ? "Paid" : "Not Paid"}</StatusPill>
                    <StatusPill status={String(order.status).toLowerCase() === "delivered" ? "delivered" : "pending"}>{order.status}</StatusPill>
                  </div>
                </div>
              </div>

              <div className="mt-3 border-t border-[color:var(--border)] pt-3 text-sm text-[color:var(--text-muted)]">
                {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
              </div>

              <Link to={`/orders/${order._id}`} className="mt-3 inline-flex text-sm font-semibold text-[color:var(--accent)]">
                View details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default BuyerOrders;
