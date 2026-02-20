import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import API from "../api/axios";
import { useNavigate } from "react-router-dom";
import { addToCart } from "../utils/cart";


function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await API.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;
  if (!product) return <div style={{ padding: "40px" }}>Product not found</div>;

  return (
    <div style={{ padding: "40px" }}>
      <Link to="/" style={{ textDecoration: "none" }}>← Back</Link>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "30px",
          marginTop: "20px",
          alignItems: "start",
        }}
      >
        <img
          src={
            product.image?.startsWith("http")
              ? product.image
              : "https://via.placeholder.com/600x400?text=No+Image"
          }
          alt={product.name}
          style={{
            width: "100%",
            maxHeight: "450px",
            objectFit: "cover",
            borderRadius: "12px",
            border: "1px solid #eee",
          }}
        />

        <div>
          <h2 style={{ marginTop: 0 }}>{product.name}</h2>

          <p style={{ fontSize: "20px", fontWeight: "bold" }}>
            ₦{product.price}
          </p>

          <p style={{ color: "#444", lineHeight: "1.6" }}>
            {product.description}
          </p>

          <div style={{ marginTop: "10px", fontSize: "14px", color: "#555" }}>
            <p><b>Category:</b> {product.category}</p>
            <p><b>Brand:</b> {product.brand || "—"}</p>
            <p><b>Size:</b> {product.size || "—"}</p>
            <p><b>Color:</b> {product.color || "—"}</p>
            <p><b>Stock:</b> {product.stock}</p>
            <p>
              <b>Seller:</b>{" "}
              {product.seller?.name ? `${product.seller.name} (${product.seller.email})` : "—"}
            </p>
          </div>

          <button
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              background: "black",
              color: "white",
              cursor: "pointer",
              width: "100%",
              fontWeight: "bold",
            }}
            onClick={() => {
  addToCart(product, 1);
  navigate("/cart");
}}

          >
            Add to Cart
          </button>

          <div
            style={{
              marginTop: "20px",
              padding: "14px",
              border: "1px solid #eee",
              borderRadius: "10px",
            }}
          >
            <h3 style={{ marginTop: 0 }}>Reviews</h3>
            <p>
              <b>Rating:</b> {product.rating} / 5 ({product.numReviews} reviews)
            </p>

            {product.reviews?.length === 0 ? (
              <p style={{ color: "#666" }}>No reviews yet.</p>
            ) : (
              product.reviews.map((r) => (
                <div
                  key={r._id}
                  style={{
                    borderTop: "1px solid #eee",
                    paddingTop: "10px",
                    marginTop: "10px",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    <b>{r.name}</b> — {r.rating}/5
                  </p>
                  <p style={{ margin: "6px 0 0", color: "#444" }}>{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
