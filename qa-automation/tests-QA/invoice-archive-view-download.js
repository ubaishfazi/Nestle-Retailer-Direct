// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Invoice Archive', () => {
  test('views and downloads an archived invoice', async ({ page }) => {
    const email = process.env.TEST_RETAILER_EMAIL || 'retailer@example.com';
    const password = process.env.TEST_RETAILER_PASSWORD || 'Password@123';

    await page.goto('/login');
    await page.locator('input[name="email"], input[type="email"], #email').first().fill(email);
    await page.locator('input[name="password"], input[type="password"], #password').first().fill(password);
    await page.getByRole('button', { name: /log in|sign in|login/i }).click();

    
    const loginHeading = page.getByRole('heading', { name: /log in to your account/i });
    await Promise.race([
      page
        .waitForURL((url) => !url.pathname.endsWith('/login'), { timeout: 10000 })
        .catch(() => null),
      expect(loginHeading).toBeHidden({ timeout: 10000 }).catch(() => null),
    ]);

   
    const stillOnLogin = await loginHeading.isVisible().catch(() => false);
    expect(
      stillOnLogin,
      'Login did not succeed. Set TEST_RETAILER_EMAIL and TEST_RETAILER_PASSWORD to valid account credentials.'
    ).toBeFalsy();

    const archivePathCandidates = [process.env.INVOICE_ARCHIVE_PATH, '/invoices'];

    let archiveReached = false;
    for (const route of archivePathCandidates) {
      if (!route) continue;
      const response = await page.goto(route);
      const status = response?.status() ?? 0;
      const notFoundVisible = await page.getByText(/404|not found/i).first().isVisible().catch(() => false);
      if (status !== 404 && !notFoundVisible) {
        archiveReached = true;
        break;
      }
    }

    expect(
      archiveReached,
      'Invoice archive route not found. Set INVOICE_ARCHIVE_PATH or use /invoices.'
    ).toBeTruthy();

    await expect(page.getByRole('heading', { name: /digital invoice archive/i })).toBeVisible();

    const emptyState = page.getByText(/no invoices found/i);
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    expect(
      hasEmptyState,
      'No invoices available for this account. Approve an order first, then re-run this test.'
    ).toBeFalsy();

    const firstInvoiceLabel = page.getByText(/INV-\d{4}-\d+/).first();
    await expect(firstInvoiceLabel).toBeVisible();
    await firstInvoiceLabel.click();

    const viewButton = page.getByRole('button', { name: /^view$/i }).first();
    const downloadButton = page.getByRole('button', { name: /^download$/i }).first();
    await expect(viewButton).toBeVisible();
    await expect(downloadButton).toBeVisible();


    const [viewPopup] = await Promise.all([page.waitForEvent('popup'), viewButton.click()]);
    expect(viewPopup.isClosed()).toBeFalsy();
    const viewPopupUrl = viewPopup.url();
    if (viewPopupUrl && viewPopupUrl !== ':' && viewPopupUrl !== 'about:blank') {
      await expect(viewPopupUrl).toMatch(/\/invoices\/.*\/view/i);
    }
    if (!viewPopup.isClosed()) await viewPopup.close();

  
    const [downloadPopup] = await Promise.all([page.waitForEvent('popup'), downloadButton.click()]);
    expect(downloadPopup.isClosed()).toBeFalsy();
    const downloadPopupUrl = downloadPopup.url();
    if (
      downloadPopupUrl &&
      downloadPopupUrl !== ':' &&
      downloadPopupUrl !== 'about:blank'
    ) {
      await expect(downloadPopupUrl).toMatch(/\/invoices\/.*\/download/i);
    }
    if (!downloadPopup.isClosed()) await downloadPopup.close();
  });
});
