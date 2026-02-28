import { expect, test } from '@playwright/test';

test('browser ESM compat smoke', async ({ page }) => {
  await page.goto('/tests/compat/browser/index.html');
  const result = await page.locator('#result').textContent({ timeout: 5000 });
  expect(result).toBe('PASS');
});
