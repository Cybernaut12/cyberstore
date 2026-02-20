import React, { useEffect, useState } from "react";
import API from "../api/axios";

function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMine = async () => {
      try {
        const { data } = await API.get("/products/mine");
        setProducts(data);
      } catch (error) {
        alert(error.response?.data?.message || "Failed to load your products");
      } finally {
        setLoading(false);
      }
    };

    fetchMine();
  }, []);

  if (loading) return <div style={{ padding: "40px" }}>Loading...</div>;

  return (
    <div style={{ padding: "40px" }}>
      <h2>My Products</h2>

      {products.length === 0 ? (
        <p>No products yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
          {products.map((p) => (
            <div
              key={p._id}
              style={{
                border: "1px solid #eee",
                borderRadius: "10px",
                padding: "14px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <b>{p.name}</b>
                <p style={{ margin: "6px 0", color: "#555" }}>₦{p.price}</p>
                <small style={{ color: "#666" }}>
                  Status: <b>{p.status}</b>{" "}
                  {p.status === "rejected" && p.rejectionReason
                    ? `— Reason: ${p.rejectionReason}`
                    : ""}
                </small>
              </div>

              <div style={{ textAlign: "right" }}>
                <small style={{ color: "#666" }}>Stock: {p.stock}</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SellerProducts;
