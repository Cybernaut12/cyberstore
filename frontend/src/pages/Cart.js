import React, { useContext, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartQty, removeFromCart } from "../utils/cart";
import Button from "../components/ui/Button";
import EmptyState from "../components/ui/EmptyState";
import { useToast } from "../components/ui/ToastContext";
import { resolveImageUrl } from "../utils/image";
import { AuthContext } from "../context/AuthContext";

function Cart() {
  const navigate = useNavigate();
  const { pushToast } = useToast();
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState(getCart());

  const subtotal = useMemo(
    () => cartItems.reduce((acc, item) => acc + item.price * item.qty, 0),
    [cartItems]
  );

  const changeQty = (id, qty, stock) => {
    const safeQty = Math.max(1, Math.min(Number(qty), stock || Number(qty)));
    setCartItems(updateCartQty(id, safeQty));
  };

  const removeItem = (id) => {
    setCartItems(removeFromCart(id));
    pushToast("Item removed", "success");
  };

  if (!cartItems.length) {
    return (
      <div className="container-app">
        <EmptyState
          title="Your cart is empty"
          description="Find premium streetwear pieces from verified sellers."
          action={<Link to="/"><Button>Go Shopping</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="container-app grid gap-6 lg:grid-cols-[1fr_340px]">
      <section className="space-y-3">
        <h1 className="page-title">Cart</h1>

        {cartItems.map((item) => (
          <div key={item._id} className="card grid gap-3 p-4 sm:grid-cols-[120px_1fr_auto] sm:items-center">
            <img
              src={resolveImageUrl(item.image, "https://via.placeholder.com/200x150?text=No+Image")}
              alt={item.name}
              className="h-24 w-full rounded-xl object-cover sm:w-[120px]"
            />

            <div>
              <Link to={`/product/${item._id}`} className="text-sm font-semibold md:text-base">{item.name}</Link>
              <p className="mt-1 text-sm text-[color:var(--text-muted)]">₦{item.price}</p>
              <div className="mt-3 flex items-center gap-2">
                <button className="btn-secondary h-9 w-9 p-0" onClick={() => changeQty(item._id, item.qty - 1, item.stock)}>-</button>
                <span className="w-8 text-center text-sm font-medium">{item.qty}</span>
                <button className="btn-secondary h-9 w-9 p-0" onClick={() => changeQty(item._id, item.qty + 1, item.stock)}>+</button>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold">₦{item.price * item.qty}</p>
              <Button variant="danger" className="mt-3" onClick={() => removeItem(item._id)}>Remove</Button>
            </div>
          </div>
        ))}
      </section>

      <aside className="card h-fit p-5">
        <h2 className="text-lg font-bold">Summary</h2>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-[color:var(--text-muted)]">Subtotal</span><span>₦{subtotal}</span></div>
          <div className="flex justify-between"><span className="text-[color:var(--text-muted)]">Shipping</span><span>Calculated at checkout</span></div>
          <div className="mt-3 border-t border-[color:var(--border)] pt-3 text-base font-bold flex justify-between"><span>Total</span><span>₦{subtotal}</span></div>
        </div>
        <Button
          className="mt-5 w-full"
          onClick={() => {
            if (!user) {
              pushToast("Create an account to continue checkout", "info");
              navigate("/register?redirect=/checkout");
              return;
            }
            navigate("/checkout");
          }}
        >
          Checkout
        </Button>
      </aside>
    </div>
  );
}

export default Cart;
