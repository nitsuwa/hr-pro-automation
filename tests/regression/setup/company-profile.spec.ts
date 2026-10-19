import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';
import { SettingsPage } from '../../../playwright/pages/settings.page';

/**
 * Excel SET_172–176: company profile.
 * This test covers the text fields: name, code and address.
 * Employer registration numbers and file/logo upload remain for a separate,
 * explicitly verified case (the inventory does not describe upload behavior).
 */
test('SET-COMPANY-001 | SET_172–176 | Company identity fields save and persist after reload', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await new SettingsPage(page).openGeneral();

  async function openCompany() {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await page.getByRole('button', { name: 'Organization Setup', exact: true }).click();
    await page.getByRole('button', { name: 'Company', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Company profile' })).toBeVisible();
  }

  const companyName = page.getByLabel('Company name', { exact: true });
  const companyCode = page.getByLabel('Company code', { exact: true });
  const address = page.getByLabel('Address', { exact: true });
  const save = page.getByRole('button', { name: 'Save Changes', exact: true });

  await openCompany();
  const original = {
    name: await companyName.inputValue(),
    code: await companyCode.inputValue(),
    address: await address.inputValue(),
  };

  const desired = {
    name: 'QA Test Corporation',
    code: 'QATEST',
    address: 'QA Testing Address - Non Production',
  };

  // A new Playwright browser context is created for each test by default.
  // Restore the initial values anyway, to support future changes to storage policy.
  try {
    await companyName.fill(desired.name);
    await companyCode.fill(desired.code);
    await address.fill(desired.address);
    await save.click();

    await page.reload({ waitUntil: 'domcontentloaded' });
    await openCompany();

    await expect(companyName).toHaveValue(desired.name);
    await expect(companyCode).toHaveValue(desired.code);
    await expect(address).toHaveValue(desired.address);
  } finally {
    await openCompany();
    await companyName.fill(original.name);
    await companyCode.fill(original.code);
    await address.fill(original.address);
    await save.click();
  }
});
