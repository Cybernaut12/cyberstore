import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { cartEventName, getCart } from "../utils/cart";

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [search, setSearch] = useState(new URLSearchParams(location.search).get("q") || "");
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const count = getCart().reduce((acc, item) => acc + item.qty, 0);
      setCartCount(count);
    };

    updateCount();
    window.addEventListener("storage", updateCount);
    window.addEventListener(cartEventName, updateCount);
    return () => {
      window.removeEventListener("storage", updateCount);
      window.removeEventListener(cartEventName, updateCount);
    };
  }, []);

  useEffect(() => {
    setSearch(new URLSearchParams(location.search).get("q") || "");
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location.search, location.pathname]);

  const roleLabel = useMemo(() => {
    if (!user?.role) return "";
    return user.role.charAt(0).toUpperCase() + user.role.slice(1);
  }, [user?.role]);

  const submitSearch = (e) => {
    e.preventDefault();
    const q = search.trim();
    if (q) navigate(`/?q=${encodeURIComponent(q)}`);
    else navigate("/");
  };

  const navItems = [
    { label: "Home", to: "/" },
    { label: "Shop", to: "/#products" },
    { label: "Men", to: "/?q=men" },
    { label: "Women", to: "/?q=women" },
    { label: "Blog", to: "/blog" },
  ];

  const quickLinks = [
    user?.role === "buyer" ? { to: "/my-orders", label: "My Orders" } : null,
    user?.role === "seller" ? { to: "/seller/add-product", label: "Add Product" } : null,
    user?.role === "seller" ? { to: "/seller", label: "Seller Dashboard" } : null,
    user?.role === "admin" ? { to: "/admin/add-product", label: "Add Product" } : null,
    user?.role === "admin" ? { to: "/admin", label: "Admin Dashboard" } : null,
  ].filter(Boolean);

  return (
    <header className="glass-nav">
      <div className="border-b border-white/10 bg-zinc-950 text-zinc-100">
        <div className="container-app flex h-11 items-center justify-between gap-3 text-xs sm:text-sm">
          <p className="font-medium">
            Get <span className="font-extrabold">10% OFF</span> your first order
          </p>
          <Link to="/#products" className="font-semibold underline underline-offset-4">
            Shop now
          </Link>
        </div>
      </div>

      <div className="container-app flex h-16 items-center gap-3 md:h-[74px] md:gap-5">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Open menu"
        >
          <span className="text-lg">☰</span>
        </button>

        <Link to="/" className="text-xl font-extrabold uppercase tracking-[0.18em] md:text-2xl">
          Cyber<span className="text-[color:var(--accent)]">Store</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => {
            const isActive =
              (item.to === "/" && location.pathname === "/" && !location.search) ||
              (item.to === "/blog" && location.pathname === "/blog") ||
              (item.to.includes("q=men") && location.search.includes("q=men")) ||
              (item.to.includes("q=women") && location.search.includes("q=women"));

            return (
              <Link
                key={item.label}
                to={item.to}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? theme === "dark"
                      ? "bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/30"
                      : "bg-[color:var(--primary)] text-white"
                    : "text-[color:var(--text-muted)] hover:bg-slate-100 hover:text-[color:var(--text)] dark:hover:bg-slate-900"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <form onSubmit={submitSearch} className="hidden flex-1 md:block">
          <div className="relative ml-auto max-w-md">
            <input
              className="input pl-10"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[color:var(--text-muted)]">⌕</span>
          </div>
        </form>

        <div className="ml-auto flex items-center gap-2 md:gap-3">
          <button className="btn-secondary px-3" onClick={toggleTheme} title="Toggle theme">
            {theme === "dark" ? "Light" : "Dark"}
          </button>

          <Link to="/cart" className="relative btn-secondary px-3 md:px-4">
            Cart
            {cartCount > 0 ? (
              <span className="absolute -right-2 -top-2 rounded-full bg-[color:var(--accent)] px-1.5 py-0.5 text-[11px] font-semibold text-white">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {!user ? (
            <Link to="/login" className="btn-primary px-3 md:px-4">Login</Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen((v) => !v)}
                className="btn-secondary gap-2 px-3"
              >
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                  {user.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
                <span className="hidden text-sm md:inline">{user.name}</span>
              </button>

              {dropdownOpen ? (
                <div className="card absolute right-0 mt-2 w-56 p-2">
                  <div className="rounded-lg px-2 py-1.5 text-xs text-[color:var(--text-muted)]">{roleLabel}</div>
                  {quickLinks.map((l) => (
                    <Link key={l.to} to={l.to} className="block rounded-lg px-2 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800">
                      {l.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="mt-1 block w-full rounded-lg px-2 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      <div className="container-app pb-3 md:hidden">
        <form onSubmit={submitSearch}>
          <input
            className="input"
            placeholder="Search products"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      </div>

      {menuOpen ? (
        <div className="container-app border-t border-[color:var(--border)] py-3 md:hidden">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link key={item.label} className="btn-secondary justify-start" to={item.to}>
                {item.label}
              </Link>
            ))}
            {quickLinks.map((l) => (
              <Link key={l.to} className="btn-secondary justify-start" to={l.to}>{l.label}</Link>
            ))}
            {!user ? <Link className="btn-primary justify-start" to="/register">Become a Seller</Link> : null}
          </div>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
