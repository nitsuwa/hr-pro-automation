import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

/**
 * SET_172–176 (partial) — persist employer registration fields.
 *
 * The existing company-profile.spec.ts checks name, code and address.
 * This test covers the four additional registration fields confirmed by
 * the read-only Company UI inventory. Logo upload is deliberately excluded.
 *
 * IMPORTANT: Company profile is shared data. Run ONLY against an approved,
 * disposable QA tenant with explicit authorization to edit company-wide data.
 * Provide four approved, synthetic format-valid test values via environment
 * variables; no actual employer identifiers belong in this script.
 *
 * A finally block attempts to restore all four original values and verifies
 * restoration after reload. Network/process crashes can prevent that cleanup.
 * Keep a separate tenant snapshot/restore plan before enabling the test.
 */

const fields = [
  { label: 'SSS Employer No.', env: 'E2E_QA_SSS_EMPLOYER_NO' },
  { label: 'PhilHealth Employer No.', env: 'E2E_QA_PHILHEALTH_EMPLOYER_NO' },
  { label: 'Pag-IBIG (HDMF) Employer No.', env: 'E2E_QA_HDMF_EMPLOYER_NO' },
  { label: 'BIR TIN', env: 'E2E_QA_BIR_TIN' },
] as const;

test('SET-COMPANY-IDS | SET_172–176 | QA employer IDs save and restore', async ({ page, loginAs }) => {
  test.skip(
    (process.env.E2E_ENV ?? 'staging').toLowerCase() === 'production',
    'Never edit company-wide settings in production.',
  );

  test.skip(
    process.env.E2E_APPROVED_COMPANY_EDIT !== '1',
    'Requires an approved disposable test tenant and explicit E2E_APPROVED_COMPANY_EDIT=1.',
  );

  const desired = fields.map(({ label, env }) => ({
    label,
    value: (process.env[env] ?? '').trim(),
  }));
  test.skip(
    desired.some(({ value }) => !value),
    'Provide all four approved synthetic employer IDs via the E2E_QA_* environment variables.',
  );

  await loginAs('systemAdmin');

  async function openCompany() {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    const tab = page.locator('button.subtab').filter({ hasText: /^Company$/ });
    await expect(tab, 'The Company subtab must be unique').toHaveCount(1);
    await tab.click();
    await expect(page.getByRole('heading', { name: 'Company profile', exact: true }))
      .toBeVisible();
  }

  const fieldFor = (label: string) => page.getByLabel(label, { exact: true });
  const save = page.getByRole('button', { name: 'Save Changes', exact: true });

  await openCompany();

  // Capture original values only in process memory. Do not log them or write
  // sensitive registration data into an artifact.
  const original: { label: string; value: string }[] = [];
  for (const item of desired) {
    const input = fieldFor(item.label);
    await expect(input, item.label + ' should be editable').toBeEditable();
    original.push({ label: item.label, value: await input.inputValue() });
  }

  // A no-op save is not valid test evidence.
  test.skip(
    desired.every((item, i) => item.value === original[i].value),
    'Choose synthetic QA values different from the initial values.',
  );

  let mutationStarted = false;
  try {
    mutationStarted = true;
    for (const item of desired) {
      await fieldFor(item.label).fill(item.value);
    }
    await save.click();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await openCompany();
    for (const item of desired) {
      await expect(fieldFor(item.label), item.label + ' must persist after reload')
        .toHaveValue(item.value);
    }
  } finally {
    if (mutationStarted) {
      await openCompany();
      for (const item of original) {
        await fieldFor(item.label).fill(item.value);
      }
      await save.click();
      await page.reload({ waitUntil: 'domcontentloaded' });
      await openCompany();
      for (const item of original) {
        await expect(fieldFor(item.label), item.label + ' must be restored after the test')
          .toHaveValue(item.value);
      }
    }
  }
});
