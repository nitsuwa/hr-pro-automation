import { test, expect, type Page } from '@playwright/test';
import { LoginPage } from '../../playwright/pages/login.page';
import { DEMO_ACCOUNTS } from '../../playwright/data/demo-accounts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Read-only inspection: navigate or open empty forms and dialogs.
 * NEVER enter values, save, delete, reset or confirm.
 * Captures only headings, button labels and field metadata (not field values).
 * Used for writing complete Excel-based assertions without guessing UI controls.
 */
test('INVENTORY-V3 | Capture add forms for holidays, leave, payroll and imports', async ({ page }) => {
  test.setTimeout(180_000);
  const login = new LoginPage(page);
  await login.loginAsDemo(DEMO_ACCOUNTS.systemAdmin.label);

  type Entry = {
    area: string;
    path?: string;
    headings?: string[];
    buttons?: string[];
    fields?: Array<{ tag: string; type: string; label: string; placeholder: string; required: boolean }>;
    note?: string;
  };

  const output: Entry[] = [];
  const tidy = (v: string | null | undefined) => (v ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);

  async function capture(area: string) {
    const data = await page.evaluate(() => {
      const visible = (e: Element) => {
        const html = e as HTMLElement;
        const style = window.getComputedStyle(html);
        return html.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const clean = (v: string | null | undefined) => (v ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);
      const matching = (selector: string) => Array.from(document.querySelectorAll(selector)).filter(visible);
      const uniq = (a: string[]) => Array.from(new Set(a.filter(Boolean)));
      const labels = Array.from(document.querySelectorAll('label'));
      return {
        path: location.pathname,
        headings: uniq(matching('h1,h2,h3,[role="dialog"] h4').map((e) => clean(e.textContent))).slice(0, 55),
        buttons: uniq(matching('button,[role="tab"],[role="button"]').map((e) => clean(e.getAttribute('aria-label') || e.textContent))).slice(0, 120),
        fields: matching('input,textarea,select').slice(0, 90).map((e) => {
          const el = e as HTMLInputElement;
          const linked = el.id ? labels.find((l) => l.htmlFor === el.id) : undefined;
          const nesting = el.closest('label');
          // firstChild avoids including entire select option lists or user names.
          const label = el.getAttribute('aria-label') || linked?.firstChild?.textContent || nesting?.firstChild?.textContent;
          return {
            tag: el.tagName.toLowerCase(),
            type: el.getAttribute('type') ?? '',
            label: clean(label),
            placeholder: clean(el.getAttribute('placeholder')),
            required: el.required,
          };
        }),
      };
    });
    output.push({ area, ...data });
  }

  async function setupTab(tab: string) {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    const section = page.getByRole('button', { name: tab, exact: true }).first();
    await expect(section).toBeVisible();
    await section.click();
  }

  async function stage(name: string, action: () => Promise<void>) {
    try {
      await action();
      await capture(name);
    } catch (err) {
      output.push({ area: name, note: tidy(String(err)).slice(0, 100) });
    }
  }

  await stage('Holidays > Add blank form', async () => {
    await setupTab('Holidays');
    await page.getByRole('button', { name: '+ Add Holiday', exact: true }).click();
  });
  await stage('Leave > Add blank leave type form', async () => {
    await setupTab('Leave');
    await page.getByRole('button', { name: '+ Add Leave Type', exact: true }).click();
  });
  await stage('Departments > Approvers form', async () => {
    await setupTab('Departments');
    await page.getByRole('button', { name: 'Approvers', exact: true }).first().click();
  });
  await stage('Salary Rules > Add blank form', async () => {
    await page.goto('/payroll-value', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Structures', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Salary Rule', exact: true }).click();
  });
  await stage('Allowances > Add blank form', async () => {
    await page.goto('/payroll-value', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Structures', exact: true }).click();
    await page.getByRole('button', { name: 'Allowances', exact: true }).click();
    await page.getByRole('button', { name: '+ Add Allowance', exact: true }).click();
  });
  await stage('Employees > Import records wizard', async () => {
    await page.goto('/employees', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: /Import records/i }).click();
  });
  await stage('Settings > Users & Access', async () => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Users & Access', exact: true }).click();
  });

  const dest = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(dest, { recursive: true });
  writeFileSync(resolve(dest, 'setup-dialog-inventory.json'), JSON.stringify({
    description: 'Read-only blank form survey, no entered values captured',
    capturedAt: new Date().toISOString(),
    panels: output,
  }, null, 2));
  expect(output.length).toBe(7);
  console.log('Saved qa-artifacts/setup-dialog-inventory.json');
  console.log(output.map((entry) => `${entry.area}: ${entry.note ? 'REVIEW REQUIRED' : 'CAPTURED'}`).join('\n'));
});
