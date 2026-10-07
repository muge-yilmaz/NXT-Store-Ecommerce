"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { requireAdmin } from "@/lib/auth0-utils";

// Suspend or unsuspend a user account
export async function toggleUserSuspensionAction(userId: string, suspend: boolean) {

  try {
    await requireAdmin();

    const db = prisma as any;

    if (!db.user) {
      return { success: false, error: "User model not found." };
    }

    // If suspend is undefined, toggle the current suspension state
    let nextSuspendState = suspend;
    if (nextSuspendState === undefined) {
      const currentUser = await db.user.findUnique({
        where: { id: userId },
        select: { isSuspended: true },
      });
      nextSuspendState = !currentUser?.isSuspended;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        isSuspended: nextSuspendState,
      },
    });

    // Send a notification to the user about the suspension status change
    if (updatedUser?.email) {
      await createNotification({
        userId: updatedUser.email,
        title: nextSuspendState ? "Account Suspended" : "Account Reactivated",
        message: nextSuspendState
          ? "Your account has been suspended by an administrator."
          : "Your account suspension has been lifted.",
        link: "/support",
      });
    }

    revalidatePath("/admin/users");
    return { success: true };
  } catch (error) {
    console.error("Toggle user suspension error:", error);
    return { success: false, error: "Failed to update user status." };
  }
}