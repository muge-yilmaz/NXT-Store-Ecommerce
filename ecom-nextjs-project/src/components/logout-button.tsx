"use client";

import { Button } from "@/components/ui/button";
import { clearCart } from "@/lib/cart-store";

export function LogoutButton() {
  const handleLogout = () => {
    // Delete the cart from local storage
    clearCart();
    window.dispatchEvent(new Event("cart-updated"));
    window.location.href = "/auth/logout";
  };

  return (
    <Button variant="outline" size="sm" onClick={handleLogout} className="flex items-center gap-1.5">
      Log out
    </Button>
  );
}