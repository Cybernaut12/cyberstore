import React from "react";
import { Link } from "react-router-dom";
import { resolveImageUrl } from "../utils/image";

function ProductCard({ product }) {
  const imageUrl = resolveImageUrl(product.image, "https://via.placeholder.com/800x600?text=No+Image");
  const currentPrice = Number(product.price || 0);
  const oldPrice = currentPrice > 0 ? Math.round(currentPrice * 1.18) : 0;
  const discount = oldPrice > currentPrice ? Math.round(((oldPrice - currentPrice) / oldPrice) * 100) : 0;
  const ratingValue = Number(product.rating || 0);
  const filledStars = Math.max(0, Math.min(5, Math.round(ratingValue)));
  const stars = "★".repeat(filledStars) + "☆".repeat(5 - filledStars);
  const fmt = (n) => `₦${Number(n || 0).toLocaleString()}`;

  return (
    <Link
      to={`/product/${product._id}`}
      className="group overflow-hidden rounded-md border border-[color:var(--border)] bg-[color:var(--surface)] transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] bg-slate-100 dark:bg-slate-900">
        <img src={imageUrl} alt={product.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        <span className="absolute right-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-xs text-orange-500">
          ♡
        </span>
      </div>
      <div className="space-y-1 p-2.5">
        <h3 className="line-clamp-2 min-h-[34px] text-[14px] font-medium leading-4 text-[color:var(--text)]">
          {product.name}
        </h3>

        <p className="text-lg font-extrabold leading-tight">{fmt(currentPrice)}</p>

        {oldPrice ? (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[color:var(--text-muted)] line-through">{fmt(oldPrice)}</span>
            {discount > 0 ? (
              <span className="rounded bg-orange-50 px-1.5 py-0.5 font-semibold text-orange-600">-{discount}%</span>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-1 text-xs">
          <span className="text-amber-500">{stars}</span>
          <span className="text-[color:var(--text-muted)]">({product.numReviews || 0})</span>
        </div>

        <p className="truncate text-[11px] uppercase tracking-wide text-[color:var(--text-muted)]">
          {product.brand || product.category || "CyberStore"}
        </p>
      </div>
    </Link>
  );
}

export default ProductCard;
