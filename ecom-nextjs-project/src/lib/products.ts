import type { Product as PrismaProduct } from "@/generated/prisma";

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
  stripeProductId?: string | null; // Stripe Ürün ID alanı eklendi
  stripePriceId?: string | null;   // Stripe Fiyat ID alanı eklendi
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


  // record içerisinden gelen stripe alanlarını güvenle eşleştiriyoruz.
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

    // TypeScript hatasını önlemek için (sort as string) kullanıyoruz
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
      orderBy: { createdAt: "desc" }, // en son eklenen ürünler en üstte olacak şekilde sıralama
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


// createProduct fonksiyonunu dışarıdan gelen Stripe ID'lerini kabul edecek şekilde genişlettik
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

// Eksik olan Güncelleme fonksiyonunu buraya ekliyoruz
export async function updateProduct(
  id: string,
  data: Partial<CreateProductData> & { imageUrls?: string[]; isActive?: boolean }
): Promise<Product> {

  const { currency, category, ...rest } = data;

// 1. Önce MongoDB'deki mevcut ürünü bul
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new Error(`Product with id ${id} not found.`);
  }

  // Stripe'ı güncellerken kullanacağımız olası yeni ID'ler
  let newStripePriceId = existingProduct.stripePriceId;
  let newStripeProductId = existingProduct.stripeProductId;

  // 2. STRIPE SENKRONİZASYONU
  if (existingProduct.stripeProductId) {
    try {
      const stripeProductUpdateData: any = {};
      
      // İsim, açıklama veya aktiflik değiştiyse Stripe Ürününü güncelle
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

      // 3. FİYAT DEĞİŞTİYSE YENİ STRIPE PRICE OLUŞTUR VE ESKİSİNİ ARŞİVLE
      if (rest.priceCents && rest.priceCents !== existingProduct.priceCents) {
        // Eski fiyatı arşivle
        if (existingProduct.stripePriceId) {
          await stripe.prices.update(existingProduct.stripePriceId, { active: false });
        }
        
        // Yeni fiyat oluştur
        const newPrice = await stripe.prices.create({
          product: existingProduct.stripeProductId,
          unit_amount: rest.priceCents,
          currency: (currency || existingProduct.currency).toLowerCase(),
        });
        
        newStripePriceId = newPrice.id; // DB'ye kaydedilecek yeni Price ID
      }
    } catch (stripeError) {
      console.error(`Stripe update failed for product ${id}:`, stripeError);
      throw new Error("Failed to sync product updates with Stripe."); // Stripe başarısızsa işlemi durdur
    }
  }

  // 4. MONGODB GÜNCELLEMESİ (Stripe Price güncellenmişse DB'ye yazılır)
  const record = await prisma.product.update({
    where: { id },
    data: {
      ...rest,
      stripePriceId: newStripePriceId, // Yeni fiyat ID'sini yazıyoruz
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

// Ürün MongoDB'den silinmeden hemen önce Stripe tarafında arşivleniyor (active: false)
import { stripe } from "@/lib/stripe";



// delete products (Hataları Yutmayan Güvenli Hali)
export async function deleteProduct(id: string): Promise<void> {
  // 1. Ürünü DB'den bul
  const product = await prisma.product.findUnique({ 
    where: { id } 
  });
  
  if (!product) return; // Zaten yoksa çık

  // 2. STRIPE ARŞİVLEME KONTROLÜ
  try {
    if (product.stripePriceId) {
      await stripe.prices.update(product.stripePriceId, { active: false });
    }
    if (product.stripeProductId) {
      await stripe.products.update(product.stripeProductId, { active: false });
    }
  } catch (stripeError) {
    // İnceleyicinin uyarısı: Hataları YUTMA. Eğer Stripe'ta arşivleme patlarsa
    // MongoDB silme işlemine GEÇME, hatayı dışarı fırlat!
    console.error(`Stripe archiving failed for product ${id}. Aborting DB deletion.`, stripeError);
    throw new Error(`Cannot delete product ${id} because Stripe archiving failed.`);
  }

  // 3. SADECE STRIPE BAŞARILIYSA MONGODB'DEN SİL
  await prisma.product.delete({
    where: { id },
  });
}

// delete multiple products
export async function deleteMultipleProducts(ids: string[]): Promise<void> {
  const failedIds: string[] = [];

  for (const id of ids) {
    try {
      // Mevcut Stripe arşivleme ve DB silme mantığını her ürün için sırayla çağırır
      await deleteProduct(id);
    } catch (error) {
      console.error(`Failed to delete product with id ${id} during bulk delete:`, error);
      failedIds.push(id);
    }
  }

// Eğer bazı ürünler silinemezse (örneğin Stripe hatası yüzünden) süreci bildir
  if (failedIds.length > 0) {
    throw new Error(`Failed to delete some products: ${failedIds.join(', ')}`);
  }
}