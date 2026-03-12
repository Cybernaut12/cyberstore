import React, { useContext, useMemo, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/ToastContext";

function RegisterOtp() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const { pushToast } = useToast();

  const query = new URLSearchParams(location.search);
  const email = query.get("email") || "";
  const redirectRaw = query.get("redirect") || "/";
  const redirectTo = redirectRaw.startsWith("/") && !redirectRaw.startsWith("//") ? redirectRaw : "/";

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const maskedEmail = useMemo(() => {
    if (!email.includes("@")) return email;
    const [name, domain] = email.split("@");
    if (name.length <= 2) return `${name[0] || ""}***@${domain}`;
    return `${name.slice(0, 2)}***@${domain}`;
  }, [email]);

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  const submitCode = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      pushToast("Verification code is required", "error");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/register/verify", {
        email,
        code: code.trim(),
      });
      login(data);
      pushToast("Signup verified. Welcome to CyberStore.", "success");
      navigate(redirectTo);
    } catch (error) {
      pushToast(error.response?.data?.message || "Verification failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const resendCode = async () => {
    try {
      setResending(true);
      const { data } = await API.post("/auth/register/resend", { email });
      pushToast(data?.message || "Verification code sent again", "success");
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to resend code", "error");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="container-app">
      <section className="card mx-auto max-w-md p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">Verify your signup</h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          Enter the code sent to <span className="font-semibold">{maskedEmail}</span>.
        </p>

        <form onSubmit={submitCode} className="mt-6 space-y-4">
          <InputField
            label="Verification code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            helperText="Code expires in 10 minutes"
          />
          <Button className="w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify & Create Account"}
          </Button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm">
          <button
            type="button"
            className="text-[color:var(--accent)]"
            onClick={resendCode}
            disabled={resending}
          >
            {resending ? "Resending..." : "Resend code"}
          </button>
          <Link to="/register" className="text-[color:var(--text-muted)]">Back to signup</Link>
        </div>
      </section>
    </div>
  );
}

export default RegisterOtp;
