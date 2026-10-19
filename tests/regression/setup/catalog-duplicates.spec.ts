import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import type { Page } from '@playwright/test';

/**
 * Workbook negative cases: SET_169, SET_182, SET_195, SET_211.
 *
 * Each test creates a unique QA-only source record, attempts to add the
 * identical name a second time, then reloads and checks that exactly one
 * matching record exists. This verifies duplicate prevention.
 *
 * The workbook also requires a user-visible duplicate error message.
 * That part still needs explicit UI message assertions after inspecting
 * the app's actual validation feedback, so do not mark the Excel cases
 * fully covered solely because these tests pass.
 */
test.describe('HR PRO Setup — Duplicate catalog validation', () => {
  const runId = () => Date.now().toString(36);

  async function openSetupTab(page: Page, tab: 'Departments' | 'Job Positions' | 'Work Locations') {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: tab, exact: true }).click();
  }

  async function openLoans(page: Page) {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'General', exact: true }).click();
  }

  async function enterLoanName(page: Page, name: string) {
    await page.getByPlaceholder('New loan source (required)', { exact: true }).fill(name);
    const add = page.getByRole('button', { name: '+ Add Loan', exact: true });
    if (await add.isEnabled()) await add.click();
  }

  async function enterDepartmentName(page: Page, name: string) {
    await page.getByRole('button', { name: '+ Add Department', exact: true }).click();
    const input = page.getByRole('textbox', { name: 'Department name', exact: true });
    await expect(input).toBeVisible();
    await input.fill(name);
    await input.press('Enter');
  }

  async function enterPositionName(page: Page, name: string) {
    await page.getByPlaceholder('Position title (required)', { exact: true }).fill(name);
    const add = page.getByRole('button', { name: '+ Add Position', exact: true });
    if (await add.isEnabled()) await add.click();
  }

  async function enterLocationName(page: Page, name: string) {
    await page.getByPlaceholder('Location name (required)', { exact: true }).fill(name);
    const add = page.getByRole('button', { name: '+ Add Location', exact: true });
    if (await add.isEnabled()) await add.click();
  }

  test('SET-LOANS-002 | SET_169 | Duplicate loan source is not saved', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openLoans(page);
    const name = `QA Dup Loan ${runId()}`;
    await enterLoanName(page, name);
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1);

    await enterLoanName(page, name);
    await openLoans(page);
    await expect(
      page.getByRole('row').filter({ hasText: name }),
      'An existing loan source must not be duplicated',
    ).toHaveCount(1);
  });

  test('SET-DEPT-002 | SET_182 | Duplicate department is not saved', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openSetupTab(page, 'Departments');
    const name = `QA Dup Dept ${runId()}`;
    await enterDepartmentName(page, name);
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1);

    await enterDepartmentName(page, name);
    await openSetupTab(page, 'Departments');
    await expect(
      page.getByRole('row').filter({ hasText: name }),
      'An existing department must not be duplicated',
    ).toHaveCount(1);
  });

  test('SET-JOBPOS-002 | SET_195 | Duplicate job position is not saved', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openSetupTab(page, 'Job Positions');
    const name = `QA Dup Position ${runId()}`;
    await enterPositionName(page, name);
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1);

    await enterPositionName(page, name);
    await openSetupTab(page, 'Job Positions');
    await expect(
      page.getByRole('row').filter({ hasText: name }),
      'An existing job position must not be duplicated',
    ).toHaveCount(1);
  });

  test('SET-LOCATION-002 | SET_211 | Duplicate work location is not saved', async ({ page, loginAs }) => {
    await loginAs('systemAdmin');
    await openSetupTab(page, 'Work Locations');
    const name = `QA Dup Location ${runId()}`;
    await enterLocationName(page, name);
    await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(1);

    await enterLocationName(page, name);
    await openSetupTab(page, 'Work Locations');
    await expect(
      page.getByRole('row').filter({ hasText: name }),
      'An existing work location must not be duplicated',
    ).toHaveCount(1);
  });
});
