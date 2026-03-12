import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import { AuthContext } from "../context/AuthContext";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/ToastContext";
import PasswordField from "../components/auth/PasswordField";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const { pushToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const redirectRaw = searchParams.get("redirect") || "/";
  const redirectTo = redirectRaw.startsWith("/") && !redirectRaw.startsWith("//") ? redirectRaw : "/";

  useEffect(() => {
    const prefilledEmail = searchParams.get("email");
    if (prefilledEmail) {
      setForm((prev) => (prev.email === prefilledEmail ? prev : { ...prev, email: prefilledEmail }));
    }
  }, [searchParams]);

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
      if (data?.requiresVerification) {
        const verifyParams = new URLSearchParams({
          email: data.email || form.email.trim(),
          redirect: redirectTo,
        });
        pushToast(data?.message || "Please verify your email to continue", "info");
        navigate(`/register-verify?${verifyParams.toString()}`);
        return;
      }

      if (data?.token) {
        login(data);
        pushToast("Login successful", "success");
        navigate(redirectTo);
      }
    } catch (error) {
      pushToast(error.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleCredential = useCallback(
    async (credential) => {
      try {
        setGoogleLoading(true);
        const { data } = await API.post("/auth/google", { credential });
        login(data);
        pushToast("Signed in with Google", "success");
        navigate(redirectTo);
      } catch (error) {
        pushToast(error.response?.data?.message || "Google sign in failed", "error");
      } finally {
        setGoogleLoading(false);
      }
    },
    [login, navigate, pushToast, redirectTo]
  );

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
          <PasswordField
            label="Password"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            error={errors.password}
            helperText="Use your marketplace password"
            autoComplete="current-password"
          />
          <div className="text-right text-sm">
            <Link to="/forgot-password" className="text-[color:var(--accent)]">Forgot password?</Link>
          </div>
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </Button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-[color:var(--border)]" />
          <span className="text-xs text-[color:var(--text-muted)]">or</span>
          <div className="h-px flex-1 bg-[color:var(--border)]" />
        </div>

        <div className={googleLoading ? "pointer-events-none opacity-70" : ""}>
          <GoogleSignInButton
            onCredential={handleGoogleCredential}
            onError={(message) => pushToast(message, "error")}
          />
          {googleLoading ? <p className="mt-2 text-xs text-[color:var(--text-muted)]">Signing in...</p> : null}
        </div>

        <p className="mt-4 text-sm text-[color:var(--text-muted)]">
          New to CyberStore? <Link to="/register" className="text-[color:var(--accent)]">Create account</Link>
        </p>
      </section>
    </div>
  );
}

export default Login;
