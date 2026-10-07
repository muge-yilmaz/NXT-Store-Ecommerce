// @ts-nocheck
import { test, expect, type Page } from '@playwright/test';

test.describe('Standard User Pages Access', () => {

  test('logged in standard user should be able to view, update profile, and persist changes', async ({ page }: { page: Page }) => {
    const uniqueString = `Testing Address ${Date.now()}`;

    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: /account settings|profile/i })).toBeVisible();

    const firstInput = page.getByRole('textbox').first();
    await firstInput.fill(uniqueString);

    await page.getByRole('button', { name: /save|update/i }).click();

    await page.waitForLoadState('networkidle');

    await page.reload();

    await expect(firstInput).toHaveValue(uniqueString);
  });

  test('logged in standard user should be redirected or forbidden when accessing admin routes', async ({ page }: { page: Page }) => {
    await page.goto('/admin/products');

    await expect(page).not.toHaveURL('/admin/products');
  });

});