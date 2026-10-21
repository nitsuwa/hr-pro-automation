import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Read-only inspection for workbook gaps SET_172–176 (Company Profile)
 * and SET_220 (Holiday Edit). Includes associated/wrapping HTML labels and
 * aggregate Holiday row interaction counts, never stored field values.
 *
 * Do NOT capture existing field values, uploaded files, records, IDs,
 * employee details or secrets. Only report visible field structure and
 * possible edit/remove control labels. This is not regression evidence.
 */
test('INVENTORY-REMAINING-FIELDS | Company inputs and Holiday edit controls (read-only)', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');

  const openSetup = async (tab: 'Company' | 'Holidays') => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    // A Holidays button also exists in the Settings jump navigation.
    // Restrict selection to the Organization Setup subtabs.
    const setupTab = page.locator('button.subtab').filter({
      hasText: new RegExp('^' + tab + '$'),
    });
    await expect(setupTab, 'Unique Organization Setup tab').toHaveCount(1);
    await setupTab.click();
  };

  async function readVisibleControls() {
    return page.evaluate(() => {
      const visible = (el: Element) => {
        const css = getComputedStyle(el);
        return el.getClientRects().length > 0 && css.display !== 'none'
          && css.visibility !== 'hidden';
      };
      const clean = (v: string | null | undefined) =>
        (v ?? '').replace(/\s+/g, ' ').trim().slice(0, 85);

      // Only labels and input types; never input.value, filenames or row text.
      const fields = [...document.querySelectorAll('input, select, textarea')]
        .filter(visible).map(input => {
          const node = input as HTMLInputElement;
          const relatedLabel = node.id
            ? [...document.querySelectorAll('label')]
              .find(label => label.htmlFor === node.id)
            : undefined;
          // Native labels include both label[for=id] and labels that wrap
          // the input. The first inventory only checked label[for=id].
          // Read static label text only; never read or write input.value.
          const nativeLabels = 'labels' in node
            ? Array.from(node.labels ?? []).map(label => clean(label.textContent))
            : [];
          const labelIds = (node.getAttribute('aria-labelledby') ?? '')
            .trim().split(' ').filter(Boolean);
          const ariaLinked = labelIds
            .map(id => clean(document.getElementById(id)?.textContent))
            .filter(Boolean);
          const nearestLabel = node.closest('label')
            ?? node.parentElement?.querySelector(':scope > label')
            ?? node.parentElement?.parentElement?.querySelector(':scope > label');
          const label = [
            clean(node.getAttribute('aria-label')),
            ...ariaLinked,
            ...nativeLabels,
            clean(relatedLabel?.textContent),
            clean(nearestLabel?.textContent),
          ].find(Boolean) ?? '';
          return {
            tag: node.tagName.toLowerCase(),
            type: clean(node.getAttribute('type') || ''),
            label,
            placeholder: clean(node.getAttribute('placeholder')),
            required: node.required,
            disabled: node.disabled,
          };
        });
      const actions = [...document.querySelectorAll('button')]
        .filter(visible)
        .map(button => clean(button.getAttribute('aria-label') || button.textContent))
        .filter(label => /edit|save|remove|delete|upload|logo|holiday|change|cancel/i.test(label))
        .slice(0, 35);
      return {
        fields,
        actions,
        fileInputCount: fields.filter(field => field.type === 'file').length,
        // Only structure and counts. Avoid row contents, input values, or names.
        tableRowCount: document.querySelectorAll('main table tbody tr').length,
        rowLinksCount: document.querySelectorAll('main table tbody tr a').length,
        rowEditButtonCount: [...document.querySelectorAll('main table tbody tr button')]
          .filter(visible)
          .filter(button => /edit/i.test(clean(button.getAttribute('aria-label') || button.textContent)))
          .length,
      };
    });
  }

  await openSetup('Company');
  await expect(page.getByRole('heading', { name: /Company profile/i })).toBeVisible();
  const company = await readVisibleControls();

  await openSetup('Holidays');
  const holiday = await readVisibleControls();

  const directory = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, 'setup-remaining-fields.json'), JSON.stringify({
    purpose: 'Read-only structural inventory; NOT a test PASS or workbook sign-off',
    company,
    holiday,
  }, null, 2));
  expect(company.fields.length, 'The Company panel must contain inspectable fields').toBeGreaterThan(0);
  console.log('Saved qa-artifacts/setup-remaining-fields.json');
});
