import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ ONLY — opens a QA-created Leave Type to discover its edit/remove
 * controls. Does not save, change, delete, or remove any record.
 * Captures generic control names and field metadata, NOT field values.
 */
test('INVENTORY-V11 | Open existing QA Leave Type edit panel (read-only)', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/settings', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
  await page.getByRole('button', { name: 'Leave', exact: true }).click();

  const qaLeave = page.getByRole('button', { name: /^QA (?:Dup )?Leave / }).first();
  await expect(qaLeave, 'Only an existing QA test Leave Type may be inspected').toBeVisible();
  await qaLeave.click();

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
    description: 'Non-mutating structural inventory of a QA-only Leave Type edit view',
    result,
  }, null, 2));
  expect(result).toHaveProperty('inputs');
  console.log('Saved qa-artifacts/setup-leave-editor.json');
});
