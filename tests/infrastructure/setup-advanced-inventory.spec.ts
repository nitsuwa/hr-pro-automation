import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ-ONLY survey for remaining workbook sections.
 * It opens blank forms or record editors but NEVER enters or saves data.
 * Exports control labels, not input values, names, emails or select options.
 */
test('INVENTORY-V5 | Salary structures, employee editing and department approvals', async ({ page, loginAs }) => {
  test.setTimeout(150_000);
  await loginAs('systemAdmin');

  type RecordShape = { area: string; route?: string; headings?: string[]; controls?: string[]; fields?: object[]; note?: string };
  const panels: RecordShape[] = [];

  async function capture(area: string) {
    const data = await page.evaluate(() => {
      const shown = (e: Element) => {
        const el = e as HTMLElement;
        const css = window.getComputedStyle(el);
        return el.getClientRects().length > 0 && css.display !== 'none' && css.visibility !== 'hidden';
      };
      const tidy = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);
      const elements = (selector: string) => Array.from(document.querySelectorAll(selector)).filter(shown);
      const labels = Array.from(document.querySelectorAll('label'));
      const controlNames = elements('button').map((e) => tidy(e.getAttribute('aria-label') || e.textContent))
        .filter((s) => /^(?:add|new|edit|save|cancel|create|enroll|submit|upload|remove|delete|close|back|structures|salary|allowance|approvers|next)/i.test(s));
      const fields = elements('input,select,textarea').slice(0, 95).map((e) => {
        const item = e as HTMLInputElement;
        const linked = item.id ? labels.find((l) => l.htmlFor === item.id) : undefined;
        const label = item.getAttribute('aria-label') || linked?.firstChild?.textContent || item.closest('label')?.firstChild?.textContent;
        return {
          tag: item.tagName.toLowerCase(),
          type: item.getAttribute('type') || '',
          label: tidy(label),
          placeholder: tidy(item.getAttribute('placeholder')),
          required: item.required,
        };
      });
      const headings = elements('h1,h2,h3').map((e) => tidy(e.textContent))
        .filter((s) => /^(?:Smart Pay|Salary|Structures|Edit|Employee|Department|Approvers|Add|Allowance)/i.test(s));
      return {
        route: location.pathname,
        headings: [...new Set(headings)].slice(0, 30),
        controls: [...new Set(controlNames)].slice(0, 80),
        fields,
      };
    });
    panels.push({ area, ...data });
  }

  async function stage(area: string, action: () => Promise<void>) {
    try {
      await action();
      await capture(area);
    } catch (error) {
      panels.push({ area, note: String(error).slice(0, 200) });
    }
  }

  await stage('Smart Pay > Structures catalog', async () => {
    await page.goto('/payroll-value', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Structures', exact: true }).first().click();
    // Two 'Structures' buttons may exist: top navigation and inner catalog tab.
    const all = page.getByRole('button', { name: 'Structures', exact: true });
    await all.last().click();
  });

  await stage('Smart Pay > New salary structure blank form', async () => {
    const add = page.getByRole('button', { name: /(?:add|new|create)\s+(?:salary\s+)?structure/i }).first();
    await expect(add, 'Look for Add/New/Create Salary Structure action').toBeVisible();
    await add.click();
  });

  await stage('Employee editor access / record fields', async () => {
    await page.goto('/employees', { waitUntil: 'domcontentloaded' });
    const editInList = page.getByRole('button', { name: /edit employee|^edit$/i });
    if (await editInList.count()) {
      await editInList.first().click();
    } else {
      const row = page.getByRole('row').filter({ has: page.getByRole('cell') }).nth(1);
      await expect(row, 'Employee list must contain a selectable record').toBeVisible();
      await row.click();
      const editDetails = page.getByRole('button', { name: /edit employee|^edit$/i });
      if (await editDetails.count() && await editDetails.first().isVisible()) {
        await editDetails.first().click();
      }
    }
  });

  await stage('Department approvers editor', async () => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Departments', exact: true }).click();
    const first = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'Approvers', exact: true }) }).first();
    await first.getByRole('button', { name: 'Approvers', exact: true }).click();
  });

  const out = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(out, { recursive: true });
  writeFileSync(resolve(out, 'setup-advanced-inventory.json'), JSON.stringify({
    description: 'Read-only controls for salary structures, employee record edit and department approvers; no entered values',
    createdAt: new Date().toISOString(),
    panels,
  }, null, 2));

  expect(panels.length).toBe(4);
  console.log('Saved: qa-artifacts/setup-advanced-inventory.json');
  console.log(panels.map((p) => `${p.area}: ${p.note ? 'NEEDS REVIEW' : 'CAPTURED'}`).join('\n'));
});
