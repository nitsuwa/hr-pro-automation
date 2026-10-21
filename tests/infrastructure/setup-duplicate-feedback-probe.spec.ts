import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from '@playwright/test';

/**
 * Exploratory candidate: workbook SET_169 / SET_182 require not only
 * duplicate prevention but also a visible duplicate/error message.
 *
 * This is intentionally an INFRASTRUCTURE probe, NOT an accepted regression.
 * Creates two unique QA-only records. The operator must explicitly authorize
 * persistent test-data changes with E2E_APPROVED_MUTATIONS=1.
 *
 * Does not assume a message or declare a product bug. Captures only short
 * potential validation messages, the add-button state and duplicate row count.
 * Does not capture employee or other application records.
 */
test('INVENTORY-DUP-FEEDBACK | Inspect Loan and Department duplicate messages', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Do not mutate records in a production environment.',
  );
  test.skip(
    process.env.E2E_APPROVED_MUTATIONS !== '1',
    'Obtain explicit permission for persistent QA test records; set E2E_APPROVED_MUTATIONS=1.',
  );

  await loginAs('systemAdmin');

  async function openTab(tab: 'General' | 'Departments') {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: tab, exact: true }).click();
  }

  const sanitizeMessages = async () => {
    const nodes = page.locator(
      '[role="alert"], [role="status"], [role="alertdialog"], [class*="error"], [class*="warning"], [class*="toast"], [aria-live]',
    );
    const messages = (await nodes.allTextContents())
      .map(value => value.replace(/\s+/g, ' ').trim().slice(0, 160))
      .filter(value => /duplicat|already|exist|cannot|not allowed|same name|unique|invalid/i.test(value))
      .slice(0, 10);
    return [...new Set(messages)];
  };

  // An extra render turn lets immediate validation messages be added after an
  // input event. This is a structural inspection, not a regression assertion.
  async function settleVisibleUI() {
    await page.evaluate(() => new Promise<void>(resolveAnimationFrame => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolveAnimationFrame()));
    }));
  }

  async function inspectLoans() {
    await openTab('General');
    const name = 'QA Dup Message Loan ' + Date.now().toString(36);
    const input = page.getByPlaceholder('New loan source (required)', { exact: true });
    const add = page.getByRole('button', { name: '+ Add Loan', exact: true });

    await input.fill(name);
    await expect(add).toBeEnabled();
    await add.click();
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1);

    await input.fill(name);
    const disabledBeforeClick = await add.isDisabled();
    if (!disabledBeforeClick) await add.click();
    await settleVisibleUI();

    const feedback = await sanitizeMessages();
    await openTab('General');
    const persistedRows = await page.getByRole('row').filter({ hasText: name }).count();
    return { testCase: 'SET_169', duplicateSubmitDisabled: disabledBeforeClick, feedback, persistedRows };
  }

  async function inspectDepartments() {
    await openTab('Departments');
    const name = 'QA Dup Message Dept ' + Date.now().toString(36);
    const add = page.getByRole('button', { name: '+ Add Department', exact: true });
    const create = async () => {
      await add.click();
      const input = page.getByRole('textbox', { name: 'Department name', exact: true });
      await expect(input).toBeVisible();
      await input.fill(name);
      await input.press('Enter');
    };

    await create();
    const success = page.getByRole('alertdialog', { name: /^Added / });
    await expect(success).toBeVisible();
    await success.getByRole('button', { name: 'OK', exact: true }).click();
    await expect(success).toBeHidden();
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1);

    await create();
    await settleVisibleUI();
    const feedback = await sanitizeMessages();

    // Dismiss a blocking duplicate alert through its native UI, if present.
    const dialog = page.getByRole('alertdialog');
    if (await dialog.isVisible()) {
      const ok = dialog.getByRole('button', { name: 'OK', exact: true });
      if (await ok.isVisible()) await ok.click();
    }
    await openTab('Departments');
    const persistedRows = await page.getByRole('row').filter({ hasText: name }).count();
    return { testCase: 'SET_182', feedback, persistedRows };
  }

  const results: Record<string, unknown>[] = [];
  for (const inspect of [inspectLoans, inspectDepartments]) {
    try {
      results.push(await inspect());
    } catch (error) {
      results.push({
        testCase: inspect === inspectLoans ? 'SET_169' : 'SET_182',
        inspectionError: error instanceof Error ? error.message.slice(0, 350) : 'Unknown inspection failure',
      });
    }
  }

  const folder = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(folder, { recursive: true });
  writeFileSync(
    resolve(folder, 'setup-duplicate-feedback.json'),
    JSON.stringify({
      purpose: 'Investigate visible duplicate warnings, not determine PASS/FAIL',
      approvedMutations: true,
      results,
    }, null, 2),
  );
  console.log('Wrote qa-artifacts/setup-duplicate-feedback.json');
  expect(results, 'Both feedback investigations should produce result entries').toHaveLength(2);
});
