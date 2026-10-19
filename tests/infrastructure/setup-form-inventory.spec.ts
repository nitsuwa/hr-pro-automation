import { test, expect, Page } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ-ONLY interface survey. Opens tabs and blank forms, but never enters data
 * or clicks Save, Remove, Import or Reset. The file records control labels,
 * never current input values or employee data.
 */
test('INVENTORY-V2 | Setup, Smart Pay and employee form controls', async ({ page, loginAs }) => {
  test.setTimeout(180_000);
  await loginAs('systemAdmin');

  type Panel = { area: string; path?: string; headings?: string[]; buttons?: string[]; fields?: object[]; note?: string };
  const results: Panel[] = [];

  const capture = async (area: string) => {
    const details = await page.evaluate(() => {
      const isVisible = (node: Element) => {
        const element = node as HTMLElement;
        const style = window.getComputedStyle(element);
        return element.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const clean = (value: string | null | undefined) => (value ?? '').replace(/\s+/g, ' ').trim().slice(0, 100);
      const unique = (values: string[]) => Array.from(new Set(values.filter(Boolean)));
      const visible = (selector: string) => Array.from(document.querySelectorAll(selector)).filter(isVisible);
      return {
        path: location.pathname,
        headings: unique(visible('main h1,main h2,main h3,main h4,[role="dialog"] h2').map((e) => clean(e.textContent))).slice(0, 65),
        buttons: unique(visible('button,[role="tab"]').map((e) => clean(e.getAttribute('aria-label') ?? e.textContent))).slice(0, 130),
        fields: visible('input,textarea,select').slice(0, 100).map((e) => {
          const el = e as HTMLInputElement;
          const labels = Array.from(document.querySelectorAll('label'));
          const linked = el.id ? labels.find((l) => l.htmlFor === el.id)?.textContent : null;
          return {
            tag: el.tagName.toLowerCase(),
            type: el.getAttribute('type') ?? '',
            label: clean(el.getAttribute('aria-label') ?? linked ?? el.closest('label')?.textContent),
            placeholder: clean(el.getAttribute('placeholder')),
            name: clean(el.getAttribute('name')),
          };
        }),
      };
    });
    results.push({ area, ...details });
  };

  const setupTab = async (name: string) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    const buttons = page.getByRole('button', { name, exact: true });
    await expect(buttons.first(), `Setup section ${name} should exist`).toBeVisible();
    // First match is the setup section navigation; "Holidays" also exists in General content.
    await buttons.first().click();
  };

  for (const tab of ['Holidays', 'Leave', 'Departments', 'Job Positions', 'Work Locations', 'Company']) {
    try {
      await setupTab(tab);
      await capture(`Organization Setup > ${tab}`);
      if (tab === 'Departments') {
        const add = page.getByRole('button', { name: '+ Add Department', exact: true });
        if (await add.isVisible()) {
          await add.click(); // open empty form only; DO NOT save
          await capture('Departments > Add blank form');
        }
      }
    } catch (error) {
      results.push({ area: tab, note: String(error).slice(0, 300) });
    }
  }

  try {
    await page.goto('/payroll-value', { waitUntil: 'domcontentloaded' });
    await capture('Smart Pay main');
    const structures = page.getByRole('button', { name: 'Structures', exact: true });
    const structuresTab = page.getByRole('tab', { name: 'Structures', exact: true });
    const structuresLink = page.getByRole('link', { name: 'Structures', exact: true });
    const opener = (await structures.count()) ? structures.first() : (await structuresTab.count()) ? structuresTab.first() : structuresLink.first();
    if (await opener.count()) {
      await opener.click();
      await capture('Smart Pay > Structures');
      const allowances = page.getByRole('button', { name: /Allowances/i }).first();
      const allowanceTab = page.getByRole('tab', { name: /Allowances/i }).first();
      if (await allowances.count() && await allowances.isVisible()) {
        await allowances.click();
        await capture('Smart Pay > Structures > Allowances');
      } else if (await allowanceTab.count() && await allowanceTab.isVisible()) {
        await allowanceTab.click();
        await capture('Smart Pay > Structures > Allowances');
      }
    }
  } catch (error) {
    results.push({ area: 'Smart Pay', note: String(error).slice(0, 300) });
  }

  try {
    await page.goto('/employees', { waitUntil: 'domcontentloaded' });
    await capture('Employees list and import buttons');
    const enroll = page.getByRole('button', { name: '+ Enroll Employee', exact: true });
    if (await enroll.isVisible()) {
      await enroll.click(); // open form, not submit
      await capture('Employees > blank enrollment form');
    }
  } catch (error) {
    results.push({ area: 'Employees', note: String(error).slice(0, 300) });
  }

  const outputDir = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(outputDir, { recursive: true });
  const outputPath = resolve(outputDir, 'setup-form-inventory.json');
  writeFileSync(outputPath, JSON.stringify({
    description: 'Read-only UI inventory; labels only, no form values or personal information',
    capturedAt: new Date().toISOString(),
    panels: results,
  }, null, 2));

  expect(results.length).toBeGreaterThan(5);
  console.log('Saved:', outputPath);
  console.log(results.map((entry) => `${entry.area}: ${entry.note ? 'NEEDS REVIEW' : 'CAPTURED'}`).join('\n'));
});
