'use server';

import { requireUser } from "@/lib/auth0-utils";
import { updateAuth0UserProfile } from "@/lib/auth0Management";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { updateUserProfileService, updateUserAddressService } from "@/services/userService";

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z.string().trim().email("Please enter a valid email address."),
});


const addressSchema = z.object({
  address: z.string().trim().min(1, "Address is required."),
  city: z.string().trim().optional(),
  postalCode: z.string().trim().regex(/^\d{5}$/, "Postal code must be exactly 5 digits."),
  country: z.string().trim().optional(),
  phone: z.string().trim().regex(/^\+?[0-9\s\-()]{10,15}$/, "Please enter a valid phone number."),
});


export async function updateUserProfile(formdata: FormData) {

  const user = await requireUser();

  const userId = user?.sub || (user as any)?.id;

  if (!userId) {
    throw new Error("User ID is missing");
  }

  const rawData = {
    name: formdata.get("name"),
    email: formdata.get("email"),
  };

  const validatedData = profileSchema.parse(rawData);

  try {
    // first update Auth0 profile, then update MongoDB profile
    await updateAuth0UserProfile(userId, {
      name: validatedData.name,
      email: validatedData.email
    });

    await updateUserProfileService(userId, validatedData); // Later, we can also update the MongoDB profile if needed

    revalidatePath("/user/profile");
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw new Error("Failed to update user profile");
  }
}


export async function updateUserAddress(formdata: FormData) {
  const user = await requireUser();

  const userId = user?.sub || (user as any)?.id;

  if (!userId) {
    throw new Error("User ID is missing");
  }

  const rawData = {
    address: formdata.get("address") as string,
    city: formdata.get("city") as string,
    postalCode: formdata.get("postalCode") as string,
    country: formdata.get("country") as string,
    phone: formdata.get("phone") as string,
  };

  const validatedData = addressSchema.parse(rawData);


  try {
    await updateUserAddressService(userId, {
      address: validatedData.address,
      city: validatedData.city || "",
      postalCode: validatedData.postalCode || "",
      country: validatedData.country || "",
      phone: validatedData.phone || "",
    });

    revalidatePath("/user/profile");
  } catch (error) {
    console.error("Error updating user address:", error);
    throw new Error("Failed to update user address");
  }
}
