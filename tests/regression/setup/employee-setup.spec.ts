import {
  test,
  expect,
} from '../../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../../playwright/pages/settings.page';
import { EmployeesPage } from '../../../playwright/pages/employees.page';

test.describe(
  'HR PRO Employee Setup Behavior',
  () => {
    test(
      'SET-EMP-001 | SET_016-021 | Auto-generated Employee ID pattern applies and generated IDs are unique',
      async ({
        page,
        loginAs,
      }) => {
        /*
         * SET_016
         * Login with Organizational Setup access.
         */
        await loginAs(
          'systemAdmin'
        );

        const settings =
          new SettingsPage(page);

        const employees =
          new EmployeesPage(page);

        /*
         * SET_017-019
         * Open Organizational Setup > General
         * and reach the Employee ID settings.
         */
        await settings.openGeneral();

        /*
         * SET_020
         * Select "Auto-generate from a pattern".
         */
        await settings.employeeIdMode
          .selectOption('auto');

        await expect(
          settings.employeeIdMode
        ).toHaveValue('auto');

        /*
         * Excel expected result:
         * Prefix, Separator, Include Year,
         * and Number Length fields should appear.
         */
        await expect(
          settings.employeeIdPrefix
        ).toBeVisible();

        await expect(
          settings.employeeIdSeparator
        ).toBeVisible();

        await expect(
          settings.employeeIdYear
        ).toBeVisible();

        await expect(
          settings.employeeIdNumberLength
        ).toBeVisible();

       await settings.employeeIdPrefix.fill(
          'AUTO'
        );

        await settings.employeeIdNumberLength
          .selectOption('5');

        await expect(
          settings.employeeIdPrefix
        ).toHaveValue('AUTO');

        await expect(
          settings.employeeIdNumberLength
        ).toHaveValue('5');

        /*
        * HR PRO auto-saves the Employee ID pattern.
        *
        * Move focus away from the last field so the UI
        * can finish committing the change before we
        * leave the Settings page.
        */
        /*
        
        * SET_021
        * Save the configured Employee ID format.
        */
        await settings.employeeIdSaveFormatButton.click();

        /*
        * Confirm that HR PRO saved the format
        * before creating an employee.
        */
        await expect
          .poll(async () => {
            return await page.evaluate(() => {
              const raw = localStorage.getItem(
                'hrpro:employeeIdPolicy'
              );

              if (!raw) {
                return null;
              }

              const policy = JSON.parse(raw);

              return {
                prefix: policy.parts?.prefix,
                digits: policy.parts?.digits,
              };
            });
          })
          .toEqual({
            prefix: 'AUTO',
            digits: 5,
          });

        /*
         * Create the first employee.
         *
         * Employee ID is deliberately left blank
         * because HR PRO should generate it.
         */
        const firstEmployeeName =
          'PW Auto ID Employee A';

        await employees.enrollMinimalEmployee({
          name: firstEmployeeName,
          monthlyRate: '22000',
          hireDate: '2026-09-01',
        });

        const firstEmployee =
          await employees.getEmployeeByName(
            firstEmployeeName
          );

        expect(
          firstEmployee
        ).not.toBeNull();

        /*
         * The configured prefix and number length
         * should actually be used when the employee
         * account is created.
         *
         * Example:
         * AUTO-00013
         */
        expect(
          firstEmployee.id
        ).toMatch(
          /^AUTO-\d{5}$/
        );

        /*
         * Create another employee so we can verify
         * the Excel requirement that Employee IDs
         * should never be duplicated.
         */
        const secondEmployeeName =
          'PW Auto ID Employee B';

        await employees.enrollMinimalEmployee({
          name: secondEmployeeName,
          monthlyRate: '22000',
          hireDate: '2026-09-01',
        });

        const secondEmployee =
          await employees.getEmployeeByName(
            secondEmployeeName
          );

        expect(
          secondEmployee
        ).not.toBeNull();

        expect(
          secondEmployee.id
        ).toMatch(
          /^AUTO-\d{5}$/
        );

        /*
         * Excel expected result:
         * Employee ID should never be duplicated.
         */
        expect(
          secondEmployee.id
        ).not.toBe(
          firstEmployee.id
        );
      }
    );

    test(
      'SET-EMP-002 | SET_022-026 | Manually entered Employee ID is saved',
      async ({
        page,
        loginAs,
      }) => {
        await loginAs(
          'systemAdmin'
        );

        const settings =
          new SettingsPage(page);

        const employees =
          new EmployeesPage(page);

        await settings.openGeneral();

        await settings.employeeIdMode
          .selectOption('manual');

        await expect(
          settings.employeeIdMode
        ).toHaveValue('manual');

        const employeeName =
          'PW Manual ID Employee';

        const manualId =
          'PW-MANUAL-001';

        await employees.enrollMinimalEmployee({
          name: employeeName,
          employeeId: manualId,
          monthlyRate: '25000',
        });

        const employee =
          await employees.getEmployeeByName(
            employeeName
          );

        expect(
          employee
        ).not.toBeNull();

        expect(
          employee.id
        ).toBe(
          manualId
        );
      }
    );

    test(
      'SET-EMP-003 | SET_027-031 | Employee uses company default shift when no explicit shift is assigned',
      async ({
        page,
        loginAs,
      }) => {
        await loginAs(
          'systemAdmin'
        );

        const settings =
          new SettingsPage(page);

        const employees =
          new EmployeesPage(page);

        await settings.openGeneral();

        /*
         * Make sure enrollment uses Auto ID.
         *
         * This is important because Manual mode
         * requires Employee ID*.
         */
        await settings.employeeIdMode
          .selectOption('auto');

        await settings.companyDefaultShift
          .selectOption(
            'SHIFT-0002'
          );

        await expect(
          settings.companyDefaultShift
        ).toHaveValue(
          'SHIFT-0002'
        );

        const employeeName =
          'PW Default Shift Employee';

        await employees.enrollMinimalEmployee({
          name: employeeName,
        });

        const shiftResult =
          await page.evaluate(
            (name) => {
              const employees =
                JSON.parse(
                  localStorage.getItem(
                    'hrpro:employees'
                  ) ?? '[]'
                );

              const employee =
                employees.find(
                  (item: {
                    name?: string;
                  }) =>
                    item.name === name
                );

              if (!employee) {
                return null;
              }

              const assignments =
                JSON.parse(
                  localStorage.getItem(
                    'hrpro:shiftAssignments'
                  ) ?? '{}'
                );

              const defaultShiftId =
                JSON.parse(
                  localStorage.getItem(
                    'hrpro:defaultShiftId'
                  ) ?? 'null'
                );

              const templates =
                JSON.parse(
                  localStorage.getItem(
                    'hrpro:shiftTemplates'
                  ) ?? '[]'
                );

              const explicitShiftId =
                assignments[
                  employee.id
                ] ?? null;

              const effectiveShiftId =
                explicitShiftId ??
                defaultShiftId;

              const effectiveShift =
                templates.find(
                  (shift: {
                    id?: string;
                  }) =>
                    shift.id ===
                    effectiveShiftId
                ) ?? null;

              return {
                employeeId:
                  employee.id,

                explicitShiftId,

                defaultShiftId,

                effectiveShiftId,

                effectiveShiftName:
                  effectiveShift?.name ??
                  null,
              };
            },
            employeeName
          );

        expect(
          shiftResult
        ).not.toBeNull();

        /*
         * No employee-specific assignment exists,
         * so HR PRO should fall back to the company
         * default shift.
         */
        expect(
          shiftResult!.explicitShiftId
        ).toBeNull();

        expect(
          shiftResult!.defaultShiftId
        ).toBe('SHIFT-0002');

        expect(
          shiftResult!.effectiveShiftId
        ).toBe('SHIFT-0002');

        expect(
          shiftResult!.effectiveShiftName
        ).toBe('Morning Shift');
      }
    );
  }
);