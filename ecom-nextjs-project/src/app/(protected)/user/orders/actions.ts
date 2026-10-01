"use server";

import { requireUser } from "@/lib/auth0-utils";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function cancelOrderAction(orderId: string) {
  try {
    // OTURUM VE KULLANICI DOĞRULAMA (requireUser)
    // Giriş yapılmamışsa bu satır hata fırlatır veya işlemi durdurur
    const user = await requireUser();
    const db = prisma as any;

    if (!db.order) {
      return { success: false, error: "Database client error." };
    }

    // 1. Siparişi bul
    const order = await db.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // SAHİPLİK KONTROLÜ (VERIFY ORDER OWNERSHIP)
    // Giriş yapan kullanıcının ID'si ile siparişin sahibi eşleşiyor mu?
    // 3. Esnek ve Güvenli Sahiplik Kontrolü (Ownership Check)
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

    // 2. Kargo kontrolü: Kargoya verildiyse kullanıcı iptal edemez
    if (order.status === "SHIPPED" || order.status === "DELIVERED") {
      return {
        success: false,
        error: "Shipped or delivered orders cannot be cancelled.",
      };
    }

    // 3. İptal işlemini gerçekleştir
    await db.order.update({
      where: { id: orderId },
      data: {
        status: "CANCELLED",
        cancelledBy: "USER",
        cancelledAt: new Date(),
      },
    });

    // Sayfayı anında yenile ki yeni durum ekrana yansısın
    revalidatePath("/user/orders");

    return { success: true };
  } catch (error: any) {
    console.error("Cancel order error:", error);
    return { success: false, error: "Failed to cancel order." };
  }
}