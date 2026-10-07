// @ts-nocheck
import { test, expect } from '@playwright/test';

test.describe('Admin - Product Lifecycle', () => {
  const uniqueId = Date.now();
  const testProductName = `ProdInit${uniqueId}`;
  const updatedProductName = `ProdEdit${uniqueId}`;
  const updatedDescription = 'Updated E2E test description.';
  const updatedPrice = '149';
  const updatedStock = '25';
  const validPngBuffer = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
    'base64'
  );

  test('logged in admin user should be able to create, update, and delete a product', async ({ page }) => {
    await page.goto('/admin/products');
    await expect(page).toHaveURL('/admin/products');

    await page.getByRole('link', { name: 'Create product' }).first().click();

    await page.getByLabel('Name').fill(testProductName);
    await page.getByLabel('Description').fill('E2E test product description');
    await page.getByLabel('Price').fill('99');
    await page.getByLabel('Stock').fill('10');

    await page.locator('input[name="images"]').setInputFiles({
      name: 'test-image.png',
      mimeType: 'image/png',
      buffer: validPngBuffer,
    });

    await page.getByRole('button', { name: 'Create product' }).click();

    await expect(page.getByText('Product created')).toBeVisible({ timeout: 15_000 });
    await page.getByRole('link', { name: 'View all products' }).click();
    await expect(page.getByText(testProductName)).toBeVisible({ timeout: 15_000 });

    const productRow = page.locator('tr', { hasText: testProductName });
    await productRow.getByRole('link', { name: 'Edit' }).click();

    await page.getByLabel('Name').fill(updatedProductName);
    await page.getByLabel('Description').fill(updatedDescription);
    await page.getByLabel('Price').fill(updatedPrice);
    await page.getByLabel('Stock').fill(updatedStock);

    await page.getByRole('button', { name: /save changes|save/i }).click();

    await expect(page).toHaveURL(/\/admin\/products/, { timeout: 15_000 });
    const updatedRow = page.locator('tr', { hasText: updatedProductName });
    await expect(updatedRow).toBeVisible({ timeout: 15_000 });


    await updatedRow.getByRole('link', { name: /delete|remove/i }).click();

    await expect(page.getByText('Confirm deletion')).toBeVisible({ timeout: 10_000 });
    await page.getByRole('button', { name: 'Delete product' }).click();

    await expect(page).toHaveURL(/\/admin\/products/, { timeout: 15_000 });
    await expect(page.getByText(updatedProductName)).not.toBeVisible({ timeout: 15_000 });
  });
});
