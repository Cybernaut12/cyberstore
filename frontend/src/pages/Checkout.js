import React, { useContext, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { getCart } from "../utils/cart";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/ToastContext";
import { AuthContext } from "../context/AuthContext";

function Checkout() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { user } = useContext(AuthContext);
  const cartItems = getCart();

  const [form, setForm] = useState({
    address: "",
    city: "",
    postalCode: "",
    country: "Nigeria",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const subtotal = useMemo(() => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0), [cartItems]);

  if (!user) {
    return <Navigate to="/register?redirect=/checkout" replace />;
  }

  const validate = () => {
    const next = {};
    if (!form.address.trim()) next.address = "Address is required";
    if (!form.city.trim()) next.city = "City is required";
    if (!form.postalCode.trim()) next.postalCode = "Postal code is required";
    if (!form.country.trim()) next.country = "Country is required";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      pushToast("Your cart is empty", "error");
      return;
    }

    if (!validate()) return;

    try {
      setLoading(true);

      const { data: order } = await API.post("/orders", {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          qty: item.qty,
          price: item.price,
          image: item.image,
        })),
        shippingAddress: form,
        paymentMethod: "Paystack",
        totalPrice: subtotal,
      });

      const { data: payment } = await API.post("/paystack/initialize", { orderId: order._id });
      window.location.href = payment.authorization_url;
    } catch (error) {
      pushToast(error.response?.data?.message || "Checkout failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (!cartItems.length) {
    return (
      <div className="container-app">
        <EmptyState
          title="No items to checkout"
          description="Add products to cart before checkout."
          action={<Button onClick={() => navigate("/")}>Back to Shop</Button>}
        />
      </div>
    );
  }

  return (
    <div className="container-app grid gap-6 lg:grid-cols-[1fr_360px]">
      <form onSubmit={handleCheckout} className="card space-y-4 p-5 md:p-6">
        <div>
          <h1 className="page-title">Checkout</h1>
          <p className="page-subtitle">Delivery details for your order.</p>
        </div>

        <InputField
          label="Address"
          value={form.address}
          onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
          error={errors.address}
        />
        <InputField
          label="City"
          value={form.city}
          onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          error={errors.city}
        />
        <InputField
          label="Postal Code"
          value={form.postalCode}
          onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))}
          error={errors.postalCode}
        />
        <InputField
          label="Country"
          value={form.country}
          onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
          error={errors.country}
        />

        <Button className="w-full" disabled={loading}>{loading ? "Processing..." : "Pay with Paystack"}</Button>
      </form>

      <aside className="card h-fit p-5">
        <h2 className="text-lg font-bold">Order Summary</h2>
        <div className="mt-4 space-y-3">
          {cartItems.map((item) => (
            <div key={item._id} className="flex items-center justify-between gap-3 text-sm">
              <p className="line-clamp-1">{item.name} <span className="text-[color:var(--text-muted)]">x{item.qty}</span></p>
              <p className="font-semibold">₦{item.price * item.qty}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-[color:var(--border)] pt-3 text-base font-bold flex justify-between">
          <span>Total</span>
          <span>₦{subtotal}</span>
        </div>
      </aside>
    </div>
  );
}

export default Checkout;
