import React, { useCallback, useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/ToastContext";
import PasswordField from "../components/auth/PasswordField";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const { pushToast } = useToast();
  const redirectRaw = new URLSearchParams(location.search).get("redirect") || "/";
  const redirectTo = redirectRaw.startsWith("/") && !redirectRaw.startsWith("//") ? redirectRaw : "/";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "buyer",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim() || form.password.length < 6) next.password = "Password must be at least 6 characters";
    if (form.password !== form.confirmPassword) next.confirmPassword = "Passwords do not match";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const { data } = await API.post("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      if (data?.requiresOtp) {
        const verifyParams = new URLSearchParams({
          email: data.email || form.email.trim(),
          redirect: redirectTo,
        });
        pushToast(data?.message || "Verification code sent to your email", "success");
        navigate(`/register-verify?${verifyParams.toString()}`);
        return;
      }

      // Backward compatibility if server returns token directly.
      if (data?.token) {
        login(data);
        pushToast("Registration successful", "success");
        navigate(redirectTo);
      }
    } catch (error) {
      pushToast(error.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (credential, role) => {
      try {
        setGoogleLoading(true);
        const { data } = await API.post("/auth/google", { credential, role });
        login(data);
        pushToast("Account created with Google", "success");
        navigate(redirectTo);
      } catch (error) {
        pushToast(error.response?.data?.message || "Google sign up failed", "error");
      } finally {
        setGoogleLoading(false);
      }
    },
    [login, navigate, pushToast, redirectTo]
  );

  return (
    <div className="container-app">
      <section className="card mx-auto max-w-md p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">Create CyberStore account</h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">Join as buyer or seller.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            error={errors.name}
          />
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
          />
          <PasswordField
            label="Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            helperText="At least 6 characters"
            autoComplete="new-password"
          />
          <PasswordField
            label="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
            error={errors.confirmPassword}
            autoComplete="new-password"
          />
          <div>
            <label className="label">Role</label>
            <select
              className="input"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            >
              <option value="buyer">Buyer</option>
              <option value="seller">Seller</option>
            </select>
          </div>

          <Button className="w-full" disabled={loading}>{loading ? "Creating account..." : "Register"}</Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[color:var(--border)]" />
          <span className="text-xs text-[color:var(--text-muted)]">or</span>
          <div className="h-px flex-1 bg-[color:var(--border)]" />
        </div>

        <div className={googleLoading ? "pointer-events-none opacity-70" : ""}>
          <GoogleSignInButton
            role={form.role}
            onCredential={handleGoogleCredential}
            onError={(message) => pushToast(message, "error")}
          />
          {googleLoading ? <p className="mt-2 text-xs text-[color:var(--text-muted)]">Creating account...</p> : null}
        </div>

        <p className="mt-4 text-sm text-[color:var(--text-muted)]">
          Already have an account? <Link to="/login" className="text-[color:var(--accent)]">Login</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
