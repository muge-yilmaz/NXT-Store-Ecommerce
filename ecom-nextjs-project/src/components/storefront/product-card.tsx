"use client";

import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Badge } from "../ui/badge";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Currency, formatPrice } from "../../types/currency";
import {
  formatCategoryLabel,
  type ProductCategory,
} from "../../types/product";
import { CheckoutButton } from "./checkout-button";
import { checkUserSuspendedAction } from "@/app/actions/user";
import { getCart } from "@/lib/cart-store";

type ProductCardProps = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  category: ProductCategory;
  imageUrls?: string[];
  stripePriceId?: string;
};

export function ProductCard({
  id,
  name,
  description,
  priceCents,
  currency,
  category,
  imageUrls,
  stripePriceId,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(0);
  const checkoutBtnRef = useRef<HTMLDivElement>(null);

  const priceLabel = formatPrice(
    priceCents,
    currency as Currency,
  );

  // If there are image URLs, use the first one; otherwise, set to undefined
  const mainImageUrl = imageUrls && imageUrls.length > 0 ? imageUrls[0] : undefined;

  // Sync the quantity state with the cart whenever the component mounts or the stripePriceId changes
  useEffect(() => {
    const syncQuantityWithCart = () => {
      const cart = getCart();
      const currentItem = cart.find((item) => item.stripePriceId === stripePriceId);
      // If the item is found in the cart, set the quantity to its value; otherwise, set it to 0
      setQuantity(currentItem ? currentItem.quantity : 0);
    };

    // Initial sync when the component mounts
    syncQuantityWithCart();

    // Add an event listener to update the quantity whenever the cart is updated
    window.addEventListener("cart-updated", syncQuantityWithCart);
    return () => window.removeEventListener("cart-updated", syncQuantityWithCart);
  }, [stripePriceId]);


  const triggerCartAdd = () => {
    if (checkoutBtnRef.current) {
      const button = checkoutBtnRef.current.querySelector("button");
      if (button) {
        button.click();
      }
    }
  };

  const handleIncrement = async () => {
    const isSuspended = await checkUserSuspendedAction();

    if (isSuspended === null) {
      // Handle the case where the suspension check failed (e.g., show an error message)
      triggerCartAdd();
      return;
    }

    setQuantity((prev) => prev + 1);
    triggerCartAdd();
  };

  const handleDecrement = () => {
    setQuantity((prev) => {
      if (prev > 0) {
        return prev - 1;
      }
      return 0;
    });
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative w-full h-64 overflow-hidden bg-white rounded-t-lg p-2">
        {mainImageUrl ? (
          <Image
            src={mainImageUrl}
            alt={name}
            fill
            // Use objectFit and objectPosition to ensure the image is centered and contained within the div
            style={{ objectFit: "contain", objectPosition: "center" }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>

      {/* Hidden Checkout Button */}
      <div ref={checkoutBtnRef} className="hidden">
        <CheckoutButton
          mode="add-to-cart"
          productInfo={{ stripePriceId: stripePriceId || '', name: name }}
        />
      </div>

      <CardHeader className="gap-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="line-clamp-1 text-base">{name}</CardTitle>
          <Badge variant="secondary">{formatCategoryLabel(category)}</Badge>
        </div>
        <CardDescription className="line-clamp-2">{description}</CardDescription>
      </CardHeader>
      <CardFooter className="border-t border-border pt-4 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <p className="text-lg font-semibold text-foreground">{priceLabel}</p>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-1.5 bg-muted/80 p-1 rounded-lg border border-border/60">
          <Button
            size="icon"
            variant="default"
            className="size-7 rounded-md"
            onClick={handleDecrement}
            disabled={quantity === 0}
          >
            <Minus className="size-3.5" />
          </Button>

          <span className="w-6 text-center text-xs font-bold text-foreground select-none">
            {quantity}
          </span>

          <Button
            size="icon"
            variant="default"
            className="size-7 rounded-md"
            onClick={handleIncrement}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}