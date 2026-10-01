"use server";

import { revalidatePath } from "next/cache";
import { deleteMultipleProducts } from "@/lib/products";
import { requireAdmin } from "@/lib/auth0-utils";

export async function bulkDeleteProductsAction(productIds: string[]) {
  try {
    // ADMİN YETKİ KONTROLÜ (Yetkisiz toplu silmeyi engeller)
    await requireAdmin();
    
    await deleteMultipleProducts(productIds);
    revalidatePath("/admin/products");  // Önbelleği temizle
    revalidatePath("/");                // Anasayfa önbelleğini temizle
    return { success: true };
  } catch (error) {
    console.error("Bulk delete action error:", error);
    return { success: false };
  }
}