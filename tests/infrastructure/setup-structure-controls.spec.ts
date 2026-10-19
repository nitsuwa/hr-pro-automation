import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Read-only inspection for salary-structure rule assignment and department
 * approvers. Opens an unsaved structure form; does not fill, save, remove,
 * delete, or mutate any existing HR PRO records.
 */
test('INVENTORY-V6 | Salary structure rule controls and approval selectors', async ({ page, loginAs }) => {
  test.setTimeout(150_000);
  await loginAs('systemAdmin');

  type Panel = {
    area: string;
    headings?: string[];
    buttons?: string[];
    inputs?: Array<{ tag: string; type: string; label: string; placeholder: string; required: boolean }>;
    note?: string;
  };
  const panels: Panel[] = [];

  async function capture(area: string) {
    const result = await page.evaluate(() => {
      const visible = (el: Element) => {
        const x = el as HTMLElement;
        const css = getComputedStyle(x);
        return x.getClientRects().length > 0 && css.visibility !== 'hidden' && css.display !== 'none';
      };
      const text = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, 110);
      const all = (selector: string) => Array.from(document.querySelectorAll(selector)).filter(visible);
      const headings = all('main h1,main h2,main h3,[role="dialog"] h2').map((e) => text(e.textContent));
      const buttons = all('main button,main [role="button"],main [role="tab"]').map((e) => text(e.getAttribute('aria-label') || e.textContent));
      const labels = Array.from(document.querySelectorAll('label'));
      const inputs = all('main input,main select,main textarea,main [role="combobox"]').map((e) => {
        const input = e as HTMLInputElement;
        const connected = input.id ? labels.find((label) => label.htmlFor === input.id) : undefined;
        return {
          tag: input.tagName.toLowerCase(),
          type: input.getAttribute('type') || '',
          label: text(input.getAttribute('aria-label') || connected?.textContent || input.closest('label')?.textContent),
          placeholder: text(input.getAttribute('placeholder')),
          required: input.required ?? false,
        };
      });
      return {
        headings: [...new Set(headings.filter(Boolean))].slice(0, 60),
        buttons: [...new Set(buttons.filter(Boolean))].slice(0, 130),
        inputs: inputs.slice(0, 100),
      };
    });
    panels.push({ area, ...result });
  }

  async function attempt(area: string, action: () => Promise<void>) {
    try {
      await action();
      await capture(area);
    } catch (error) {
      panels.push({ area, note: String(error).slice(0, 240) });
    }
  }

  await attempt('Salary Structures — blank Add Structure form', async () => {
    await page.goto('/payroll-value', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Structures', exact: true }).first().click();
    await page.getByRole('button', { name: 'Structures', exact: true }).last().click();
    await page.getByRole('button', { name: /(?:add|new|create)\s+(?:salary\s+)?structure/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Add Structure' })).toBeVisible();
  });

  await attempt('Salary Structures — expanded rule selection', async () => {
    await expect(page.getByRole('heading', { name: 'Add Structure' })).toBeVisible();
    const expandable = page.getByRole('button', { name: /Additions \(Non-Taxable\)/i }).first();
    await expect(expandable).toBeVisible();
    await expandable.click(); // expands unsaved form group only
  });

  await attempt('Department Approvers — editor controls', async () => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Departments', exact: true }).click();
    await page.getByRole('row').filter({
      has: page.getByRole('button', { name: 'Approvers', exact: true }),
    }).first().getByRole('button', { name: 'Approvers', exact: true }).click();
    await expect(page.getByRole('heading', { name: /^Approvers —/ })).toBeVisible();
  });

  const dir = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'setup-structure-controls.json'), JSON.stringify({
    description: 'Read-only control inventory; no entered values or employee data extracted',
    capturedAt: new Date().toISOString(),
    panels,
  }, null, 2));
  expect(panels).toHaveLength(3);
  console.log('Saved qa-artifacts/setup-structure-controls.json');
  console.log(panels.map((p) => `${p.area}: ${p.note ? 'NEEDS REVIEW' : 'CAPTURED'}`).join('\n'));
});
