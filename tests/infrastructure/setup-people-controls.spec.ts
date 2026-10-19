import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ-ONLY: inspect Department Approver selectors and an Employee detail page.
 * Opens dialogs/menus only. Does not fill, save, enroll, edit data or remove.
 * No names, emails, salaries, current field values, or employee IDs recorded.
 */
test('INVENTORY-V8 | Approver selectors and Employee edit form', async ({ page, loginAs }) => {
  test.setTimeout(150_000);
  await loginAs('systemAdmin');

  type Field = { tag: string; role: string; type: string; label: string; placeholder: string };
  type Area = {
    area: string;
    headings?: string[];
    actionLabels?: string[];
    fields?: Field[];
    anonymousChoices?: Array<{ tag: string; role: string; isDefault: boolean; isNone: boolean }>;
    note?: string;
  };
  const areas: Area[] = [];
  const tidy = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, 90);

  async function capture(area: string) {
    const info = await page.evaluate(() => {
      const shown = (e: Element) => {
        const node = e as HTMLElement;
        const style = window.getComputedStyle(node);
        return node.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const clean = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, 90);
      const nodes = (selector: string) => Array.from(document.querySelectorAll(selector)).filter(shown);
      const labels = Array.from(document.querySelectorAll('label'));
      return {
        // Do not include heading texts containing employee names from details pages.
        // Return category tokens only: profile headings may contain full names.
        headings: nodes('h1,h2,h3').map(e => clean(e.textContent))
          .map(x => {
            if (/^Approvers/i.test(x)) return 'Approvers';
            if (/^Employees$/i.test(x)) return 'Employees';
            if (/^Edit/i.test(x)) return 'Edit';
            if (/^Compensation/i.test(x)) return 'Compensation';
            if (/^Personal/i.test(x)) return 'Personal';
            if (/^Employment/i.test(x)) return 'Employment';
            if (/^Profile/i.test(x)) return 'Profile';
            return '';
          }).filter(Boolean).slice(0, 40),
        actionLabels: [...new Set(nodes('button,[role="tab"]').map(e => clean(e.getAttribute('aria-label') || e.textContent))
          .filter(x => /^(?:Edit|Save|Cancel|Delete|Remove|Archive|Approvers|Create|User account|Personal|Compensation|Employment|Settings|Access|— None|— Company default)/i.test(x))
          .map(x => /(^— None|^— Company default)/.test(x) ? x : x.slice(0, 75)))].slice(0, 75),
        fields: nodes('input,select,textarea').slice(0, 90).map(e => {
          const field = e as HTMLInputElement;
          const linked = field.id ? labels.find(l => l.htmlFor === field.id) : undefined;
          const label = field.getAttribute('aria-label') || linked?.firstChild?.textContent || field.closest('label')?.firstChild?.textContent;
          return {
            tag: field.tagName.toLowerCase(),
            role: field.getAttribute('role') || '',
            type: field.getAttribute('type') || '',
            label: clean(label),
            placeholder: clean(field.getAttribute('placeholder')),
          };
        }),
      };
    });
    areas.push({ area, ...info });
  }

  async function stage(area: string, callback: () => Promise<void>) {
    try {
      await callback();
      await capture(area);
    } catch (error) {
      areas.push({ area, note: tidy(String(error)) });
    }
  }

  await stage('Department Approvers open', async () => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Departments', exact: true }).click();
    await page.getByRole('row').filter({
      has: page.getByRole('button', { name: 'Approvers', exact: true }),
    }).first().getByRole('button', { name: 'Approvers', exact: true }).click();
    await expect(page.getByRole('heading', { name: /^Approvers —/ })).toBeVisible();
  });

  await stage('Department Approvers dropdown opened — option structure only', async () => {
    const dropdown = page.getByRole('button', { name: /— None —|— Company default —/ }).first();
    await expect(dropdown).toBeVisible();
    await dropdown.click();
    const options = await page.evaluate(() => {
      const visible = (e: Element) => {
        const node = e as HTMLElement;
        return node.getClientRects().length > 0 && getComputedStyle(node).visibility !== 'hidden';
      };
      const candidateNodes = [...document.querySelectorAll(
        '[role="option"],[role="menuitem"],[role="listbox"] button,[role="menu"] button,li button'
      )].filter(visible);
      return candidateNodes.slice(0, 50).map(e => ({
        tag: e.tagName.toLowerCase(),
        role: e.getAttribute('role') || '',
        isDefault: /company default/i.test(e.textContent || ''),
        isNone: /^—?\s*none/i.test((e.textContent || '').trim()),
      }));
    });
    areas.push({ area: 'Approvers selectable option structure', anonymousChoices: options });
  });

  await stage('Employee detail page', async () => {
    await page.goto('/employees', { waitUntil: 'domcontentloaded' });
    const employeeLink = page.getByRole('table').getByRole('link').first();
    await expect(employeeLink).toBeVisible();
    await employeeLink.click(); // opens seeded employee details; does not change data
  });

  await stage('Employee edit form (read-only)', async () => {
    const edit = page.getByRole('button', { name: /^Edit(?: Employee| Details| Information)?$/i }).first();
    await expect(edit, 'Employee detail should expose an edit action').toBeVisible();
    await edit.click(); // opens form only, no changes
  });

  const dir = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'setup-people-controls.json'), JSON.stringify({
    description: 'Read-only metadata for approver dropdown and employee edit UI; no field values captured',
    capturedAt: new Date().toISOString(),
    areas,
  }, null, 2));
  expect(areas.length).toBeGreaterThanOrEqual(4);
  console.log('Saved qa-artifacts/setup-people-controls.json');
  console.log(areas.map(a => a.area + ': ' + (a.note ? 'NEEDS REVIEW' : 'CAPTURED')).join('\n'));
});
