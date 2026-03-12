import React, { useEffect, useState } from "react";
import API from "../api/axios";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import InputField from "../components/ui/InputField";
import Button from "../components/ui/Button";
import { useToast } from "../components/ui/ToastContext";

function AdminManageAdmins() {
  const { pushToast } = useToast();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const fetchAdmins = async () => {
    try {
      const { data } = await API.get("/admin/admins");
      setAdmins(data);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to load admins", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addAdmin = async (e) => {
    e.preventDefault();
    if (!form.email.trim()) {
      pushToast("Email is required", "error");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };
      const { data } = await API.post("/admin/admins", payload);
      pushToast(data?.message || "Admin added", "success");
      setForm({ name: "", email: "", password: "" });
      await fetchAdmins();
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to add admin", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="container-app"><Loader label="Loading admin accounts..." /></div>;

  return (
    <div className="container-app space-y-5">
      <div>
        <h1 className="page-title">Manage Admins</h1>
        <p className="page-subtitle">Create new admin accounts or promote existing users by email.</p>
      </div>

      <form onSubmit={addAdmin} className="card grid gap-3 p-5 md:grid-cols-3">
        <InputField
          label="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          helperText="Required when creating a brand-new admin."
        />
        <InputField
          label="Email"
          type="email"
          value={form.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
          required
        />
        <InputField
          label="Password"
          type="password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          helperText="Optional for existing users. Required for new admin."
        />
        <div className="md:col-span-3">
          <Button disabled={saving}>{saving ? "Saving..." : "Add / Promote Admin"}</Button>
        </div>
      </form>

      {admins.length === 0 ? (
        <EmptyState title="No admin users yet" description="Create your first admin account from the form above." />
      ) : (
        <section className="card p-4">
          <h2 className="text-lg font-semibold">Current Admins</h2>
          <div className="mt-3 grid gap-3">
            {admins.map((admin) => (
              <div key={admin._id} className="rounded-xl border border-[color:var(--border)] p-3">
                <p className="text-sm font-semibold">{admin.name}</p>
                <p className="text-xs text-[color:var(--text-muted)]">{admin.email}</p>
                <p className="mt-1 text-xs text-[color:var(--text-muted)]">
                  Added: {admin.createdAt ? new Date(admin.createdAt).toLocaleString() : "-"}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default AdminManageAdmins;
