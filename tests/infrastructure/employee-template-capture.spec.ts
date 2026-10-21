import { test, expect } from '../../playwright/fixtures/hrpro.fixture';
import { mkdirSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * READ ONLY: captures the official blank Employee Import template into
 * qa-artifacts so we can author a real SET_260–262 upload/import test.
 * Does NOT upload or create any employee records.
 */
test('INVENTORY-V7 | Save a copy of blank employee import template', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/employees', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /Import records/i }).click();
  await expect(page.getByRole('heading', { name: 'Import Employee Records' })).toBeVisible();

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Download template/i }).click();
  const download = await downloadPromise;

  const match = download.suggestedFilename().match(/\.(csv|xlsx|xls)$/i);
  expect(match, 'Template should be CSV or Excel').not.toBeNull();
  const ext = match![0].toLowerCase();

  const dir = resolve(process.cwd(), 'qa-artifacts');
  mkdirSync(dir, { recursive: true });
  const filePath = resolve(dir, 'employee-import-template' + ext);
  await download.saveAs(filePath);

  expect((await stat(filePath)).size, 'Template must contain data').toBeGreaterThan(100);
  console.log('Blank import template saved to: qa-artifacts/employee-import-template' + ext);
  console.log('Upload this blank template (no employee data) to QA documentation chat.');
});
