import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { SettingsPage } from '../../playwright/pages/settings.page';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Read-only UI inventory to help create accurate permanent Setup regression tests.
 * DOES NOT press Add, Save, Delete, Reset, or edit any values.
 * It records headings and field/button labels, not employee names or entered values.
 */
test('INVENTORY | Organization Setup control names (read-only)', async ({ page, loginAs }) => {
  test.setTimeout(150_000);
  await loginAs('systemAdmin');

  const settings = new SettingsPage(page);
  await settings.openGeneral();

  async function snapshot(area: string) {
    const info = await page.evaluate(() => {
      const main = document.querySelector('main') ?? document.body;
      const visible = (element: Element) => {
        const h = element as HTMLElement;
        const style = window.getComputedStyle(h);
        return style.display !== 'none' && style.visibility !== 'hidden' && h.getClientRects().length > 0;
      };
      const tidy = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim().slice(0, 130);
      const all = (selector: string) => Array.from(main.querySelectorAll(selector)).filter(visible);
      const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
      const fields = all('input, textarea, select').map((element) => {
        const h = element as HTMLInputElement;
        const explicitLabel = h.id
          ? Array.from(document.querySelectorAll('label')).find((label) => label.htmlFor === h.id)?.textContent
          : null;
        const parentLabel = h.closest('label')?.textContent;
        return {
          tag: h.tagName.toLowerCase(),
          type: h.getAttribute('type') ?? '',
          name: tidy(h.getAttribute('name')),
          id: tidy(h.id),
          label: tidy(h.getAttribute('aria-label') ?? explicitLabel ?? parentLabel),
          placeholder: tidy(h.getAttribute('placeholder')),
        };
      });
      return {
        path: location.pathname,
        headings: unique(all('h1,h2,h3,h4').map((e) => tidy(e.textContent))),
        sections: unique(all('legend').map((e) => tidy(e.textContent))),
        buttons: unique(all('button,[role="tab"]').map((e) => tidy(e.getAttribute('aria-label') || e.textContent))).slice(0, 120),
        fields: fields.slice(0, 100),
      };
    });
    return { area, ...info };
  }

  const report: Array<Awaited<ReturnType<typeof snapshot>> | {area: string; note: string}> = [];
  report.push(await snapshot('General'));

  const tabNames = [
    'Company',
    'Departments',
    'Job Positions',
    'Work Locations',
    'Holidays',
    'Leave Types',
    'Salary Structures',
    'Allowances',
    'Loans',
  ];

  for (const name of tabNames) {
    try {
      // Re-open top-level Setup navigation to avoid relying on the last tab's state.
      await page.goto('/settings', { waitUntil: 'domcontentloaded' });
      const organization = page.getByRole('button', { name: 'Organization Setup', exact: true });
      await expect(organization).toBeVisible();
      await organization.click();
      const tabButton = page.getByRole('button', { name, exact: true });
      const tabRole = page.getByRole('tab', { name, exact: true });
      if (await tabButton.count() === 1 && await tabButton.isVisible()) {
        await tabButton.click();
        report.push(await snapshot(name));
      } else if (await tabRole.count() === 1 && await tabRole.isVisible()) {
        await tabRole.click();
        report.push(await snapshot(name));
      } else {
        report.push({ area: name, note: 'Exact tab not found; check General.buttons for actual navigation labels.' });
      }
    } catch (err) {
      report.push({ area: name, note: String(err).slice(0, 280) });
    }
  }

  const dir = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, 'setup-ui-inventory.json'), JSON.stringify({
    description: 'Read-only HR PRO Organization Setup UI structure (no field values)',
    capturedAt: new Date().toISOString(),
    areas: report,
  }, null, 2));

  console.log('Setup UI inventory written to qa-artifacts/setup-ui-inventory.json');
  console.log('Areas captured:', report.map((r) => r.area).join(', '));
});
