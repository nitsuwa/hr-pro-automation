import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ ONLY — Discover Holiday Edit and Leave Type Edit/Remove UI.
 * Opens existing rows or panels but NEVER fills, saves, removes, or
 * confirms anything. Data captured: generic action labels and form-field
 * metadata; no existing holiday names, employee names, or field values.
 */
test('INVENTORY-V10 | Holiday and Leave edit/remove controls (read-only)', async ({ page, loginAs }) => {
  test.setTimeout(150_000);
  await loginAs('systemAdmin');
  type Capture = {
    area: string;
    actions?: string[];
    fields?: Array<{ tag: string; type: string; label: string; placeholder: string; required: boolean }>;
    note?: string;
  };
  const captures: Capture[] = [];

  async function openTab(tab: 'Holidays' | 'Leave') {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: tab, exact: true }).first().click();
  }

  async function capture(area: string) {
    const data = await page.evaluate(() => {
      const shown = (e: Element) => {
        const style = getComputedStyle(e);
        return e.getClientRects().length > 0 && style.display !== 'none' && style.visibility !== 'hidden';
      };
      const els = (sel: string) => [...document.querySelectorAll(sel)].filter(shown);
      const tidy = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, 90);
      const actions = [...new Set(
        els('button,[role="button"],[role="tab"]').map(e => {
          const label = tidy(e.getAttribute('aria-label') || e.textContent);
          return /^(Add (?:Holiday|Leave Type)|Edit|Save(?: Changes)?|Cancel|Remove|Delete|Confirm|Close|Yes|No)$/i.test(label)
            ? label : '';
        }).filter(Boolean),
      )];
      const labels = [...document.querySelectorAll('label')];
      const fields = els('input,select,textarea').slice(0, 50).map(e => {
        const input = e as HTMLInputElement;
        const linked = input.id ? labels.find(l => l.htmlFor === input.id) : undefined;
        return {
          tag: e.tagName.toLowerCase(),
          type: e.getAttribute('type') || '',
          label: tidy(e.getAttribute('aria-label') || linked?.firstChild?.textContent || e.closest('label')?.firstChild?.textContent),
          placeholder: tidy(e.getAttribute('placeholder')),
          required: input.required ?? false,
        };
      });
      return { actions, fields };
    });
    captures.push({ area, ...data });
  }

  async function stage(area: string, action: () => Promise<void>) {
    try {
      await action();
      await capture(area);
    } catch {
      captures.push({ area, note: 'NEEDS REVIEW — expected editable control not found' });
    }
  }

  await stage('Holidays list actions', () => openTab('Holidays'));

  await stage('Holiday editor, if supported', async () => {
    await openTab('Holidays');
    const edit = page.getByRole('row').filter({
      has: page.getByRole('button', { name: 'Edit', exact: true }),
    }).first().getByRole('button', { name: 'Edit', exact: true });
    await expect(edit).toBeVisible();
    await edit.click(); // OPEN ONLY — no edits or saves
  });

  await stage('Leave Types list actions', () => openTab('Leave'));

  await stage('Leave Type expanded panel', async () => {
    await openTab('Leave');
    const buttons = page.getByRole('button', { name: /Leave/i });
    let target: typeof buttons | undefined;
    for (const button of await buttons.all()) {
      const label = (await button.innerText()).replace(/\s+/g, ' ').trim();
      if (label.length > 0 && label.length < 150 &&
          label !== 'Leave' && !/^\+?\s*Add Leave Type$/i.test(label)) {
        target = button;
        break;
      }
    }
    if (!target) throw Error('Leave Type expansion button not found');
    await target.click(); // OPEN ONLY — no edits or saves
  });

  const folder = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(folder, { recursive: true });
  writeFileSync(resolve(folder, 'setup-holiday-leave-controls.json'), JSON.stringify({
    purpose: 'Read-only control inventory for remaining SET_220/228/229 tests',
    capturedAt: new Date().toISOString(),
    captures,
  }, null, 2));
  expect(captures).toHaveLength(4);
  console.log('Saved qa-artifacts/setup-holiday-leave-controls.json');
  console.log(captures.map(x => x.area + ': ' + (x.note ? 'NEEDS REVIEW' : 'CAPTURED')).join('\n'));
});
