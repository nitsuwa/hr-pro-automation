import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ ONLY — determine whether HR PRO's own overtime/approval UI can
 * support native Setup scenarios SET_097–124 without external LILO data.
 *
 * Never submits approvals, files requests, edits employee data, or captures
 * displayed employee names, dates, amounts, record values or credentials.
 * Records only structure, generic control names and aggregate counts.
 */
test('INVENTORY-OVERTIME | HR PRO Review overtime controls (read-only)', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');

  const results: Array<{
    stage: string;
    route: string;
    headings: string[];
    actions: string[];
    tabs: string[];
    inputs: Array<{ type: string; label: string }>;
    counts: { rows: number; buttons: number; selects: number };
    note?: string;
  }> = [];

  async function capture(stage: string, note?: string) {
    const view = await page.evaluate(() => {
      const visible = (element: Element) => {
        const style = getComputedStyle(element);
        return element.getClientRects().length > 0
          && style.visibility !== 'hidden' && style.display !== 'none';
      };
      const clean = (s: string | null | undefined) =>
        (s ?? '').replace(/\s+/g, ' ').trim().slice(0, 85);
      const list = (selector: string) =>
        [...document.querySelectorAll(selector)].filter(visible);
      const related = (element: HTMLInputElement) =>
        element.labels?.[0]?.textContent || element.getAttribute('aria-label') || '';
      const genericAction = /(?:overtime|approve|reject|pending|review|filing|requests?|status|filter|submit|timesheet|attendance)/i;
      return {
        route: location.pathname,
        headings: list('main h1,main h2,main h3').map(e => clean(e.textContent))
          .filter(text => /review|attendance|overtime|filing|approval|timesheet/i.test(text))
          .slice(0, 16),
        actions: [...new Set(list('main button,[role="main"] button')
          .map(e => clean(e.getAttribute('aria-label') || e.textContent))
          .filter(text => genericAction.test(text)))].slice(0, 40),
        tabs: [...new Set(list('main [role="tab"],main [role="tablist"] button')
          .map(e => clean(e.getAttribute('aria-label') || e.textContent))
          .filter(text => /overtime|approval|filing|review|pending|attendance/i.test(text)))].slice(0, 20),
        inputs: list('main input, main select, main textarea').slice(0, 40).map(el => {
          const input = el as HTMLInputElement;
          return {
            type: clean(input.getAttribute('type') || input.tagName.toLowerCase()),
            label: clean(related(input)),
          };
        }).filter(entry => /overtime|review|approval|status|filter|request/i.test(entry.label)),
        counts: {
          rows: list('main tbody tr').length,
          buttons: list('main button').length,
          selects: list('main select').length,
        },
      };
    });
    results.push({ stage, ...view, ...(note ? { note } : {}) });
  }

  await page.goto('/time-attendance', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('main')).toBeVisible();
  await capture('Review home');

  // Navigate to an Overtime view only if the current UI exposes a clearly
  // named navigation/tab control. Never click action buttons named Approve,
  // Submit, Reject, etc. because those may mutate records.
  const overtimeTab = page.getByRole('tab', { name: /overtime/i });
  const overtimeButton = page.getByRole('button', { name: /^overtime$/i });
  const overtimeLink = page.getByRole('link', { name: /^overtime$/i });
  if (await overtimeTab.count() === 1) {
    await overtimeTab.click();
    await capture('Overtime tab');
  } else if (await overtimeButton.count() === 1) {
    await overtimeButton.click();
    await capture('Overtime button view');
  } else if (await overtimeLink.count() === 1) {
    await overtimeLink.click();
    await capture('Overtime link view');
  } else {
    await capture('Overtime navigation unavailable',
      'No unique Overtime tab/button/link on the Review page. Requires product UI review.');
  }

  const folder = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(folder, { recursive: true });
  writeFileSync(resolve(folder, 'setup-overtime-review-controls.json'), JSON.stringify({
    description: 'Read-only HR PRO Review/Overtime structural inventory, no employee data',
    steps: results,
  }, null, 2));

  expect(results.length, 'At least the Review screen must be inspected').toBeGreaterThanOrEqual(1);
  console.log('Saved qa-artifacts/setup-overtime-review-controls.json');
});
