import React, { useEffect, useState } from "react";
import API from "../api/axios";
import { Link } from "react-router-dom";

function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data } = await API.get("/products");
      setProducts(data.products);
    };

    fetchProducts();
  }, []);

  return (
    <div style={{ padding: "40px" }}>
      <h2 style={{ marginBottom: "30px" }}>Products</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "20px",
        }}
      >
        {products.map((product) => (
          <div
            key={product._id}
            style={{
              border: "1px solid #ddd",
              borderRadius: "10px",
              padding: "15px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
              transition: "0.3s",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />

            <h3 style={{ marginTop: "10px" }}>{product.name}</h3>
            <p style={{ fontWeight: "bold", color: "#1a8917" }}>
              ₦{product.price}
            </p>

            <Link to={`/product/${product._id}`} style={{ textDecoration: "none" }}>
  <button
    style={{
      marginTop: "10px",
      width: "100%",
      padding: "8px",
      backgroundColor: "black",
      color: "white",
      border: "none",
      borderRadius: "5px",
      cursor: "pointer",
    }}
  >
    View Product
  </button>
</Link>

          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
