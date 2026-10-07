"use server";

import { sendOrderCancelledEmail, sendOrderShippedEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { requireAdmin, requireUser } from "@/lib/auth0-utils";


export async function markOrderAsShippedAction(orderId: string) {
  try {
    await requireAdmin();

    const db = prisma as any;

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "SHIPPED",
        shippedAt: new Date(), 
      },
    });

    const targetEmail = (updatedOrder as any)?.userEmail;
    if (targetEmail){
      await sendOrderShippedEmail(targetEmail, (updatedOrder as any).id);

      await createNotification({
        userId: targetEmail,
        title: "Order Shipped! 🚚",
        message: `Your order #${orderId.slice(-6)} has been shipped.`,
        link: "/user/orders",
      });
    }

    revalidatePath("/admin/orders");
    revalidatePath("/user/orders");
    return { success: true };
  } catch (error) {
    console.error("Shipping order error:", error);
    return { success: false, error: "Failed to ship order." };
  }
}


export async function adminCancelOrderAction(orderId: string) {
  try {
    await requireAdmin();

    const db = prisma as any;

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: "ADMIN"
      }
    });


    const targetEmail = (updatedOrder as any)?.userEmail;
    if (targetEmail){
      await sendOrderCancelledEmail(targetEmail, (updatedOrder as any).id, "ADMIN");

      await createNotification({
        userId: targetEmail,
        title: "Order Cancelled ❌",
        message: `Your order #${orderId.slice(-6)} was cancelled by an admin.`,
        link: "/user/orders",
      });
    }

    revalidatePath("/admin/orders");
    revalidatePath("/user/orders");
    return { success: true };
  } catch (error) {
    console.error("Admin cancel order error:", error);
    return { success: false, error: "Failed to cancel order." };
  }
}


export async function userCancelOrderAction(orderId: string) {
  try {
    const user = await requireUser();
    const db = prisma as any;

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelledBy: "USER",
      },
    });

    await createNotification({
      userId: "ADMIN",
      title: "Order Cancelled by Customer ⚠️",
      message: `Order #${orderId.slice(-6)} was cancelled by user ${updatedOrder.userEmail || ""}.`,
      link: "/admin/orders",
    });

    if (updatedOrder.userEmail) {
      await sendOrderCancelledEmail(updatedOrder.userEmail, orderId, "USER");
    }

    revalidatePath("/user/orders");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error) {
    console.error("User cancel order error:", error);
    return { success: false, error: "Failed to cancel order." };
  }
}