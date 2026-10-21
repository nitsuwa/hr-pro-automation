import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * READ ONLY — inspect native HR PRO Approvals > Overtime navigation.
 *
 * Does not create batches, submit requests, approve/reject filings,
 * edit records, or export employee data. All saved text is mapped to
 * generic categories, not raw visible labels that may contain names.
 *
 * This is structural discovery, NOT a SET_097–124 acceptance test.
 */
test('INVENTORY-OVERTIME | Read-only Approvals > Overtime survey', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  type Entry = {
    stage: string;
    route: string;
    controls: string[];
    headings: string[];
    counts: { rows: number; buttons: number; selects: number; textareas: number };
    note?: string;
  };
  const results: Entry[] = [];

  async function capture(stage: string, note?: string) {
    const info = await page.evaluate(() => {
      const visible = (element: Element) => {
        const style = getComputedStyle(element);
        return element.getClientRects().length > 0
          && style.visibility !== 'hidden' && style.display !== 'none';
      };
      const inMain = (selector: string) =>
        [...document.querySelectorAll(selector)].filter(visible);
      const clean = (value: string | null | undefined) =>
        (value ?? '').replace(/\s+/g, ' ').trim();

      const category = (name: string): string | null => {
        if (/^Approvals?$/i.test(name)) return 'Approvals navigation';
        if (/^Overtime$/i.test(name)) return 'Overtime navigation';
        if (/^Time & Attendance$/i.test(name)) return 'Time & Attendance';
        if (/^Review$/i.test(name)) return 'Review';
        if (/^Filters?$/i.test(name) || /Filters$/i.test(name)) return 'Filters';
        if (/^Approve\b/i.test(name)) return 'Approve action present (not clicked)';
        if (/^Reject\b/i.test(name)) return 'Reject action present (not clicked)';
        if (/^Submit\b/i.test(name)) return 'Submit action present (not clicked)';
        if (/^(?:Pending|Filings?|Requests?|Attendance)$/i.test(name)) return name;
        return null;
      };
      const controls = inMain('main button,main a,main [role="tab"]')
        .map(element => category(clean(element.getAttribute('aria-label') || element.textContent)))
        .filter((value): value is string => value !== null);
      const headings = inMain('main h1,main h2,main h3')
        .map(element => clean(element.textContent))
        .map(name => /^(?:Review|Approvals?|Overtime|Time & Attendance)$/i.test(name)
          ? name : /overtime|approval|review/i.test(name)
            ? 'Other review-related heading' : null)
        .filter((value): value is string => value !== null);
      return {
        route: location.pathname,
        controls: [...new Set(controls)],
        headings: [...new Set(headings)],
        counts: {
          rows: inMain('main tbody tr').length,
          buttons: inMain('main button').length,
          selects: inMain('main select').length,
          textareas: inMain('main textarea').length,
        },
      };
    });
    results.push({ stage, ...info, ...(note ? { note } : {}) });
  }

  // Only navigate in this read-only inspection. No attendance batch is
  // created here. A blank pending list is not a product defect.
  await page.goto('/time-attendance', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('main')).toBeVisible();
  await capture('Review home');

  const approvalsTab = page.getByRole('tab', { name: 'Approvals', exact: true });
  const approvalsButton = page.getByRole('button', { name: 'Approvals', exact: true });
  const approvalsLink = page.getByRole('link', { name: 'Approvals', exact: true });
  let approvalsOpened = false;
  if (await approvalsTab.count() === 1) {
    await approvalsTab.click();
    approvalsOpened = true;
  } else if (await approvalsButton.count() === 1) {
    await approvalsButton.click();
    approvalsOpened = true;
  } else if (await approvalsLink.count() === 1) {
    const href = await approvalsLink.getAttribute('href');
    if (href && (href.startsWith('/') || href.startsWith('#'))) {
      await approvalsLink.click();
      approvalsOpened = true;
    } else {
      await capture('Approvals link needs safety review');
    }
  } else {
    await capture('Approvals not uniquely available');
  }

  if (approvalsOpened) {
    await capture('Approvals screen');

    const overtimeTab = page.getByRole('tab', { name: 'Overtime', exact: true });
    const overtimeLink = page.getByRole('link', { name: 'Overtime', exact: true });
    const overtimeButton = page.getByRole('button', { name: 'Overtime', exact: true });
    if (await overtimeTab.count() === 1) {
      await overtimeTab.click();
      await capture('Overtime tab');
    } else if (await overtimeLink.count() === 1) {
      const href = await overtimeLink.getAttribute('href');
      if (href && (href.startsWith('/') || href.startsWith('#'))) {
        await overtimeLink.click();
        await capture('Overtime link');
      } else {
        await capture('Overtime link needs safety review');
      }
    } else if (await overtimeButton.count() === 1) {
      const isNavigation = await overtimeButton.evaluate(button => {
        const classes = typeof button.className === 'string' ? button.className : '';
        const parentClasses = typeof button.parentElement?.className === 'string'
          ? button.parentElement.className : '';
        const navClass = /(?:^|[^a-z])(?:tab|subtab|nav|menu)(?:$|[^a-z])/i;
        return !!button.closest('nav,[role="tablist"]')
          || navClass.test(classes) || navClass.test(parentClasses)
          || button.hasAttribute('aria-controls') || button.hasAttribute('aria-selected');
      });
      if (isNavigation) {
        await overtimeButton.click();
        await capture('Overtime navigation button');
      } else {
        await capture('Overtime button requires manual navigation review');
      }
    } else {
      await capture('Overtime navigation not uniquely available');
    }
  }

  const folder = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(folder, { recursive: true });
  writeFileSync(resolve(folder, 'setup-overtime-review-controls.json'), JSON.stringify({
    purpose: 'Read-only Approvals/Overtime UI structure. No decision or batch submitted.',
    steps: results,
  }, null, 2));

  expect(results.length).toBeGreaterThan(0);
  console.log('Saved qa-artifacts/setup-overtime-review-controls.json');
});
