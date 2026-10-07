"use client";

import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { addToCart, clearCart, getCart, removeFromCart } from "@/lib/cart-store";
import { checkUserSuspendedAction } from "@/app/actions/user";
import { sendSuspendedNotificationAction } from "@/app/actions/notifications";
import { AlertTriangle, Lock } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "../ui/alert-dialog";

interface CheckoutButtonProps {
  // If not selected, default is "checkout-cart" 
  mode: "add-to-cart" | "checkout-cart" | "clear-cart" | "remove-item";
  productInfo?: { stripePriceId: string; name: string };
}

export function CheckoutButton({ mode, productInfo }: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [isInCart, setIsInCart] = useState(false);

  // If the user is not logged in, show the authentication dialog
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // If the user is suspended, show the suspended account dialog
  const [showSuspendedDialog, setShowSuspendedDialog] = useState(false);

  // Toast state for notifications
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" as "success" | "info" | "error" });

  const triggerToast = (msg: string, type: "success" | "info" | "error" = "success") => {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 5000);
  };

  useEffect(() => {
    const updateCartState = () => {
      const cart = getCart();
      setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0));
      // If the productInfo is provided, check if it's in the cart
      if (productInfo?.stripePriceId) {
        setIsInCart(cart.some(item => item.stripePriceId === productInfo.stripePriceId));
      }
    };

    updateCartState();
    window.addEventListener("cart-updated", updateCartState);
    return () => window.removeEventListener("cart-updated", updateCartState);
  }, [productInfo?.stripePriceId, mode]);


  const handleAddToCart = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!productInfo?.stripePriceId) {
      triggerToast("Stripe price credentials missing!", "error");
      return;
    }
    try {
      const isSuspended = await checkUserSuspendedAction();

      if (isSuspended === null) {
        setShowAuthDialog(true);
        return;
      }

      addToCart({ stripePriceId: productInfo.stripePriceId, quantity: 1, name: productInfo.name });
      triggerToast(`Added ${productInfo.name} to cart! 👍`, "success");
    } catch (error) {
      setShowAuthDialog(true);
    }
  };


  const handleRemoveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInfo?.stripePriceId) return;
    removeFromCart(productInfo.stripePriceId);
    triggerToast(`Removed ${productInfo.name} from cart.`, "info");
  };


  const handleCartCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const currentCart = getCart();

    if (currentCart.length === 0) {
      triggerToast("Your cart is empty! Please add some items first.", "info");
      return;
    }

    setLoading(true);

    try {
      const isSuspended = await checkUserSuspendedAction();

      if (isSuspended === null || isSuspended === undefined) {
        setShowAuthDialog(true);
        setLoading(false);
        return;
      }

      // If the user is suspended, show the suspended dialog and send a notification to the admin
      if (isSuspended === true) {
        window.dispatchEvent(new Event("close-cart-dropdown"));
        setShowSuspendedDialog(true);
        triggerToast("Your purchase attempt was blocked because your account is suspended.", "error");
        await sendSuspendedNotificationAction();
        setLoading(false);
        return;
      }

      const response = await fetch('/api/stripe/checkout', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cartItems: currentCart }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        triggerToast(data.error || "Checkout failed", "error");
      }
    } catch (error) {
      console.error(error);
      triggerToast("Network error occurred.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClearCart = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    window.dispatchEvent(new Event("cart-updated"));
    triggerToast("Your cart has been cleared!", "info");
  };


  return (
    <>
      {/* 1. AUTHENTICATION REQUIRED DIALOG  */}
      <AlertDialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <AlertDialogContent className="max-w-md border border-border/80 bg-background/95 p-6 shadow-2xl backdrop-blur-xl sm:rounded-3xl z-[100] ">
          <AlertDialogHeader className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-inner">
              <Lock className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <AlertDialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Authentication Required
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                You need to log in to add products to your shopping cart and complete your order.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          {/* Dialog Footer */}
          <AlertDialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <AlertDialogCancel className="w-full rounded-xl border border-input bg-background hover:bg-accent hover:text-accent-foreground sm:w-1/2 cursor-pointer transition-all">
              Continue Browsing
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowAuthDialog(false);
                window.location.href = "/auth/login";
              }}
              className="w-full rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-md sm:w-1/2 cursor-pointer transition-all"
            >
              Log In Now
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 2. ACCOUNT SUSPENDED ALERT DIALOG */}
      <AlertDialog open={showSuspendedDialog} onOpenChange={setShowSuspendedDialog}>
        <AlertDialogContent className="max-w-md border border-destructive/30 bg-background/95 p-6 shadow-2xl backdrop-blur-xl sm:rounded-3xl z-[100]">
          <AlertDialogHeader className="flex flex-col items-center justify-center space-y-3 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive shadow-inner">
              <AlertTriangle className="h-7 w-7" />
            </div>

            <div className="space-y-1.5">
              <AlertDialogTitle className="text-xl font-bold tracking-tight text-destructive">
                Account Suspended
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
                Your purchase attempt was blocked because your account is currently suspended. Please contact our support team to resolve this issue.
              </AlertDialogDescription>
            </div>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <AlertDialogCancel className="w-full rounded-xl border border-input bg-background hover:bg-accent sm:w-1/2 cursor-pointer">
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSuspendedDialog(false);
                window.location.href = "/support";
              }}
              className="w-full rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-medium shadow-md sm:w-1/2 cursor-pointer"
            >
              Contact Support
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toast Area */}
      {toast.show && (
        <div
          onClick={() => {
            if (toast.type === "error") {
              window.location.href = "/support";
            }
          }}
          className={`fixed top-10 left-1/2 -translate-x-1/2 z-[110] flex items-center gap-3 rounded-2xl border border-border/85 px-6 py-4 shadow-2xl min-w-[320px] max-w-md bg-background font-medium text-sm text-foreground transition-all duration-300 ${toast.type === "error" ? "cursor-pointer hover:border-destructive/50" : ""
            }`}
        >
          <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white font-bold text-xs ${toast.type === "success" ? "bg-chart-2 shadow-md" :
              toast.type === "info" ? "bg-blue-500 shadow-md" :
                "bg-destructive shadow-md"
            }`}>
            {toast.type === "success" ? "✓" : toast.type === "info" ? "i" : "!"}
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="font-semibold text-sm tracking-tight">
              {toast.type === "success" ? "Success" : toast.type === "info" ? "Notification" : "Error"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {toast.msg}
            </p>
          </div>
        </div>
      )}

      {/* MOD 1: add-to-cart */}
      {mode === "add-to-cart" && (
        <form onSubmit={handleAddToCart}>
          <Button
            type="submit"
            variant="default"
            className="w-full"
          >
            Add to Cart
          </Button>
        </form>
      )}

      {/* MOD 2: REMOVE-ITEM */}
      {mode === "remove-item" && isInCart && (
        <form onSubmit={handleRemoveItem}>
          <Button
            type="submit"
            variant="ghost"
            className="w-full border borcer-input text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Remove
          </Button>
        </form>
      )}

      {/* MOD 3: CLEAR-CART */}
      {mode === "clear-cart" && (
        <form onSubmit={handleClearCart} className="w-full">
          <Button
            type="submit"
            variant="ghost"
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50"
          >
            Reset Cart
          </Button>
        </form>
      )}

      {/* MOD 4: CHECKOUT-CART */}
      {mode === "checkout-cart" && (
        <form onSubmit={handleCartCheckout} className="w-full">
          <Button
            type="submit"
            disabled={loading}
            variant="default"
            className="w-full shadow-md shadow-primary/10 rounded-xl active:scale-[0.98] transition-all duration-200 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing...
              </div>
            ) : (
              `Pay Total (${cartCount} items)`
            )}
          </Button>
        </form>
      )}
    </>
  );
}