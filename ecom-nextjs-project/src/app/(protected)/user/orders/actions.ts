"use server";

import { requireUser } from "@/lib/auth0-utils";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelOrderAction(orderId: string) {
  try {
    const user = await requireUser();
    const db = prisma as any;

    if (!db.order) {
      return { success: false, error: "Database client error." };
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // VERIFY ORDER OWNERSHIP
    const currentUserId = user.sub || user.id;
    const currentUserEmail = user.email;

    const isOwner =
      (order.userId && order.userId === currentUserId) ||
      (order.userEmail && order.userEmail === currentUserEmail);

    if (!isOwner) {
      console.error("Cancel Order Failed: User is not owner of order", {
        orderUserId: order.userId,
        orderUserEmail: order.userEmail,
        currentUserId,
        currentUserEmail,
      });
      return {
        success: false,
        error: "Unauthorized: You can only cancel your own orders.",
      };
    }

    // 2. Check if the order is already shipped or delivered
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return {
        success: false,
        error: "Shipped or delivered orders cannot be cancelled.",
      };
    }

    await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledBy: "USER",
        cancelledAt: new Date(),
      },
    });

    revalidatePath("/user/orders");

    return { success: true };
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return { success: false, error: "Failed to cancel order." };
  }
}