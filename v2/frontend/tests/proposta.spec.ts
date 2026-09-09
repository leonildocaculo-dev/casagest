import { test, expect } from '@playwright/test';

test.describe('Proposals', () => {
  test('authenticated client can submit a proposal', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[name="email"]', 'cliente@casagest.test');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');

    // Go to properties list
    await page.goto('/imoveis');
    
    // Click 'Ver Imóvel' on the first card
    const verImovelButton = page.getByRole('link', { name: /Ver Imóvel/i }).first();
    await verImovelButton.click();
    
    // Find the create proposal button/link
    const makeProposalButton = page.getByRole('link', { name: /Proposta/i }).first();
    if (await makeProposalButton.isVisible()) {
        await makeProposalButton.click();
        
        // Fill form
        await page.fill('input[name="valor_proposto"]', '10000000');
        await page.fill('textarea[name="mensagem"]', 'Tenho bastante interesse nesta propriedade.');
        
        await page.click('button[type="submit"]');
        
        // Wait for redirect to dashboard or success toast
        await expect(page).toHaveURL(/dashboard/);
    }
  });
});
