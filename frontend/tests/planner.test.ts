import { test, expect } from '@playwright/test';

const UNIQUE = Date.now();
const EMAIL = `planner+${UNIQUE}@example.com`;
const PASSWORD = 'TestPass123!';

test.describe('Planner', () => {
  test.beforeEach(async ({ page }) => {
    // Register and land on the planner
    await page.goto('/register');
    await page.fill('[name=email]', EMAIL);
    await page.fill('[name=password]', PASSWORD);
    await page.click('button[type=submit]');
    await page.waitForURL('/');
  });

  test('entering take-home updates the hero card', async ({ page }) => {
    const input = page.locator('.hero-take-home');
    await input.fill('3000');
    await input.dispatchEvent('input');
    await expect(input).toHaveValue('3000');
  });

  test('adding a needs item updates the register subtotal', async ({ page }) => {
    // Open needs register and add a row
    await page.locator('.register-head').first().click();
    await page.locator('.add-row-btn').first().click();

    const labelInput = page.locator('.row-label-input').last();
    const amtInput = page.locator('.row-amt-input').last();
    await labelInput.fill('Rent');
    await amtInput.fill('800');
    await amtInput.dispatchEvent('input');

    await expect(page.locator('.register-head .subtotal').first()).toContainText('800');
  });

  test('auto-save fires after entering data', async ({ page }) => {
    const putRequest = page.waitForRequest(
      (req) => req.url().includes('/api/budget/active') && req.method() === 'PUT',
      { timeout: 5000 }
    );

    const input = page.locator('.hero-take-home');
    await input.fill('2500');
    await input.dispatchEvent('input');

    const req = await putRequest;
    expect(req).toBeTruthy();
  });

  test('saved budget appears in list', async ({ page }) => {
    const saveName = `snapshot-${UNIQUE}`;
    await page.locator('.save-name-input').fill(saveName);
    await page.locator('button:has-text("Save snapshot")').click();

    await expect(page.locator('.save-item-name', { hasText: saveName })).toBeVisible();
  });

  test('gauges render after take-home is entered', async ({ page }) => {
    const input = page.locator('.hero-take-home');
    await input.fill('2000');
    await input.dispatchEvent('input');

    await expect(page.locator('.gauge-card')).toHaveCount(3);
  });
});
