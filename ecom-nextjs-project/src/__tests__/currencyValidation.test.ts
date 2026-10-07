import { currencySchema } from "@/lib/validation/currency";
import { Currency } from "@/types/currency";

describe('currencySchema (Zod Validation)', () => {
  it('should validate a valid currency', () => {
    const validCurrency = Currency.USD;
    const result = currencySchema.safeParse(validCurrency);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(Currency.USD);
    }
  });

  it('should invalidate an invalid currency', () => {
    const invalidCurrency = "BTC";
    const result = currencySchema.safeParse(invalidCurrency);
    expect(result.success).toBe(false);
  });
});
