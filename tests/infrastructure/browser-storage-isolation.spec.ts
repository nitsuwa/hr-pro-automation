import { test, expect } from '@playwright/test';

/**
 * Read-only HR PRO navigation and disposable browser-isolation verification.
 *
 * Writes only a temporary qa:isolation:* key in two fresh Playwright contexts.
 * Never reads, changes, exports or removes hrpro:* application values.
 *
 * IMPORTANT: This proves localStorage is isolated between these test browser
 * contexts. It does NOT prove HR PRO has no shared server/database or that
 * company-wide mutation tests are safe. Keep the employer-ID test skipped.
 */
test('INVENTORY-STORAGE-ISOLATION | Playwright contexts keep browser data separate', async ({ page, browser }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  const originUrl = page.url();

  const probeKey = `qa:isolation:${Date.now()}`;
  const firstMarker = 'context-one';
  const secondMarker = 'context-two';
  const secondContext = await browser.newContext();

  try {
    // The Playwright page fixture and browser.newContext() are separate.
    const secondPage = await secondContext.newPage();
    await secondPage.goto(originUrl, { waitUntil: 'domcontentloaded' });

    await page.evaluate(([key, value]) => localStorage.setItem(key, value), [probeKey, firstMarker]);
    await expect.poll(
      () => page.evaluate(key => localStorage.getItem(key), probeKey),
      { message: 'First test context should see its temporary marker' },
    ).toBe(firstMarker);

    await expect.poll(
      () => secondPage.evaluate(key => localStorage.getItem(key), probeKey),
      { message: 'A fresh browser context must not inherit the first marker' },
    ).toBeNull();

    await secondPage.evaluate(([key, value]) => localStorage.setItem(key, value), [probeKey, secondMarker]);

    await expect.poll(
      () => page.evaluate(key => localStorage.getItem(key), probeKey),
      { message: 'Changes in the second context must not affect the first' },
    ).toBe(firstMarker);

    await expect.poll(
      () => secondPage.evaluate(key => localStorage.getItem(key), probeKey),
      { message: 'Second context should retain its own temporary marker' },
    ).toBe(secondMarker);
  } finally {
    // Clean only our disposable key; do not touch any hrpro:* keys.
    await page.evaluate(key => localStorage.removeItem(key), probeKey)
      .catch(() => {});
    await secondContext.close();
  }
});
