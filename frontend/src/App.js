import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import PaymentSuccess from "./pages/PaymentSuccess";
import BuyerOrders from "./pages/BuyerOrders";
import OrderDetails from "./pages/OrderDetails";
import ProtectedRoute from "./components/ProtectedRoute";
import SellerDashboard from "./pages/SellerDashboard";
import SellerProducts from "./pages/SellerProducts";
import SellerOrders from "./pages/SellerOrders";
import AdminDashboard from "./pages/AdminDashboard";
import AdminPendingProducts from "./pages/AdminPendingProducts";
import AdminOrders from "./pages/AdminOrders";




import Login from "./pages/Login";
import Home from "./pages/Home";

function App() {
  return (
    <AuthProvider>
  <Router>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/my-orders" element={<BuyerOrders />} />
      <Route path="/orders/:id" element={<OrderDetails />} />
      <Route
  path="/seller"
  element={
    <ProtectedRoute roles={["seller"]}>
      <SellerDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/seller/products"
  element={
    <ProtectedRoute roles={["seller"]}>
      <SellerProducts />
    </ProtectedRoute>
  }
/>

<Route
  path="/seller/orders"
  element={
    <ProtectedRoute roles={["seller"]}>
      <SellerOrders />
    </ProtectedRoute>
  }
/>
<Route
  path="/admin"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminDashboard />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/pending-products"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminPendingProducts />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/orders"
  element={
    <ProtectedRoute roles={["admin"]}>
      <AdminOrders />
    </ProtectedRoute>
  }
/>

      
    </Routes>
  </Router>
</AuthProvider>

  );
}


export default App;
