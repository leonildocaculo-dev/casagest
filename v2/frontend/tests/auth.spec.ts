import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('client can login and view profile', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'cliente@casagest.test');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.getByText('Logout').first()).toBeVisible();
  });
});
