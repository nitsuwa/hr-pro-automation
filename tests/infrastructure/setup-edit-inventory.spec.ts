import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Survey the EDIT screens for four catalog types WITHOUT changing any value.
 * It does not click Save, Remove, Delete, Confirm, or Reset.
 * No current form values or row names are recorded.
 */
test('INVENTORY-V4 | Catalog edit controls (read-only)', async ({ page, loginAs }) => {
  test.setTimeout(120_000);
  await loginAs('systemAdmin');

  type Panel = { name: string; route?: string; headings?: string[]; buttons?: string[]; fields?: object[]; note?: string };
  const panels: Panel[] = [];

  const capture = async (name: string) => {
    const detail = await page.evaluate(() => {
      const visible = (el: Element) => {
        const element = el as HTMLElement;
        const css = window.getComputedStyle(element);
        return element.getClientRects().length > 0 && css.visibility !== 'hidden' && css.display !== 'none';
      };
      const clean = (t: string | null | undefined) => (t ?? '').replace(/\s+/g, ' ').trim().slice(0, 110);
      const elements = (query: string) => [...document.querySelectorAll(query)].filter(visible);
      const unique = (values: string[]) => [...new Set(values.filter(Boolean))];
      const labels = [...document.querySelectorAll('label')];
      const fields = elements('input,textarea,select').map((node) => {
        const item = node as HTMLInputElement;
        const found = item.id ? labels.find((label) => label.htmlFor === item.id) : undefined;
        const directLabel = item.getAttribute('aria-label') || found?.firstChild?.textContent || item.closest('label')?.firstChild?.textContent;
        return {
          tag: item.tagName.toLowerCase(),
          type: item.getAttribute('type') ?? '',
          label: clean(directLabel),
          placeholder: clean(item.getAttribute('placeholder')),
          required: item.required,
        };
      });
      return {
        route: location.pathname,
        headings: unique(elements('h1,h2,h3,[role="dialog"] h4').map((e) => clean(e.textContent))).slice(0, 40),
        buttons: unique(elements('button').map((e) => clean(e.getAttribute('aria-label') || e.textContent))).slice(0, 70),
        fields: fields.slice(0, 60),
      };
    });
    panels.push({ name, ...detail });
  };

  async function section(tab: string) {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: tab, exact: true }).first().click();
  }

  for (const tab of ['Departments', 'Job Positions', 'Work Locations', 'General']) {
    try {
      await section(tab);
      const edit = page.getByRole('row').filter({ has: page.getByRole('button', { name: 'Edit', exact: true }) })
        .first().getByRole('button', { name: 'Edit', exact: true });
      await expect(edit).toBeVisible();
      await edit.click(); // open edit form only; do not save
      await capture(`${tab} > Edit existing (no changes)`);
    } catch (err) {
      panels.push({ name: `${tab} > Edit`, note: String(err).slice(0, 220) });
    }
  }

  const folder = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(folder, { recursive: true });
  writeFileSync(resolve(folder, 'setup-edit-inventory.json'), JSON.stringify({
    description: 'Read-only catalog editing control inventory, labels only; no values or names',
    generated: new Date().toISOString(),
    panels,
  }, null, 2));

  expect(panels).toHaveLength(4);
  console.log('Saved qa-artifacts/setup-edit-inventory.json');
  console.log(panels.map((p) => `${p.name}: ${p.note ? 'NEEDS REVIEW' : 'CAPTURED'}`).join('\n'));
});
