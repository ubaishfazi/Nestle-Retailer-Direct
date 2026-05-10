import { test, expect } from '@playwright/test';

test('retailer responds to active survey', async ({ page }) => {

 
  await page.goto('http://127.0.0.1:8001/login');

  await page.getByRole('textbox', { name: 'Email address' })
    .fill('retailer@example.com');

  await page.getByRole('textbox', { name: 'Password' })
    .fill('Password@123');

  await page.locator('[data-test="login-button"]').click();

 
  await expect(page).not.toHaveURL(/login/, { timeout: 15000 });
  await page.waitForLoadState('networkidle');


  const questionnaire = page.getByRole('link', {
    name: /questionnaire/i
  });

  await expect(questionnaire).toBeVisible({ timeout: 15000 });
  await questionnaire.click();

  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(500);

 
  const survey = page.getByRole('link', {
    name: /survey/i
  }).first();

  await expect(survey).toBeVisible({ timeout: 15000 });

 
  await survey.waitFor({ state: 'attached' });
  await survey.click();

  await expect(page).toHaveURL(/survey/);

  
  const product = page.getByRole('radio', {
    name: /Nestlé Nestomolt 400g/i
  });

  await expect(product).toBeVisible({ timeout: 15000 });
  await product.check();

  
  const submitBtn = page.getByRole('button', {
    name: /submit/i
  });

  await expect(submitBtn).toBeVisible();
  await submitBtn.click();

  
  await expect(
    page.getByText(/success|thank you|submitted/i)
  ).toBeVisible({ timeout: 15000 });

});