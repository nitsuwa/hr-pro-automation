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

  test(
    'SET-CONFIG-003 | SET_016-021 | Auto-generated Employee ID configuration persists',
    async ({ page, loginAs }) => {
      test.fail(
        true,
          'Known HR PRO issue: Employee ID pattern fields do not persist after reload.'
      );
      
      await loginAs('systemAdmin');

      const settings = new SettingsPage(page);

      await settings.openGeneral();

      await settings.employeeIdMode.selectOption('auto');

      await settings.employeeIdPrefix.fill('AUTO');

      await settings.employeeIdSeparator.selectOption('/');

      await settings.employeeIdYear.selectOption('short');

      await settings.employeeIdNumberLength.selectOption('5');

      await settings.employeeIdIncludeMonth.check();

      await expect(
        settings.employeeIdMode
      ).toHaveValue('auto');

      await expect(
        settings.employeeIdPrefix
      ).toHaveValue('AUTO');

      await expect(
        settings.employeeIdSeparator
      ).toHaveValue('/');

      await expect(
        settings.employeeIdYear
      ).toHaveValue('short');

      await expect(
        settings.employeeIdNumberLength
      ).toHaveValue('5');

      await expect(
        settings.employeeIdIncludeMonth
      ).toBeChecked();

      await page.reload({
        waitUntil: 'domcontentloaded',
      });

      await settings.openGeneral();

      await expect(
        settings.employeeIdMode
      ).toHaveValue('auto');

      await expect(
        settings.employeeIdPrefix
      ).toHaveValue('AUTO');

      await expect(
        settings.employeeIdSeparator
      ).toHaveValue('/');

      await expect(
        settings.employeeIdYear
      ).toHaveValue('short');

      await expect(
        settings.employeeIdNumberLength
      ).toHaveValue('5');

      await expect(
        settings.employeeIdIncludeMonth
      ).toBeChecked();
    }
  );

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