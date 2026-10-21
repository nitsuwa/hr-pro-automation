import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { stat } from 'node:fs/promises';

/**
 * Excel SET_256–259: Employees import screen and Download Template.
 * This test DOES NOT upload, import, or alter employee records.
 * SET_260–262 (populate template and import employee data) remain separate.
 */
test('SET-IMPORT-TEMPLATE | SET_256–259 | Employee import template can be downloaded', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/employees', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Employees', exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Import records/i }).click();
  await expect(page.getByRole('heading', { name: 'Import Employee Records' })).toBeVisible();

  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download template/i }).click();
  const downloaded = await downloadEvent;

  expect(
    downloaded.suggestedFilename(),
    'Import template must be a usable spreadsheet or delimited file',
  ).toMatch(/\.(csv|xlsx|xls)$/i);

  const destination = await downloaded.path();
  expect(destination, 'Download must complete without cancellation').not.toBeNull();
  const file = await stat(destination!);
  expect(file.size, 'Downloaded import template must not be empty').toBeGreaterThan(100);
});
