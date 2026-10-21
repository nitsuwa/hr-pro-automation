import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ ONLY — opens the existing Vacation Leave (VL) edit panel to
 * discover available controls. Never fills, saves, removes, or confirms.
 * Does not depend on QA-created records persisting across test runs.
 * Captures generic control names and field metadata, NOT field values.
 */
test('INVENTORY-V11 | Inspect Leave Type edit panel (read-only)', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/settings', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
  await page.getByRole('button', { name: 'Leave', exact: true }).click();

  // The previous inventory wrongly relied on a QA record from another run.
  // Seeded Vacation Leave is always visible in this prototype. Opening its
  // editor is safe because this inspection never enters or saves any values.
  const leaveType = page.getByRole('button', { name: /^VL Vacation Leave\b/ });
  await expect(leaveType, 'Seeded Vacation Leave should be present').toBeVisible();
  await leaveType.click();

  // Inspect accessible controls without reading stored personal or field data.
  const result = await page.evaluate(() => {
    const visible = (el: Element) => {
      const css = getComputedStyle(el);
      return el.getClientRects().length > 0 && css.display !== 'none' && css.visibility !== 'hidden';
    };
    const clean = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim();
    const actionWords = /^(?:Save|Update|Delete|Remove|Cancel|Close|Confirm|Edit|Done|Discard|Apply|Create|Reset|Back)(?:\s+.*)?$/i;
    const actions = [...document.querySelectorAll('button')].filter(visible)
      .map(e => clean(e.getAttribute('aria-label') || e.textContent))
      .filter(x => actionWords.test(x))
      .map(x => x.split(/\s+/).slice(0,3).join(' '));
    const inputs = [...document.querySelectorAll('input,select,textarea')]
      .filter(visible).map(el => {
        const node = el as HTMLInputElement;
        const related = node.id ? [...document.querySelectorAll('label')].find(l => l.htmlFor === node.id) : undefined;
        return {
          tag: node.tagName.toLowerCase(),
          type: node.getAttribute('type') || '',
          placeholder: (node.getAttribute('placeholder') || '').slice(0,90),
          label: clean(node.getAttribute('aria-label') || related?.textContent || '').slice(0,90),
          required: node.required,
        };
      });
    return {
      actions,
      inputs,
      counts: {
        dialogs: [...document.querySelectorAll('[role="dialog"]')].filter(visible).length,
        buttons: [...document.querySelectorAll('button')].filter(visible).length,
      },
    };
  });

  const folder = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(folder, { recursive: true });
  writeFileSync(resolve(folder, 'setup-leave-editor.json'), JSON.stringify({
    description: 'Non-mutating structural inventory of seeded Vacation Leave edit controls; no changes saved',
    result,
  }, null, 2));
  expect(result).toHaveProperty('inputs');
  console.log('Saved qa-artifacts/setup-leave-editor.json');
});
