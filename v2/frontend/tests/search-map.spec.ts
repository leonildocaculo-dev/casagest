import { test, expect } from '@playwright/test';

test.describe('Map Search', () => {
  test('user can search properties by radius on the map', async ({ page }) => {
    await page.goto('/imoveis');
    
    // Wait for map to load
    await expect(page.locator('.leaflet-container')).toBeVisible();

    // Fill search keyword
    await page.fill('input[placeholder*="Pesquisar"]', 'Luanda');
    
    // Fill radius
    const radiusInput = page.locator('input[type="number"]').first();
    if (await radiusInput.isVisible()) {
      await radiusInput.fill('50');
    }
    
    const responsePromise = page.waitForResponse(response => 
      response.url().includes('/api/imoveis') && response.status() === 200
    );
    
    await page.getByRole('button', { name: 'Pesquisar' }).click();
    
    const response = await responsePromise;
    const url = new URL(response.url());
    
    expect(url.searchParams.get('pesquisa')).toBe('Luanda');
  });
});
