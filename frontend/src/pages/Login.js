import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/ToastContext";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectRaw = new URLSearchParams(location.search).get("redirect") || "/";
  const redirectTo = redirectRaw.startsWith("/") && !redirectRaw.startsWith("//") ? redirectRaw : "/";

  const validate = () => {
    const next = {};
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim()) next.password = "Password is required";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const { data } = await API.post("/auth/login", form);
      login(data);
      pushToast("Login successful", "success");
      navigate(redirectTo);
    } catch (error) {
      pushToast(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-app">
      <section className="card mx-auto max-w-md p-6 md:p-8">
        <h1 className="text-2xl font-extrabold">Welcome back</h1>
        <p className="mt-1 text-sm text-[color:var(--text-muted)]">Sign in to continue shopping.</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <InputField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            error={errors.email}
          />
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            helperText="Use your marketplace password"
          />
          <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Login"}</Button>
        </form>

        <p className="mt-4 text-sm text-[color:var(--text-muted)]">
          New to CyberStore? <Link to="/register" className="text-[color:var(--accent)]">Create account</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
