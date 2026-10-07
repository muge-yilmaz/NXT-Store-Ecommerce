export type CartItem = {
  stripePriceId: string;
  quantity: number;
  name?: string;
};


// If the user is logged in, we can use their email or user ID to create a unique cart key. If not, we can use a generic "guest" key.
const getCartKey = (): string => {
  if (typeof window === "undefined") return "shopping-cart-guest";

  const activeUser = localStorage.getItem("current_user_email") || "guest";
  return `shopping-cart_${activeUser}`;
};


export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  const cartKey = getCartKey();
  const cart = localStorage.getItem(cartKey);
  return cart ? JSON.parse(cart) : [];
};

export const addToCart = (item: CartItem) => {
  if (typeof window === "undefined") return;
  const cart = getCart();
  const existingItem = cart.find((i) => i.stripePriceId === item.stripePriceId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push(item);
  }

  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(cart));
  // Dispatch a custom event to notify other components that the cart has been updated
  window.dispatchEvent(new Event("cart-updated"));
};

export const clearCart = () => {
  if (typeof window === "undefined") return;
  const cartKey = getCartKey();
  localStorage.removeItem(cartKey);
  window.dispatchEvent(new Event("cart-updated"));
};


export const removeFromCart = (stripePriceId: string) => {
  if (typeof window === "undefined") return;
  let cart = getCart();
  const existingItem = cart.find((item) => item.stripePriceId === stripePriceId);

  if (existingItem) {
    if (existingItem.quantity > 1) {
      existingItem.quantity -= 1;
    } else {
      cart = cart.filter((item) => item.stripePriceId !== stripePriceId);
    }
  }

  const cartKey = getCartKey();
  localStorage.setItem(cartKey, JSON.stringify(cart));
  window.dispatchEvent(new Event("cart-updated"));
};