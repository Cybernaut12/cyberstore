import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import API from "../api/axios";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import StatusPill from "../components/ui/StatusPill";
import { useToast } from "../components/ui/ToastContext";
import { resolveImageUrl } from "../utils/image";

function OrderDetails() {
  const { id } = useParams();
  const { pushToast } = useToast();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);

  const timeline = useMemo(() => {
    if (!order) return [];
    return [
      { key: "pending", label: "Pending", active: true },
      { key: "paid", label: "Paid", active: !!order.isPaid },
      { key: "delivered", label: "Delivered", active: String(order.status).toLowerCase() === "delivered" },
    ];
  }, [order]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/orders/${id}`);
      setOrder(data);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to load order", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handlePayNow = async () => {
    try {
      setPaying(true);
      const { data: payment } = await API.post("/paystack/initialize", { orderId: order._id });
      window.location.href = payment.authorization_url;
    } catch (error) {
      pushToast(error.response?.data?.message || "Payment initialization failed", "error");
      setPaying(false);
    }
  };

  if (loading) return <div className="container-app"><Loader label="Loading order details..." /></div>;
  if (!order) return <div className="container-app"><p>Order not found.</p></div>;

  return (
    <div className="container-app space-y-6">
      <Link to="/my-orders" className="text-sm text-[color:var(--accent)]">← Back to Orders</Link>

      <section className="card p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Order #{order._id.slice(-8)}</h1>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : "-"}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-extrabold">₦{order.totalPrice}</p>
            <div className="mt-2 flex justify-end gap-2">
              <StatusPill status={order.isPaid ? "paid" : "unpaid"}>{order.isPaid ? "Paid" : "Not paid"}</StatusPill>
              <StatusPill status={String(order.status).toLowerCase() === "delivered" ? "delivered" : "pending"}>{order.status}</StatusPill>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-[color:var(--border)] p-4 text-sm">
          <p className="font-semibold">Shipping Address</p>
          <p className="mt-1 text-[color:var(--text-muted)]">
            {order.shippingAddress?.address}, {order.shippingAddress?.city}, {order.shippingAddress?.postalCode}, {order.shippingAddress?.country}
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {timeline.map((item) => (
            <span key={item.key} className={`rounded-full px-3 py-1 text-xs font-semibold ${item.active ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
              {item.label}
            </span>
          ))}
        </div>

        {!order.isPaid ? (
          <Button className="mt-5" disabled={paying} onClick={handlePayNow}>{paying ? "Redirecting..." : "Pay Now"}</Button>
        ) : null}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold">Items</h2>
        {order.orderItems.map((item) => (
          <div key={item._id} className="card grid gap-3 p-4 sm:grid-cols-[90px_1fr_auto] sm:items-center">
            <img
              src={resolveImageUrl(item.image, "https://via.placeholder.com/120x90?text=No+Image")}
              alt={item.name}
              className="h-[70px] w-[90px] rounded-lg object-cover"
            />
            <div>
              <p className="text-sm font-semibold">{item.name}</p>
              <p className="text-xs text-[color:var(--text-muted)]">Qty {item.qty} × ₦{item.price}</p>
            </div>
            <p className="text-sm font-bold">₦{item.qty * item.price}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default OrderDetails;
