import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { clearCart } from "../utils/cart";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, ok: false, message: "Verifying payment...", order: null });

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const reference = new URLSearchParams(location.search).get("reference");

        if (!reference) {
          setState({ loading: false, ok: false, message: "No payment reference found.", order: null });
          return;
        }

        const { data } = await API.get(`/paystack/verify/${reference}`);
        clearCart();
        setState({ loading: false, ok: true, message: data.message || "Payment successful!", order: data.order || null });
      } catch (error) {
        setState({
          loading: false,
          ok: false,
          message: error.response?.data?.message || "Payment verification failed.",
          order: null,
        });
      }
    };

    verifyPayment();
  }, [location.search]);

  if (state.loading) {
    return (
      <div className="container-app">
        <Loader label="Verifying payment..." />
      </div>
    );
  }

  return (
    <div className="container-app">
      <section className="card mx-auto max-w-2xl p-8 text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full text-3xl ${state.ok ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"}`}>
          {state.ok ? "✓" : "!"}
        </div>

        <h1 className="mt-5 text-2xl font-extrabold">{state.ok ? "Payment successful!" : "Payment issue"}</h1>
        <p className="mt-2 text-sm text-[color:var(--text-muted)]">{state.message}</p>

        {state.order?.paymentReference ? (
          <p className="mt-3 text-xs text-[color:var(--text-muted)]">Reference: {state.order.paymentReference}</p>
        ) : null}

        {state.order?._id ? (
          <p className="mt-1 text-xs text-[color:var(--text-muted)]">Order ID: {state.order._id}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {state.order?._id ? <Button onClick={() => navigate(`/orders/${state.order._id}`)}>View Order</Button> : null}
          <Link to="/"><Button variant="secondary">Back Home</Button></Link>
        </div>
      </section>
    </div>
  );
}

export default PaymentSuccess;
