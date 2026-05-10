/**
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('kavishkasenith@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('SENith@0248');
  await page.locator('[data-test="login-button"]').click();
  await page.getByRole('link', { name: 'Invoices View invoices' }).click();
  await page.getByText('INVINV-2026-000001Order #1May 08, 2026DetailsDistributorjohn marvinItemsNestlé').click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('button', { name: 'View' }).nth(1).click();
  const page1 = await page1Promise;
  const page2Promise = page.waitForEvent('popup');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download' }).nth(1).click();
  const page2 = await page2Promise;
  const download = await downloadPromise;
  await page.goto('http://127.0.0.1:8000/invoices');
});
/*
test('test2', async ({ page }) => {
  await page.goto('http://127.0.0.1:8000/login');
  await page.getByRole('textbox', { name: 'Email address' }).fill('john@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password');
  await page.getByRole('button', { name: 'Show password' }).click();
  await page.waitForLoadState('networkidle');
  await page.getByRole('link', { name: /Incoming Orders/ }).click({ timeout: 10000 });
  await page.goto('http://127.0.0.1:8000/distributor/incoming-orders');
  await page.getByRole('button', { name: 'Approve', exact: true }).click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Invoice' }).first().click();
  const page1 = await page1Promise;
});

/*
import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://127.0.0.1:8001/login');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('admin@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('admin123');
  await page.locator('[data-test="login-button"]').click();
  await page.getByRole('link', { name: 'Surveys' }).click();
  await page.getByRole('link', { name: 'Create Survey' }).click();
  await page.getByRole('textbox', { name: 'e.g., Product Demand Survey' }).click();
  await page.getByRole('textbox', { name: 'e.g., Product Demand Survey' }).fill('sddddddddd');
  await page.getByRole('textbox').nth(1).fill('2026-05-07');
  await page.getByRole('textbox').nth(2).fill('2026-05-22');
  await page.getByRole('textbox', { name: 'Enter your question' }).click();
  await page.getByRole('textbox', { name: 'Enter your question' }).fill('ssssssssss');
  await page.goto('http://127.0.0.1:8001/surveys/create');
  await page.getByRole('button', { name: 'Save Survey' }).click();
  await page.goto('http://                        
  
});
*/