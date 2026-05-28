import { test, expect } from '@playwright/test';

test('corporate site is alive', async ({ page }) => {
  // In CI, we would point to the preview URL or a local dev server
  // For now, this is a placeholder for global flow validation
  await page.goto('http://localhost:4321');
  await expect(page).toHaveTitle(/Goy/);
});
