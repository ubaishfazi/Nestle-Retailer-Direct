// @ts-check
import { test, expect } from '@playwright/test';

test.describe('Demand Survey Creation', () => {

  test('admin creates and publishes a survey', async ({ page }) => {

    const email = process.env.TEST_ADMIN_EMAIL || 'admin@gmail.com';
    const password = process.env.TEST_ADMIN_PASSWORD || 'admin123';

    await page.goto('http://127.0.0.1:8001/login');

    await page.getByRole('textbox', { name: /email address/i }).fill(email);
    await page.getByRole('textbox', { name: /password/i }).fill(password);

    await page.locator('[data-test="login-button"]').click();

    await expect(page).toHaveURL(/dashboard/);

    await page.getByRole('link', { name: /surveys/i }).click();
    await page.getByRole('link', { name: /create survey/i }).click();

    await expect(page).toHaveURL(/surveys\/create/);

   
    const surveyTitle = `Survey ${Date.now()}`;

    await page.getByRole('textbox', {
      name: /product demand survey/i
    }).fill(surveyTitle);

    await page.getByRole('textbox').nth(1).fill('2026-05-07');
    await page.getByRole('textbox').nth(2).fill('2026-05-22');

    await page.getByRole('textbox', {
      name: /enter your question/i
    }).fill('What product demand is highest?');

    await page.getByRole('button', { name: 'Save Survey' }).click();

   
    await expect(page).toHaveURL(/surveys|create/);

    await page.goto('http://127.0.0.1:8001/surveys');

    await expect(
      page.getByText(surveyTitle)
    ).toBeVisible();

  });

});