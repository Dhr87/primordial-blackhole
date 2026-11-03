import { test, expect } from '@playwright/test';

test('el juego carga sin errores de consola y genera captura', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto('/');
  await page.waitForSelector('canvas');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: 'reports/visual/smoke.png' });
  expect(errors).toEqual([]);
});
