import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { clearCart } from "../utils/cart";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [message, setMessage] = useState("Verifying payment...");

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const reference = params.get("reference");

        if (!reference) {
          setMessage("No payment reference found.");
          return;
        }

        const { data } = await API.get(`/paystack/verify/${reference}`);

        clearCart();

        setMessage("Payment successful! Order confirmed.");
      } catch (error) {
        setMessage(
          error.response?.data?.message || "Payment verification failed."
        );
      }
    };

    verifyPayment();
  }, [location.search]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      <h2>{message}</h2>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "20px",
          padding: "10px 16px",
          background: "black",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Go Home
      </button>
    </div>
  );
}

export default PaymentSuccess;
