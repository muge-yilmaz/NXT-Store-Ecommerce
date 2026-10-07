import type { Product as PrismaProduct } from "@/generated/prisma";
import { stripe } from "@/lib/stripe";
import { parseStorefrontFiltersFromSearchParams } from "@/lib/validation";
import type { CreateProductData } from "@/lib/validation/product";
import { prisma } from "@/lib/prisma";
import { Currency, isCurrency } from "@/types/currency";
import {
  isProductCategory,
  type ProductCategory,
  type ProductSort,
} from "@/types/product";

export type Product = {
  id: string;
  name: string;
  description: string;
  priceCents: number;
  currency: Currency;
  category: ProductCategory;
  stock: number;
  imageUrls: string[];
  isActive: boolean;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type GetStorefrontProductsFilters = {
  category?: ProductCategory | "all";
  sort?: ProductSort;
};

function toProduct(record: PrismaProduct): Product {
  if (!isCurrency(record.currency)) {
    throw new Error(`Unsupported currency: ${record.currency}`);
  }
  if (!isProductCategory(record.category)) {
    throw new Error(`Unsupported category: ${record.category}`);
  }


  // Safely cast the record to Product type, ensuring that the currency and category are valid
  return {
    id: record.id,
    name: record.name,
    description: record.description,
    priceCents: record.priceCents,
    currency: record.currency,
    category: record.category,
    stock: record.stock,
    imageUrls: record.imageUrls,
    isActive: record.isActive,
    stripeProductId: (record as any).stripeProductId ?? null,
    stripePriceId: (record as any).stripePriceId ?? null,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

export async function getStorefrontProducts(
  filters: GetStorefrontProductsFilters = {},
): Promise<Product[]> {
  try {
    const { category, sort } = filters;

    const whereCondition: any = {
      isActive: true,
    };

    if (category && category !== "all") {
      whereCondition.category = category;
    }

    // Default sorting is by creation date descending (newest first)
    let orderByCondition: any = { createdAt: "desc" };
    const sortStr = sort as string | undefined;

    if (sortStr === "price-asc" || sortStr === "price_asc") {
      orderByCondition = { priceCents: "asc" };
    } else if (sortStr === "price-desc" || sortStr === "price_desc") {
      orderByCondition = { priceCents: "desc" };
    } else if (sortStr === "name-asc" || sortStr === "name_asc") {
      orderByCondition = { name: "asc" };
    } else if (sortStr === "name-desc" || sortStr === "name_desc") {
      orderByCondition = { name: "desc" };
    }

    const records = await prisma.product.findMany({
      where: whereCondition,
      orderBy: orderByCondition,
    });
    return records.map(toProduct);
  } catch (error) {
    console.error("An error occured when fetching storefront products from DB", error);
    return [];
  }
}

export async function getAllProducts(): Promise<Product[]> {
  try {
    // There were 2 problems:
    // 1. enum in prisma has EUR, USD, TRY and we have EUR, GBP, TRY in our code
    // 2. we need to check that the currency and category values are compatible with our TS enums so toProduct() function does that
    const records = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    // The line below is the same as
    // return records.map((record) => toProduct(record));
    return records.map(toProduct);
  } catch (error) {
    console.error("An error occured when fetching all products from DB", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  try {
    const record = await prisma.product.findUnique({
      where: { id },
    });
    if (!record) return null;
    return toProduct(record);
  } catch (error) {
    console.error(`Error fetching product by id ${id}:`, error);
    return null;
  }
}


export async function createProduct(
  data: CreateProductData & { stripeProductId: string; stripePriceId: string },
  imageUrls: string[],
): Promise<Product> {
  const record = await prisma.product.create({
    data: {
      ...data,
      currency: data.currency as Currency,
      category: data.category as ProductCategory,
      imageUrls,
    },
  });
  return toProduct(record);
}


export async function updateProduct(
  id: string,
  data: Partial<CreateProductData> & { imageUrls?: string[]; isActive?: boolean }
): Promise<Product> {

  const { currency, category, ...rest } = data;

  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found.`);
  }

  let newStripePriceId = existingProduct.stripePriceId;
  let newStripeProductId = existingProduct.stripeProductId;

  // Stripe Sync if the product has a Stripe Product ID
  if (existingProduct.stripeProductId) {
    try {
      const stripeProductUpdateData: any = {};

      // Update the Stripe product only if the name, description, or isActive status has changed
      if (rest.name && rest.name !== existingProduct.name) {
        stripeProductUpdateData.name = rest.name;
      }
      if (rest.description && rest.description !== existingProduct.description) {
        stripeProductUpdateData.description = rest.description;
      }
      if (rest.isActive !== undefined && rest.isActive !== existingProduct.isActive) {
        stripeProductUpdateData.active = rest.isActive;
      }

      if (Object.keys(stripeProductUpdateData).length > 0) {
        await stripe.products.update(existingProduct.stripeProductId, stripeProductUpdateData);
      }

      // If the price has changed, we need to create a new Stripe Price and deactivate the old one
      if (rest.priceCents && rest.priceCents !== existingProduct.priceCents) {
        // Deactivate the old price if it exists
        if (existingProduct.stripePriceId) {
          await stripe.prices.update(existingProduct.stripePriceId, { active: false });
        }

        // Create a new price for the product
        const newPrice = await stripe.prices.create({
          product: existingProduct.stripeProductId,
          unit_amount: rest.priceCents,
          currency: (currency || existingProduct.currency).toLowerCase(),
        });

        newStripePriceId = newPrice.id;
      }
    } catch (stripeError) {
      console.error(`Stripe update failed for product ${id}:`, stripeError);
      throw new Error("Failed to sync product updates with Stripe.");
    }
  }


  const record = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      stripePriceId: newStripePriceId,
      ...(currency && { currency: currency as Currency }),
      ...(category && { category: category as ProductCategory }),
    },
  });

  return toProduct(record);
}

export function parseStorefrontFilters(
  searchParams: Record<string, string | string[] | undefined>,
): { categoryValue: ProductCategory | "all"; sortValue: ProductSort } {
  const { category, sort } =
    parseStorefrontFiltersFromSearchParams(searchParams);

  return {
    categoryValue: category as ProductCategory | "all",
    sortValue: sort as ProductSort
  };
}


export async function deleteProduct(id: string): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id }
  });

  if (!product) return;

  // Step 1: Check if the product has a Stripe Product ID or Price ID
  try {
    if (product.stripePriceId) {
      await stripe.prices.update(product.stripePriceId, { active: false });
    }
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, { active: false });
    }
  } catch (stripeError) {
    console.error(`Stripe archiving failed for product ${id}. Aborting DB deletion.`, stripeError);
    throw new Error(`Cannot delete product ${id} because Stripe archiving failed.`);
  }

  // Step 2: Only delete from MongoDB if Stripe archiving is successful
  await prisma.product.delete({
    where: { id },
  });
}

// delete multiple products
export async function deleteMultipleProducts(ids: string[]): Promise<void> {
  const failedIds: string[] = [];

  for (const id of ids) {
    try {
      await deleteProduct(id);
    } catch (error) {
      console.error(`Failed to delete product with id ${id} during bulk delete:`, error);
      failedIds.push(id);
    }
  }

  if (failedIds.length > 0) {
    throw new Error(`Failed to delete some products: ${failedIds.join(', ')}`);
  }
}