import { test, expect } from '@playwright/test';

const UNIQUE = Date.now();
const EMAIL = `test+${UNIQUE}@example.com`;
const PASSWORD = 'TestPass123!';

test.describe('Auth flows', () => {
  test('register → land on planner', async ({ page }) => {
    await page.goto('/register');
    await page.fill('[name=email]', EMAIL);
    await page.fill('[name=password]', PASSWORD);
    await page.click('button[type=submit]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('budget');
  });

  test('logout → redirected to login', async ({ page }) => {
    // log in first
    await page.goto('/login');
    await page.fill('[name=email]', EMAIL);
    await page.fill('[name=password]', PASSWORD);
    await page.click('button[type=submit]');
    await page.waitForURL('/');

    await page.click('button:has-text("Sign out")');
    await expect(page).toHaveURL('/login');
  });

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name=email]', EMAIL);
    await page.fill('[name=password]', 'wrongpassword');
    await page.click('button[type=submit]');
    await expect(page.locator('.form-error')).toBeVisible();
  });

  test('unauthenticated visit to / redirects to /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login/);
  });
});
