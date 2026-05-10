// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Invoice Auto Generation', () => {

  test('creates invoice after order approval', async ({ page }) => {

    const email = process.env.TEST_ADMIN_EMAIL || 'admin@gmail.com';
    const password = process.env.TEST_ADMIN_PASSWORD || 'admin123';

    await page.goto('/login');

    await page.locator('input[name="email"], input[type="email"]').first().fill(email);
    await page.locator('input[name="password"], input[type="password"]').first().fill(password);

    await page.getByRole('button', { name: /log in|sign in|login/i }).click();

   
    await expect(page).toHaveURL(/dashboard/);

   
    await page.goto('/dashboard/user-approvals');

   
    const approveButton = page.locator('button').filter({ hasText: /approve/i }).first();

    // If no orders exist → fail clearly
    await expect(approveButton).toBeVisible({ timeout: 10000 });

    // -----------------------------
    // 4. APPROVE ORDER
    // -----------------------------
    await approveButton.click();

    // -----------------------------
    // 5. VERIFY APPROVAL
    // -----------------------------
   // -----------------------------
// 5. VERIFY APPROVAL
// -----------------------------
   await expect(approveButton).toHaveText(/approved/i);

    // -----------------------------
    // 6. GO TO INVOICES
    // -----------------------------
    await page.goto('/invoices');

    // -----------------------------
    // 7. VERIFY INVOICE EXISTS
    // -----------------------------
    const invoiceRow = page.locator('tr').filter({ hasText: /INV-/ }).first();

    await expect(invoiceRow).toBeVisible({ timeout: 10000 });

    // -----------------------------
    // 8. OPEN INVOICE
    // -----------------------------
    await invoiceRow.locator('a').first().click();

    // -----------------------------
    // 9. VERIFY INVOICE DETAILS
    // -----------------------------
    await expect(page.getByText(/invoice number/i)).toBeVisible();
    await expect(page.getByText(/order/i)).toBeVisible();
    await expect(page.getByText(/total/i)).toBeVisible();

  });

});

