import {
  test,
  expect,
} from '../../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../../playwright/pages/settings.page';

test.describe('HR PRO Organizational Setup - General', () => {
  test(
    'SET-CONFIG-001 | SET_004-009 | Pooled grace-period configuration persists',
    async ({ page, loginAs }) => {
      await loginAs('systemAdmin');

      const settings = new SettingsPage(page);

      await settings.openGeneral();

      await settings.gracePeriodMinutes.fill('20');

      await settings.pooledGraceMode.check();

      await expect(
        settings.gracePeriodMinutes
      ).toHaveValue('20');

      await expect(
        settings.pooledGraceMode
      ).toBeChecked();

      /*
       * Reloading proves that HR PRO actually saved
       * the configuration rather than only changing
       * the current UI.
       */
      await page.reload({
        waitUntil: 'domcontentloaded',
      });

      await settings.openGeneral();

      await expect(
        settings.gracePeriodMinutes
      ).toHaveValue('20');

      await expect(
        settings.pooledGraceMode
      ).toBeChecked();
    }
  );

  test(
    'SET-CONFIG-002 | SET_010-015 | Per-day grace-period configuration persists',
    async ({ page, loginAs }) => {
      await loginAs('systemAdmin');

      const settings = new SettingsPage(page);

      await settings.openGeneral();

      await settings.gracePeriodMinutes.fill('10');

      await settings.perDayGraceMode.check();

      await expect(
        settings.gracePeriodMinutes
      ).toHaveValue('10');

      await expect(
        settings.perDayGraceMode
      ).toBeChecked();

      await page.reload({
        waitUntil: 'domcontentloaded',
      });

      await settings.openGeneral();

      await expect(
        settings.gracePeriodMinutes
      ).toHaveValue('10');

      await expect(
        settings.perDayGraceMode
      ).toBeChecked();
    }
  );

  /*
   * SET_016-021 is intentionally NOT tested here anymore.
   *
   * The Excel scenario does not specifically require
   * reloading the Settings page and checking persistence.
   *
   * Its actual expected result is that the configured
   * auto-generated Employee ID pattern should be applied
   * when creating employees and that generated IDs
   * must not be duplicated.
   *
   * That complete scenario is now covered in:
   * employee-setup.spec.ts
   */

  test(
    'SET-CONFIG-004 | SET_022-026 | Manual Employee ID mode persists',
    async ({ page, loginAs }) => {
      await loginAs('systemAdmin');

      const settings = new SettingsPage(page);

      await settings.openGeneral();

      await settings.employeeIdMode.selectOption('manual');

      await expect(
        settings.employeeIdMode
      ).toHaveValue('manual');

      await page.reload({
        waitUntil: 'domcontentloaded',
      });

      await settings.openGeneral();

      await expect(
        settings.employeeIdMode
      ).toHaveValue('manual');
    }
  );

  test(
    'SET-CONFIG-005 | SET_027-031 | Default working schedule persists',
    async ({ page, loginAs }) => {
      await loginAs('systemAdmin');

      const settings = new SettingsPage(page);

      await settings.openGeneral();

      await settings.companyDefaultShift.selectOption(
        'SHIFT-0002'
      );

      await expect(
        settings.companyDefaultShift
      ).toHaveValue('SHIFT-0002');

      await page.reload({
        waitUntil: 'domcontentloaded',
      });

      await settings.openGeneral();

      await expect(
        settings.companyDefaultShift
      ).toHaveValue('SHIFT-0002');
    }
  );
});