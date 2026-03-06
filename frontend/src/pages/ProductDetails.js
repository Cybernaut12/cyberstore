import React, { useContext, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../api/axios";
import { addToCart } from "../utils/cart";
import Button from "../components/ui/Button";
import Loader from "../components/ui/Loader";
import InputField from "../components/ui/InputField";
import { useToast } from "../components/ui/ToastContext";
import { AuthContext } from "../context/AuthContext";
import { resolveImageUrl } from "../utils/image";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { pushToast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const existingReview = useMemo(
    () => product?.reviews?.find((r) => r.user === user?._id),
    [product?.reviews, user?._id]
  );

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const { data } = await API.get(`/products/${id}`);
      setProduct(data);
    } catch (error) {
      pushToast(error.response?.data?.message || "Failed to load product", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    }
  }, [existingReview]);

  const handleAddToCart = () => {
    addToCart(product, 1);
    pushToast("Added to cart", "success");
    navigate("/cart");
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) return pushToast("Login to review products", "error");
    if (user.role !== "buyer") return pushToast("Only buyers can write reviews", "error");

    try {
      setSubmitting(true);
      const payload = { rating, comment };
      if (existingReview) {
        await API.put(`/products/${id}/reviews`, payload);
        pushToast("Review updated", "success");
      } else {
        await API.post(`/products/${id}/reviews`, payload);
        pushToast("Review submitted", "success");
      }
      await fetchProduct();
      if (!existingReview) {
        setRating(5);
        setComment("");
      }
    } catch (error) {
      pushToast(error.response?.data?.message || "Review failed", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="container-app"><Loader label="Loading product..." /></div>;
  if (!product) return <div className="container-app"><p>Product not found.</p></div>;

  return (
    <div className="container-app space-y-6">
      <nav className="text-sm text-[color:var(--text-muted)]">
        <Link to="/" className="text-[color:var(--accent)]">Home</Link> / {product.category || "Category"} / {product.name}
      </nav>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <img
            src={resolveImageUrl(product.image, "https://via.placeholder.com/900x700?text=No+Image")}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="card p-5 md:p-6">
          <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
          <p className="mt-2 text-2xl font-extrabold">₦{product.price}</p>
          <p className="mt-2 text-sm text-[color:var(--text-muted)]">⭐ {Number(product.rating || 0).toFixed(1)} ({product.numReviews || 0} reviews)</p>
          <p className="mt-4 text-sm text-[color:var(--text-muted)]">{product.description}</p>

          <div className="mt-4 rounded-xl border border-[color:var(--border)] p-4 text-sm">
            <p><b>Seller:</b> {product.seller?.name || "Unknown"} {product.seller?.email ? `(${product.seller.email})` : ""}</p>
            <p className="mt-1"><b>Stock:</b> {product.stock}</p>
            <p className="mt-1"><b>Size:</b> {product.size || "-"}</p>
            <p className="mt-1"><b>Color:</b> {product.color || "-"}</p>
          </div>

          <Button className="mt-5 w-full" onClick={handleAddToCart}>Add to Cart</Button>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Reviews</h2>

        {product.reviews?.length ? (
          <div className="grid gap-3">
            {product.reviews.map((r) => (
              <div key={r._id} className="card p-4">
                <p className="text-sm font-semibold">{r.name} <span className="ml-2 text-[color:var(--text-muted)]">⭐ {r.rating}/5</span></p>
                <p className="mt-1 text-sm text-[color:var(--text-muted)]">{r.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-6 text-sm text-[color:var(--text-muted)]">No reviews yet.</div>
        )}

        <form onSubmit={submitReview} className="card space-y-4 p-4 md:p-5">
          <h3 className="text-base font-semibold">{existingReview ? "Update your review" : "Write a review"}</h3>
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="input">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} Stars</option>)}
          </select>
          <InputField
            placeholder="Share your experience"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
          />
          <Button disabled={submitting}>{submitting ? "Submitting..." : existingReview ? "Update Review" : "Post Review"}</Button>
        </form>
      </section>
    </div>
  );
}

export default ProductDetails;
