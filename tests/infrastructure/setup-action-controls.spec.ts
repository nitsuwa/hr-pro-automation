import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ-ONLY: focused custom approval-dropdown, employee user-account and
 * employee removal-action discovery. Never changes/saves any record.
 *
 * Does not capture employees' names, selected users, emails, salaries,
 * phone numbers, input values, employee IDs, or option text.
 */
test('INVENTORY-V9 | Approver dropdown, account field, and employee removal controls', async ({ page, loginAs }) => {
  test.setTimeout(150_000);
  await loginAs('systemAdmin');

  type Result = {
    area: string;
    visibleActionKinds?: string[];
    controls?: Array<{ tag: string; role: string; type: string; hasPopup: string; expanded: string; disabled: boolean }>;
    countsByRole?: Record<string, number>;
    categories?: string[];
    note?: string;
  };
  const results: Result[] = [];

  async function capture(area: string) {
    const data = await page.evaluate(() => {
      const visible = (e: Element) => {
        const h = e as HTMLElement;
        const style = getComputedStyle(h);
        return h.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const all = (selector: string) => [...document.querySelectorAll(selector)].filter(visible);
      const actionKinds = (s: string) => {
        const supported = [
          'Save Changes', 'Save', 'Cancel', 'Edit', 'Remove', 'Delete',
          'Archive', 'Deactivate', 'Create', 'Approvers',
          'Company default', 'None', 'User', 'Account',
        ];
        return supported.find(token => s.toLowerCase().includes(token.toLowerCase())) ?? '';
      };
      const visibleActionKinds = [...new Set(all('button,[role="button"],[role="tab"]')
        .map(e => actionKinds(e.getAttribute('aria-label') || e.textContent || '')).filter(Boolean))];
      const controls = all('button,[role="combobox"],input,select,[role="listbox"],[role="option"],[role="menuitem"]')
        .slice(0, 100).map(e => ({
          tag: e.tagName.toLowerCase(),
          role: e.getAttribute('role') || '',
          type: e.getAttribute('type') || '',
          hasPopup: e.getAttribute('aria-haspopup') || '',
          expanded: e.getAttribute('aria-expanded') || '',
          disabled: e.hasAttribute('disabled'),
        }));
      const countsByRole: Record<string, number> = {};
      for (const c of controls) {
        const key = c.role || c.tag;
        countsByRole[key] = (countsByRole[key] || 0) + 1;
      }
      const keyLabels = ['Full Name', 'Connected User Account', 'Create user',
        'Approver', 'Overtime', 'Timekeeping', 'Leave', 'First', 'Second'];
      const textNodes = all('label,legend,h3,h4').map(e => (e.textContent || '').trim());
      const categories = keyLabels.filter(label => textNodes.some(text =>
        text.toLowerCase().includes(label.toLowerCase())));
      return { visibleActionKinds, controls, countsByRole, categories };
    });
    results.push({ area, ...data });
  }

  async function stage(area: string, callback: () => Promise<void>) {
    try {
      await callback();
      await capture(area);
    } catch (error) {
      // Keep other inspection sections useful when one custom control differs.
      results.push({ area, note: String(error).replace(/\x1b\[[0-9;]*m/g, '').slice(0, 160) });
    }
  }

  await stage('Department Approvers editor', async () => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Departments', exact: true }).click();
    await page.getByRole('row').filter({
      has: page.getByRole('button', { name: 'Approvers', exact: true }),
    }).first().getByRole('button', { name: 'Approvers', exact: true }).click();
    await expect(page.getByRole('heading', { name: /^Approvers —/ })).toBeVisible();
  });

  await stage('Department Approvers expanded dropdown (no selection)', async () => {
    // The V8 output showed None / Company default button TEXT, but those
    // buttons did not expose the same accessible name.
    const trigger = page.locator('button').filter({ hasText: /None|Company default/i }).first();
    await expect(trigger, 'A department approver dropdown should exist').toBeVisible();
    await trigger.click();
  });

  await stage('Employee detail editor / connected account field', async () => {
    await page.goto('/employees', { waitUntil: 'domcontentloaded' });
    const employeeLink = page.getByRole('table').getByRole('link').first();
    await expect(employeeLink).toBeVisible();
    await employeeLink.click();
    // A regular employee table link opens editable fields directly.
    await expect(page.getByRole('textbox', { name: 'Full Name*', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save', exact: true })).toBeVisible();
  });

  await stage('Employee list after checkbox selection (no action taken)', async () => {
    await page.goto('/employees', { waitUntil: 'domcontentloaded' });
    const rowCheck = page.getByRole('row').filter({
      has: page.getByRole('checkbox', { name: /^Select / }),
    }).first().getByRole('checkbox', { name: /^Select / });
    await expect(rowCheck).toBeVisible();
    await rowCheck.check();
  });

  const dir = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'setup-action-controls.json'), JSON.stringify({
    description: 'Anonymous read-only structural survey; no employee data or selected approver names',
    generatedAt: new Date().toISOString(),
    results,
  }, null, 2));
  expect(results).toHaveLength(4);
  console.log('Saved qa-artifacts/setup-action-controls.json');
  console.log(results.map(r => r.area + ': ' + (r.note ? 'NEEDS REVIEW' : 'CAPTURED')).join('\n'));
});
