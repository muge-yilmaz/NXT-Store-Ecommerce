// @ts-nocheck
import { test, expect, type Page } from '@playwright/test';

test.describe('Standard User Pages Access', () => {

  test('logged in standard user should be able to view, update profile, and persist changes', async ({ page }: { page: Page }) => {
    // Benzersiz bir test metni oluşturuyoruz
    const uniqueString = `Test Adresi ${Date.now()}`;

    // 1. Profil sayfasına git ve başlığı doğrula
    await page.goto('/profile');
    await expect(page).toHaveURL('/profile');
    await expect(page.getByRole('heading', { name: /account settings|profile/i })).toBeVisible();

    // 2. Formdaki metin alanını güncelle
    const firstInput = page.getByRole('textbox').first();
    await firstInput.fill(uniqueString);

    // 3. Kaydet butonuna bas
    await page.getByRole('button', { name: /save|update/i }).click();

    // Ağ işlemlerinin bitmesini bekle
    await page.waitForLoadState('networkidle');

    // 4. Sayfayı yenile
    await page.reload();

    // 5. Kaydedilen değerin sayfada kaldığını doğrula
    await expect(firstInput).toHaveValue(uniqueString);
  });

  test('logged in standard user should be redirected or forbidden when accessing admin routes', async ({ page }: { page: Page }) => {
    // Admin yetkisi gerektiren sayfaya gitmeyi dene
    await page.goto('/admin/products');
    
    // Yönlendirildiğini doğrula
    await expect(page).not.toHaveURL('/admin/products');
  });

});