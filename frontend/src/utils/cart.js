export const getCart = () => {
  return JSON.parse(localStorage.getItem("cart")) || [];
};

export const saveCart = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
};

export const addToCart = (product, qty = 1) => {
  const cart = getCart();

  const existing = cart.find((item) => item._id === product._id);

  if (existing) {
    const updated = cart.map((item) =>
      item._id === product._id
        ? { ...item, qty: item.qty + qty }
        : item
    );
    saveCart(updated);
    return updated;
  }

  const newItem = {
    _id: product._id,
    name: product.name,
    price: product.price,
    image: product.image,
    stock: product.stock,
    qty,
  };

  const updated = [...cart, newItem];
  saveCart(updated);
  return updated;
};

export const updateCartQty = (id, qty) => {
  const cart = getCart();
  const updated = cart.map((item) =>
    item._id === id ? { ...item, qty } : item
  );
  saveCart(updated);
  return updated;
};

export const removeFromCart = (id) => {
  const cart = getCart();
  const updated = cart.filter((item) => item._id !== id);
  saveCart(updated);
  return updated;
};

export const clearCart = () => {
  localStorage.removeItem("cart");
};
