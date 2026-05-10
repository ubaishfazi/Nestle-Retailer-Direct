import { test, expect } from '@playwright/test';

test('survey graph view flow', async ({ page }) => {

 
  await page.goto('http://127.0.0.1:8001/login');

  await page.getByRole('textbox', { name: 'Email address' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('admin123');

  await Promise.all([
    page.waitForURL(/dashboard|surveys/i, { timeout: 10000 }),
    page.locator('[data-test="login-button"]').click()
  ]);

  await expect(page).not.toHaveURL(/login/);

 
  await page.getByRole('link', { name: 'Surveys' }).click();

  await expect(page).toHaveURL(/surveys/);

 
  const viewDetails = page.getByRole('link', { name: 'View Details' }).first();

  await expect(viewDetails).toBeVisible({ timeout: 10000 });

  await viewDetails.click();

  await expect(page).toHaveURL(/surveys\/\d+/);

 
  const viewGraphBtn = page.getByRole('button', { name: /view graph/i });

  await expect(viewGraphBtn).toBeVisible();

  await viewGraphBtn.click();

 
  const graph = page.locator('[data-testid="graph"], [data-testid="chart"], canvas').first();

  await expect(graph).toBeVisible();

});