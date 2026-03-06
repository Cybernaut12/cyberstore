import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-10 border-t border-[color:var(--border)] bg-[color:var(--surface)]/70 py-10">
      <div className="container-app grid gap-8 md:grid-cols-4">
        <div>
          <Link to="/" className="text-xl font-extrabold tracking-tight">
            Cyber<span className="text-[color:var(--accent)]">Store</span>
          </Link>
          <p className="mt-3 text-sm text-[color:var(--text-muted)]">
            Streetwear marketplace for verified sellers, secure checkout, and fast delivery updates.
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold">Marketplace</p>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
            <li><Link to="/">Shop</Link></li>
            <li><Link to="/seller">Sell on CyberStore</Link></li>
            <li><Link to="/my-orders">Track Orders</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Company</p>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
            <li><button className="text-left" type="button">About</button></li>
            <li><button className="text-left" type="button">Privacy</button></li>
            <li><button className="text-left" type="button">Terms</button></li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold">Support</p>
          <ul className="mt-3 space-y-2 text-sm text-[color:var(--text-muted)]">
            <li><button className="text-left" type="button">Help Center</button></li>
            <li><button className="text-left" type="button">Contact</button></li>
            <li><button className="text-left" type="button">Shipping</button></li>
          </ul>
        </div>
      </div>

      <div className="container-app mt-8 border-t border-[color:var(--border)] pt-4 text-sm text-[color:var(--text-muted)]">
        © {year} CyberStore. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
