import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * OPTIONAL INSPECTION ONLY — HR PRO native overtime setup (SET_097–124).
 *
 * The first read-only Review survey found 0 rows and no Overtime navigation
 * in a fresh Playwright browser context. This opt-in follow-up uses the same
 * known Review-batch setup path as regression/setup/filing-approvals.spec.ts.
 *
 * Creating/submitting a batch MUTATES QA application state. Requires explicit
 * permission AND a disposable test environment. Never use production or a
 * shared tenant. The test DOES NOT approve, reject, edit overtime, release
 * payroll, modify employee details, or create salary payouts.
 *
 * Records ONLY generic control labels and counts, never personal names,
 * dates, salaries, record values, stored application data or credentials.
 * Passing this inspection does NOT mean any workbook group has passed.
 */
test('INVENTORY-OVERTIME-POPULATED | Inspect Review after a QA-only batch', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Review batch creation must never run in production.',
  );
  test.skip(
    process.env.E2E_APPROVED_MUTATIONS !== '1',
    'Approved disposable QA context required: E2E_APPROVED_MUTATIONS=1.',
  );
  test.setTimeout(120_000);
  await loginAs('systemAdmin');

  type Snapshot = {
    stage: string;
    route: string;
    controls: string[];
    headings: string[];
    counts: { rows: number; buttons: number; selects: number };
  };
  const snapshots: Snapshot[] = [];

  async function inspect(stage: string) {
    const data = await page.evaluate(() => {
      const visible = (element: Element) => {
        const style = getComputedStyle(element);
        return element.getClientRects().length > 0
          && style.visibility !== 'hidden' && style.display !== 'none';
      };
      const clean = (s: string | null | undefined) =>
        (s ?? '').replace(/\s+/g, ' ').trim().slice(0, 90);
      const inMain = (selector: string) =>
        [...document.querySelectorAll(selector)].filter(visible);

      // Never return raw labels or headings: some workflow controls may
      // include names/IDs. Classify to generic categories only.
      const classify = (value: string): string | null => {
        if (/^Time & Attendance$/i.test(value)) return 'Time & Attendance';
        if (/^How to review attendance$/i.test(value)) return 'How to review attendance';
        if (/^Approvals?$/i.test(value)) return 'Approvals navigation';
        if (/^Overtime$/i.test(value)) return 'Overtime navigation';
        if (/^Filters?$/i.test(value) || /Filters$/i.test(value)) return 'Filters';
        if (/^(?:Review|Filings?|Pending|Attendance|Details)$/i.test(value)) return value;
        if (/^Approve\b/i.test(value)) return 'Approve action present (not clicked)';
        if (/^Reject\b/i.test(value)) return 'Reject action present (not clicked)';
        if (/^Submit for payroll value check/i.test(value))
          return 'Submit for payroll value check (not clicked)';
        if (/^(?:Back|Return|Cancel|Save|Next)(?:$|\s)/i.test(value))
          return 'Generic workflow control';
        return null;
      };
      const controls = inMain('main button,main a,[role="main"] button')
        .map(el => classify(clean(el.getAttribute('aria-label') || el.textContent)))
        .filter((label): label is string => label !== null);
      const headings = inMain('main h1,main h2,main h3')
        .map(el => clean(el.textContent))
        .map(value => /^(?:Review|Overtime|Approvals?|Time & Attendance)$/i.test(value)
          ? value : /review|overtime|attendance|approval|filing/i.test(value)
            ? 'Other review-related heading' : null)
        .filter((label): label is string => label !== null);
      const selects = inMain('main select');
      return {
        route: location.pathname,
        controls: [...new Set(controls)].slice(0, 45),
        headings: [...new Set(headings)].slice(0, 12),
        counts: {
          rows: inMain('main tbody tr').length,
          buttons: inMain('main button').length,
          selects: selects.length,
        },
      };
    });
    snapshots.push({ stage, ...data });
  }

  // Use the Review batch setup that the existing filing/approval regression
  // already exercises. It is scoped to a disposable QA browser/tenant.
  await page.goto('/timesheet', { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Payroll date', { exact: true }).fill('2026-09-20');
  await page.getByLabel(/^Batch name/).fill('QA_OT_INSPECT_' + Date.now().toString(36));
  await page.getByLabel('Search', { exact: true }).fill('Juan Dela Cruz');
  const row = page.getByRole('row').filter({ hasText: 'Juan Dela Cruz' });
  await expect(row, 'The approved demo employee must be available for QA batch creation')
    .toHaveCount(1);
  await row.locator('input[type="checkbox"]').check();
  await page.getByRole('button', { name: 'Review attendance →', exact: true }).click();
  await page.getByRole('button', { name: 'Submit to Review', exact: true }).click();

  await expect(page).toHaveURL(/time-attendance/);
  await inspect('Review populated by QA-only batch');

  // Opening a review row is navigation only, not an approve/reject action.
  const reviewRow = page.getByRole('row').filter({ hasText: 'Juan Dela Cruz' });
  if (await reviewRow.count() === 1) {
    await reviewRow.click();
    await inspect('Review detail opened (no changes)');
  }

  // The first successful populated Review inventory found an "Approvals"
  // navigation control, but no named Overtime tab. Navigate ONLY using that
  // exact non-action label. Do not click Approve/Reject/Submit controls.
  const approvalsTab = page.getByRole('tab', { name: 'Approvals', exact: true });
  const approvalsButton = page.getByRole('button', { name: 'Approvals', exact: true });
  const approvalsLink = page.getByRole('link', { name: 'Approvals', exact: true });
  if (await approvalsTab.count() === 1) {
    await approvalsTab.click();
    await inspect('Approvals tab opened (no decisions)');
  } else if (await approvalsButton.count() === 1) {
    await approvalsButton.click();
    await inspect('Approvals navigation opened (no decisions)');
  } else if (await approvalsLink.count() === 1) {
    await approvalsLink.click();
    await inspect('Approvals link opened (no decisions)');
  } else {
    // Unknown UI: record the existing Review view instead of guessing.
    await inspect('Approvals navigation not uniquely available');
  }

  // An exact "Overtime" control appeared on the Approvals screen during
  // the operator's previous read-only inspection. It may be a button rather
  // than a role=tab. Open it ONLY when it has tab/nav semantics; never guess
  // that an arbitrary action button is safe.
  const overtimeTab = page.getByRole('tab', { name: 'Overtime', exact: true });
  const overtimeLink = page.getByRole('link', { name: 'Overtime', exact: true });
  const overtimeButton = page.getByRole('button', { name: 'Overtime', exact: true });
  if (await overtimeTab.count() === 1) {
    await overtimeTab.click();
    await inspect('Overtime tab opened (no changes)');
  } else if (await overtimeLink.count() === 1) {
    // Links are navigation controls; do not follow external destinations.
    const href = await overtimeLink.getAttribute('href');
    if (href && (href.startsWith('/') || href.startsWith('#'))) {
      await overtimeLink.click();
      await inspect('Overtime link opened (no changes)');
    } else {
      await inspect('Overtime link needs safety review');
    }
  } else if (await overtimeButton.count() === 1) {
    // Permit only recognisable tab/navigation UI. This gate deliberately
    // avoids clicking unclassified buttons or approval actions.
    const isNavigation = await overtimeButton.evaluate((button) => {
      const classes = typeof button.className === 'string' ? button.className : '';
      const parentClasses = typeof button.parentElement?.className === 'string'
        ? button.parentElement.className : '';
      return !!button.closest('nav,[role="tablist"]')
        || /(?:^|[-_\\s])(?:tab|subtab|nav|menu)(?:[-_\\s]|$)/i.test(classes)
        || /(?:^|[-_\\s])(?:tab|subtab|nav|menu)(?:[-_\\s]|$)/i.test(parentClasses)
        || button.hasAttribute('aria-controls')
        || button.hasAttribute('aria-selected');
    });
    if (isNavigation) {
      await overtimeButton.click();
      await inspect('Overtime navigation button opened (no changes)');
    } else {
      await inspect('Overtime button needs navigation safety review');
    }
  } else {
    await inspect('Overtime view not uniquely available');
  }

  mkdirSync(resolve(process.cwd(), 'qa-artifacts'), { recursive: true });
  writeFileSync(
    resolve(process.cwd(), 'qa-artifacts', 'setup-overtime-populated-review.json'),
    JSON.stringify({
      purpose: 'Non-acceptance inventory; a QA-only batch was submitted, no approvals/payroll released',
      snapshots,
    }, null, 2),
  );
  console.log('Saved qa-artifacts/setup-overtime-populated-review.json');
  expect(snapshots.length, 'Populated Review was visited').toBeGreaterThanOrEqual(1);
  expect(snapshots[0].counts.rows,
    'A submitted QA batch should produce at least one Review row; inspect the JSON if not',
  ).toBeGreaterThan(0);
});
