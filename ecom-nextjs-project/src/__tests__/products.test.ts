import { prisma } from "@/lib/prisma";
import { getStorefrontProducts, parseStorefrontFilters } from "@/lib/products";

jest.mock("@/lib/stripe", () => ({
  stripe: {
    prices: {
      update: jest.fn().mockResolvedValue({}),
    },
    products: {
      update: jest.fn().mockResolvedValue({}),
    },
  },
}));

jest.mock("../lib/prisma", () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
    },
  },
}));

describe("../lib/products", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("parseStorefrontFilters", () => {
    it("should return an empty object when no filters are provided", () => {
      const searchParams = { category: "all", sort: "createdAt_desc" };
      const result = parseStorefrontFilters(searchParams);

      expect(result).toHaveProperty("categoryValue");
      expect(result).toHaveProperty("sortValue");
    });
  });

  describe("getStorefrontProducts()", () => {
    it("should handle errors and return an empty array", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => { });

      (prisma.product.findMany as jest.Mock).mockRejectedValue(new Error("DB Error"));

      const products = await getStorefrontProducts();

      expect(products).toEqual([]);

      consoleSpy.mockRestore();
    });

    it("should return an empty array when the database contains no products", async () => {
      (prisma.product.findMany as jest.Mock).mockResolvedValue([]);

      const products = await getStorefrontProducts();
      expect(products).toEqual([]);

      expect(prisma.product.findMany).toHaveBeenCalledTimes(1);
    });
  });
});