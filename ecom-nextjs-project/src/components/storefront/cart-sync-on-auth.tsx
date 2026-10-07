"use client";

import { useEffect } from "react";
import { clearCart } from "@/lib/cart-store";

export function CartSyncOnAuth() {
  useEffect(() => {
    const currentSession = document.cookie
      .split("; ")
      .find((row) => row.startsWith("appSession="))
      ?.split("=")[1];

    const lastSession = localStorage.getItem("nxt_active_session");

    // If the last session and current session are different, clear the cart and dispatch a cart update event
    if (lastSession && currentSession && lastSession !== currentSession) {
      clearCart();
      window.dispatchEvent(new Event("cart-updated"));
    }

    if (currentSession) {
      localStorage.setItem("nxt_active_session", currentSession);
    } else {
      // If the session has ended, remove the session identifier from local storage
      localStorage.removeItem("nxt_active_session");
    }
  }, []);

  return null;
}