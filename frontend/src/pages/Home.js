import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import API from "../api/axios";
import ProductCard from "../components/ProductCard";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import InputField from "../components/ui/InputField";
import { useToast } from "../components/ui/ToastContext";

const PAGE_SIZE = 20;

function Home() {
  const { pushToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const queryQ = useMemo(() => new URLSearchParams(location.search).get("q") || "", [location.search]);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageMeta, setPageMeta] = useState({ page: 1, pages: 1 });
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [filters, setFilters] = useState({
    category: "",
    minPrice: "",
    maxPrice: "",
    sort: "newest",
  });

  const loadProducts = async (page = 1) => {
    try {
      setLoading(true);
      const { data } = await API.get("/products", {
        params: {
          page,
          limit: PAGE_SIZE,
          keyword: queryQ || undefined,
          category: filters.category || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          sort: filters.sort || "newest",
        },
      });

      setProducts(data.products || []);
      setPageMeta({ page: data.page || 1, pages: data.pages || 1 });
    } catch (e) {
      pushToast(e.response?.data?.message || "Failed to load products", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryQ, filters.category, filters.minPrice, filters.maxPrice, filters.sort]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data } = await API.get("/products/categories");
        setCategoryOptions(Array.isArray(data) ? data : []);
      } catch (error) {
        pushToast(error.response?.data?.message || "Failed to load categories", "error");
      }
    };

    loadCategories();
  }, [pushToast]);

  const visiblePages = useMemo(() => {
    const total = pageMeta.pages || 1;
    const current = pageMeta.page || 1;
    const start = Math.max(1, current - 2);
    const end = Math.min(total, start + 4);
    const adjustedStart = Math.max(1, end - 4);

    return Array.from({ length: end - adjustedStart + 1 }, (_, i) => adjustedStart + i);
  }, [pageMeta.page, pageMeta.pages]);

  return (
    <div className="container-app space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] px-6 py-10 md:px-10 md:py-14">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-orange-200/55 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-sky-200/60 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-orange-700">
              New Season Drop
            </p>
            <h1 className="mt-4 text-4xl font-black uppercase leading-[1.05] tracking-tight md:text-6xl">
              10% Off Your
              <br />
              First Order
            </h1>
            <p className="mt-4 max-w-xl text-sm text-[color:var(--text-muted)] md:text-base">
              Premium streetwear for men and women. Curated pieces from verified sellers, secure checkout, and fast delivery updates.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#products" className="btn-primary">
                Buy Now
              </a>
              <Link to="/register" className="btn-secondary">
                Become a Seller
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-[color:var(--border)] bg-gradient-to-br from-zinc-900 to-zinc-700 p-6 text-white shadow-xl">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-300">Today&apos;s Offer</p>
            <p className="mt-4 text-5xl font-black leading-none">50% OFF</p>
            <p className="mt-2 text-sm text-zinc-200">on selected categories this week.</p>
            <div className="mt-6 grid grid-cols-3 gap-2 text-center text-xs">
              {["Fast Return", "Same Day", "Secure Pay"].map((item) => (
                <div key={item} className="rounded-xl border border-white/20 bg-white/10 px-2 py-3">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          { id: "men", title: "Men", subtitle: "Oversized tees, cargos, denim", link: "/?q=men" },
          { id: "women", title: "Women", subtitle: "Dresses, bags, and elevated basics", link: "/?q=women" },
          { id: "blog", title: "Blog", subtitle: "Style edits and drops this month", link: "/blog" },
        ].map((item) => (
          <Link
            key={item.id}
            id={item.id}
            to={item.link}
            className="group relative overflow-hidden rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-6 shadow-lift"
          >
            <div className="absolute -right-7 -top-8 h-24 w-24 rounded-full bg-orange-200/40 blur-2xl transition group-hover:scale-125" />
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[color:var(--text-muted)]">Collection</p>
            <p className="mt-2 text-2xl font-bold uppercase tracking-tight">{item.title}</p>
            <p className="mt-2 text-sm text-[color:var(--text-muted)]">{item.subtitle}</p>
            <p className="mt-4 text-sm font-semibold text-[color:var(--accent)]">Explore →</p>
          </Link>
        ))}
      </section>

      <section className="card p-4 md:p-5">
        <div className="grid gap-3 md:grid-cols-4">
          <select
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            className="input"
          >
            <option value="">All categories</option>
            {categoryOptions.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>

          <InputField
            placeholder="Min price"
            type="number"
            value={filters.minPrice}
            onChange={(e) => setFilters((f) => ({ ...f, minPrice: e.target.value }))}
          />

          <InputField
            placeholder="Max price"
            type="number"
            value={filters.maxPrice}
            onChange={(e) => setFilters((f) => ({ ...f, maxPrice: e.target.value }))}
          />

          <select
            value={filters.sort}
            onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
            className="input"
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Rating</option>
          </select>
        </div>

        {queryQ ? (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-sm text-[color:var(--text-muted)]">Search: <b>{queryQ}</b></p>
            <button className="text-sm text-[color:var(--accent)]" onClick={() => navigate("/")}>Clear</button>
          </div>
        ) : null}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["Free Shipping & Return", "On orders above ₦99,999"],
          ["Same Day Delivery", "Fast dispatch within Lagos"],
          ["Online Support 24/7", "We are ready to help anytime"],
        ].map((item) => (
          <div key={item[0]} className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-4">
            <p className="text-sm font-semibold">{item[0]}</p>
            <p className="mt-1 text-xs text-[color:var(--text-muted)]">{item[1]}</p>
          </div>
        ))}
      </section>

      <section id="products" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase">Latest Products</h2>
          <span className="text-sm text-[color:var(--text-muted)]">{products.length} items</span>
        </div>

        {loading ? (
          <Loader label="Loading marketplace products..." />
        ) : products.length === 0 ? (
          <EmptyState title="No products found" description="Try changing your filters or search keyword." />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-2 pt-5">
              <button
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pageMeta.page <= 1}
                onClick={() => loadProducts(1)}
                aria-label="First page"
              >
                |&lt;
              </button>
              <button
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pageMeta.page <= 1}
                onClick={() => loadProducts(pageMeta.page - 1)}
                aria-label="Previous page"
              >
                &lt;
              </button>

              {visiblePages.map((n) => (
                <button
                  key={n}
                  className={`inline-flex h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-semibold transition ${
                    n === pageMeta.page
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-[color:var(--border)] bg-[color:var(--surface)] hover:bg-slate-50 dark:hover:bg-slate-900"
                  }`}
                  onClick={() => loadProducts(n)}
                >
                  {n}
                </button>
              ))}

              <button
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pageMeta.page >= pageMeta.pages}
                onClick={() => loadProducts(pageMeta.page + 1)}
                aria-label="Next page"
              >
                &gt;
              </button>
              <button
                className="inline-flex h-10 min-w-10 items-center justify-center rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] px-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
                disabled={pageMeta.page >= pageMeta.pages}
                onClick={() => loadProducts(pageMeta.pages)}
                aria-label="Last page"
              >
                &gt;|
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default Home;
