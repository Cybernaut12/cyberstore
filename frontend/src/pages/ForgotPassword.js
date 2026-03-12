import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import InputField from "../components/ui/InputField";
import PasswordField from "../components/auth/PasswordField";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/ToastContext";

function ForgotPassword() {
  const navigate = useNavigate();
  const { pushToast } = useToast();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("request");
  const [loading, setLoading] = useState(false);

  const requestResetCode = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      pushToast("Email is required", "error");
      return;
    }

    try {
      setLoading(true);
      const { data } = await API.post("/auth/forgot-password", { email: email.trim() });
      setStep("reset");
      pushToast(data?.message || "Reset code sent to your email", "success");
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to send reset code", "error");
    } finally {
      setLoading(false);
    }
  };

  const submitNewPassword = async (e) => {
    e.preventDefault();

    if (!code.trim()) {
      pushToast("Reset code is required", "error");
      return;
    }
    if (password.length < 6) {
      pushToast("Password must be at least 6 characters", "error");
      return;
    }
    if (password !== confirmPassword) {
      pushToast("Passwords do not match", "error");
      return;
    }

    try {
      setLoading(true);
      await API.post("/auth/reset-password", {
        email: email.trim(),
        code: code.trim(),
        password,
      });
      pushToast("Password updated. Login with your new password.", "success");
      navigate(`/login?email=${encodeURIComponent(email.trim())}`);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to reset password", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app">
      <section className="card mx-auto max-w-md p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">Reset password</h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">
          {step === "request"
            ? "Enter your account email and we will send a reset code."
            : "Use the code sent to your email to set a new password."}
        </p>

        {step === "request" ? (
          <form className="mt-6 space-y-4" onSubmit={requestResetCode}>
            <InputField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button className="w-full" disabled={loading}>
              {loading ? "Sending code..." : "Send reset code"}
            </Button>
          </form>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={submitNewPassword}>
            <InputField
              label="Reset code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              helperText="Code expires in 15 minutes"
            />
            <PasswordField
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <PasswordField
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
            <Button className="w-full" disabled={loading}>
              {loading ? "Updating password..." : "Reset password"}
            </Button>
          </form>
        )}

        <div className="mt-4 flex items-center justify-between text-sm">
          {step === "reset" ? (
            <button
              type="button"
              className="text-[color:var(--accent)]"
              onClick={() => setStep("request")}
            >
              Change email
            </button>
          ) : (
            <span />
          )}
          <Link to="/login" className="text-[color:var(--text-muted)]">Back to login</Link>
        </div>
      </section>
    </div>
  );
}

export default ForgotPassword;
