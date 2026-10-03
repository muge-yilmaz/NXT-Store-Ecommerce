import {
  createProductFormSchema,
  createProductDataSchema,
  productCategorySchema,
} from "@/lib/validation/product";
import { Currency } from "@/types/currency";
import { ProductCategory } from "@/types/product";

jest.mock("server-only", () => ({}));

describe("productValidation", () => {
  describe("productCategorySchema", () => {
    it("should validate a valid category", () => {
      const validCategory = Object.values(ProductCategory)[0];
      const result = productCategorySchema.safeParse(validCategory);

      expect(result.success).toBe(true);
    });
  });

  describe("createProductFormSchema", () => {
    const validFormData = {
      name: "Test Product 2",
      description: "This is a test product.",
      price: "199.99",
      currency: Currency.TRY || "TRY",
      category: Object.values(ProductCategory)[0],
      stock: "15",
      isActive: true,
    };

    it("should validate a valid product form input", () => {
      const result = createProductFormSchema.safeParse(validFormData);

      expect(result.success).toBe(true);
    });

    it("should fail validation for an invalid price", () => {
      const invalidPriceData = { ...validFormData, price: "invalid-price" };
      const result = createProductFormSchema.safeParse(invalidPriceData);

      expect(result.success).toBe(false);
    });

    it("should fail validation for a negative stock", () => {
      const invalidStockData = { ...validFormData, stock: "-5" };
      const result = createProductFormSchema.safeParse(invalidStockData);

      expect(result.success).toBe(false);
    });
  });

  describe("createProductDataSchema", () => {
    it("should transform valid form input to database format", () => {
      const validFormData = {
        name: "Test Product 3",
        description: "This is a test product.",
        price: "359.99",
        currency: Currency.TRY || "TRY",
        category: Object.values(ProductCategory)[0],
        stock: "20",
        isActive: true,
      };

      const result = createProductDataSchema.safeParse(validFormData);
      expect(result.success).toBe(true);

      if (result.success) {
        expect(result.data.priceCents).toBe(35999);
        expect(result.data.stock).toBe(20);
        expect(result.data.currency).toBe(validFormData.currency);
        expect(result.data.category).toBe(validFormData.category);
      }
    });
  });
});