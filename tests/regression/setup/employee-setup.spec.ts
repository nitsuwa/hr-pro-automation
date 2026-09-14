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
      'SET-EMP-001 | SET_016-021 | Employee ID is automatically generated when Auto mode is enabled',
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

        /*
         * Explicitly use Auto mode.
         */
        await settings.openGeneral();

        await settings.employeeIdMode
          .selectOption('auto');

        await expect(
          settings.employeeIdMode
        ).toHaveValue('auto');

        await employees.open();

        await employees.openEnrollment();

        /*
         * HR PRO tells us what the next ID
         * should be through the placeholder.
         *
         * Example:
         * Leave blank to auto-generate (E-0013)
         */
        const placeholder =
          await employees.employeeIdInput
            .getAttribute('placeholder');

        const expectedId =
          placeholder?.match(
            /\(([^)]+)\)/
          )?.[1];

        expect(expectedId).toBeTruthy();

        const employeeName =
          'PW Auto ID Employee';

        await employees.fullNameInput.fill(
          employeeName
        );

        await employees.monthlyRateInput.fill(
          '22000'
        );

        await employees.hireDateInput.fill(
          '2026-09-01'
        );

        /*
         * Deliberately leave Employee ID blank.
         */
        await employees.enrollButton.click();

        await expect(
          page.getByText(employeeName, {
            exact: true,
          })
        ).toBeVisible();

        const employee =
          await employees.getEmployeeByName(
            employeeName
          );

        expect(employee).not.toBeNull();

        expect(employee.id).toBe(
          expectedId
        );

        expect(employee.id).toMatch(
          /^E-\d{4}$/
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

        expect(employee).not.toBeNull();

        expect(employee.id).toBe(
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