import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/ToastContext";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  const { pushToast } = useToast();
  const redirectRaw = new URLSearchParams(location.search).get("redirect") || "/";
  const redirectTo = redirectRaw.startsWith("/") && !redirectRaw.startsWith("//") ? redirectRaw : "/";

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "buyer" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = "Name is required";
    if (!form.email.trim()) next.email = "Email is required";
    if (!form.password.trim() || form.password.length < 6) next.password = "Password must be at least 6 characters";
    setErrors(next);
    return !Object.keys(next).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const { data } = await API.post("/auth/register", form);
      login(data);
      pushToast("Registration successful", "success");
      navigate(redirectTo);
    } catch (error) {
      pushToast(error.response?.data?.message || "Registration failed", "error");
    } finally {
      setLoading(false);
    }
  };

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
          <InputField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            helperText="At least 6 characters"
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

        <p className="mt-4 text-sm text-[color:var(--text-muted)]">
          Already have an account? <Link to="/login" className="text-[color:var(--accent)]">Login</Link>
        </p>
      </section>
    </div>
  );
}

export default Register;
