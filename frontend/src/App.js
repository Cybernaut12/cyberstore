import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ToastProvider } from "./components/ui/ToastContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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
import Register from "./pages/Register";
import Home from "./pages/Home";
import AddProduct from "./pages/AddProduct";
import Blog from "./pages/Blog";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastProvider>
          <Router>
            <div className="app-shell flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1 py-6 md:py-8">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/product/:id" element={<ProductDetails />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/payment-success" element={<PaymentSuccess />} />
                  <Route path="/my-orders" element={<BuyerOrders />} />
                  <Route path="/orders/:id" element={<OrderDetails />} />
                  <Route
                    path="/seller"
                    element={<ProtectedRoute roles={["seller"]}><SellerDashboard /></ProtectedRoute>}
                  />
                  <Route
                    path="/seller/products"
                    element={<ProtectedRoute roles={["seller"]}><SellerProducts /></ProtectedRoute>}
                  />
                  <Route
                    path="/seller/orders"
                    element={<ProtectedRoute roles={["seller"]}><SellerOrders /></ProtectedRoute>}
                  />
                  <Route
                    path="/seller/add-product"
                    element={<ProtectedRoute roles={["seller"]}><AddProduct /></ProtectedRoute>}
                  />
                  <Route
                    path="/admin/add-product"
                    element={<ProtectedRoute roles={["admin"]}><AddProduct /></ProtectedRoute>}
                  />
                  <Route
                    path="/admin"
                    element={<ProtectedRoute roles={["admin"]}><AdminDashboard /></ProtectedRoute>}
                  />
                  <Route
                    path="/admin/pending-products"
                    element={<ProtectedRoute roles={["admin"]}><AdminPendingProducts /></ProtectedRoute>}
                  />
                  <Route
                    path="/admin/orders"
                    element={<ProtectedRoute roles={["admin"]}><AdminOrders /></ProtectedRoute>}
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </ToastProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
