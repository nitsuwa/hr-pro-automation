import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';
import { EmployeesPage } from '../../playwright/pages/employees.page';

test(
  'TEMP | Inspect complete Weekly payroll lifecycle with final approver',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(120_000);

    /*
     * =====================================================
     * PART 1 — LOGIN AS SYSTEM ADMIN
     * =====================================================
     */

    await loginAs('systemAdmin');

    const settings =
      new SettingsPage(page);

    const employees =
      new EmployeesPage(page);

    /*
     * =====================================================
     * PART 2 — CONFIGURE EVERY PAY WEEK
     * =====================================================
     */

    await settings.openGeneral();

    await settings
      .selectContributionTiming(
        'every-pay-week'
      );

    const contributionPolicy =
      await page.evaluate(() =>
        JSON.parse(
          localStorage.getItem(
            'hrpro:contributionPolicy'
          ) ?? '{}'
        )
      );

    expect(
      contributionPolicy.timing
    ).toBe('SPLIT');

    await settings.employeeIdMode
      .selectOption('auto');

    /*
     * =====================================================
     * PART 3 — CREATE CONTROLLED WEEKLY EMPLOYEE
     * =====================================================
     */

    await employees.open();

    await employees.openEnrollment();

    const employeeName =
      'PW Weekly Review Employee';

    await employees.fullNameInput.fill(
      employeeName
    );

    await employees.monthlyRateInput.fill(
      '22000'
    );

    await page
      .getByLabel(/^Pay Schedule/)
      .selectOption('Weekly');

    const noAbsenceDeduction =
      page.getByRole(
        'checkbox',
        {
          name:
            /No absence deductions/i,
        }
      );

    await noAbsenceDeduction.check();

    await expect(
      noAbsenceDeduction
    ).toBeChecked();

    await employees.hireDateInput.fill(
      '2026-09-01'
    );

    await employees.enrollButton.click();

    await expect
      .poll(async () => {
        const savedEmployee =
          await employees.getEmployeeByName(
            employeeName
          );

        return savedEmployee !== null;
      })
      .toBe(true);

    console.log(
      '\n========== EMPLOYEE CREATED =========='
    );

    console.log(
      employeeName
    );

    /*
     * =====================================================
     * PART 4 — WEEK 1 TIMESHEET
     * =====================================================
     */

    await page.goto(
      '/timesheet',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    await page
      .getByRole(
        'button',
        {
          name:
            'September 1, 2026',
          exact: true,
        }
      )
      .click();

    await page
      .getByRole(
        'button',
        {
          name:
            'September 7, 2026',
          exact: true,
        }
      )
      .click();

    await page
      .getByRole(
        'button',
        {
          name:
            'Select dates',
          exact: true,
        }
      )
      .click();

    await expect
      .poll(async () => {
        return await page.evaluate(
          () => {
            const raw =
              localStorage.getItem(
                'hrpro:cutoff'
              );

            if (!raw) {
              return null;
            }

            const cutoff =
              JSON.parse(raw);

            return {
              from:
                cutoff.from,
              to:
                cutoff.to,
            };
          }
        );
      })
      .toEqual({
        from:
          '2026-09-01',
        to:
          '2026-09-07',
      });

    console.log(
      '\n========== WEEK 1 CUTOFF =========='
    );

    console.log(
      'September 1–7, 2026'
    );

    await page
      .getByLabel(
        'Payroll date',
        {
          exact: true,
        }
      )
      .fill(
        '2026-09-11'
      );

    await page
      .getByLabel(
        /^Batch name/
      )
      .fill(
        'PW_2026_09_Week1'
      );

    await page
      .getByLabel(
        'Search',
        {
          exact: true,
        }
      )
      .fill(
        employeeName
      );

    const timesheetEmployeeRow =
      page
        .locator('tr')
        .filter({
          hasText:
            employeeName,
        });

    await expect(
      timesheetEmployeeRow
    ).toBeVisible();

    const employeeCheckbox =
      timesheetEmployeeRow.locator(
        'input[type="checkbox"]'
      );

    await employeeCheckbox.check();

    await expect(
      employeeCheckbox
    ).toBeChecked();

    /*
     * =====================================================
     * PART 5 — REVIEW
     * =====================================================
     */

    const reviewButton =
      page.getByRole(
        'button',
        {
          name:
            'Review attendance →',
          exact: true,
        }
      );

    await expect(
      reviewButton
    ).toBeEnabled();

    await reviewButton.click();

    const submitToReview =
      page.getByRole(
        'button',
        {
          name:
            'Submit to Review',
          exact: true,
        }
      );

    await expect(
      submitToReview
    ).toBeVisible();

    await submitToReview.click();

    const reviewEmployeeRow =
      page
        .locator('tr')
        .filter({
          hasText:
            employeeName,
        });

    await expect(
      reviewEmployeeRow
    ).toBeVisible();

    console.log(
      '\n========== REVIEW =========='
    );

    console.log(
      (
        await reviewEmployeeRow
          .first()
          .innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
    );

    /*
     * =====================================================
     * PART 6 — SEND TO SMART PAY
     * =====================================================
     */

    const submitPayroll =
      page.getByRole(
        'button',
        {
          name:
            'Submit for payroll value check →',
          exact: true,
        }
      );

    await expect(
      submitPayroll
    ).toBeVisible();

    await submitPayroll.click();

    await expect(
      page.getByRole(
        'heading',
        {
          name:
            'Submit for payroll value check?',
          exact: true,
        }
      )
    ).toBeVisible();

    await page
      .getByRole(
        'button',
        {
          name:
            'Submit',
          exact: true,
        }
      )
      .click();

    await page.waitForTimeout(
      500
    );

    /*
     * Support both current and older
     * prototype navigation behavior.
     */
    const smartPayHeading =
      page.getByRole(
        'heading',
        {
          name:
            'Smart Pay',
          exact: true,
        }
      );

    if (
      await smartPayHeading.count() === 0
    ) {
      const goToPayrollValue =
        page.getByRole(
          'button',
          {
            name:
              'Go to Payroll Value →',
            exact: true,
          }
        );

      if (
        await goToPayrollValue.count() > 0
      ) {
        await goToPayrollValue.click();
      }
    }

    await expect(
      smartPayHeading
    ).toBeVisible({
      timeout:
        15_000,
    });

    /*
     * =====================================================
     * PART 7 — READ WEEK 1 CONTRIBUTIONS
     * =====================================================
     */

    const smartPayRow =
      page
        .locator('tr')
        .filter({
          hasText:
            employeeName,
        });

    await expect(
      smartPayRow
    ).toBeVisible();

    const expandEmployee =
      page.getByRole(
        'button',
        {
          name:
            new RegExp(
              employeeName,
              'i'
            ),
        }
      );

    await expect(
      expandEmployee
    ).toBeVisible();

    await expandEmployee.click();

    await page.waitForTimeout(
      300
    );

    const smartPayText =
      await page
        .locator('body')
        .innerText();

    console.log(
      '\n========== WEEK 1 CONTRIBUTIONS =========='
    );

    console.log(
      smartPayText.match(
        /SSS \(EE share\)[\s\S]*?Total deductions[\s\S]*?₱-[\d,.]+/i
      )?.[0] ??
        'Could not isolate contribution section.'
    );

    /*
     * =====================================================
     * PART 8 — SUBMIT FOR APPROVAL
     * =====================================================
     */

    const submitForApproval =
      page.getByRole(
        'button',
        {
          name:
            'Submit for approval →',
          exact: true,
        }
      );

    await expect(
      submitForApproval
    ).toBeVisible();

    await submitForApproval.click();

    /*
     * =====================================================
     * PART 9 — FIRST APPROVAL
     *
     * Current role-based setup:
     * Payroll Manager OR System Admin
     * may perform the first approval.
     *
     * We are using System Admin.
     * =====================================================
     */

    const firstApproveButton =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll →',
          exact: true,
        }
      );

    await expect(
      firstApproveButton
    ).toBeVisible({
      timeout:
        15_000,
    });

    await expect(
      firstApproveButton
    ).toBeEnabled();

    await firstApproveButton.click();

    await expect(
      page.getByRole(
        'heading',
        {
          name:
            'Approve this payroll?',
          exact: true,
        }
      )
    ).toBeVisible();

    const firstConfirmApprove =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll',
          exact: true,
        }
      );

    await expect(
      firstConfirmApprove
    ).toBeVisible();

    await firstConfirmApprove.click();

    /*
     * Confirm workflow moved from step 0
     * to step 1.
     */
    await expect
      .poll(async () => {
        return await page.evaluate(
          () => {
            const raw =
              localStorage.getItem(
                'hrpro:generated'
              );

            if (!raw) {
              return null;
            }

            const generated =
              JSON.parse(raw);

            return {
              currentStepIndex:
                generated
                  .workflow
                  ?.currentStepIndex,

              status:
                generated
                  .workflow
                  ?.status,

              historyLength:
                generated
                  .workflow
                  ?.history
                  ?.length,
            };
          }
        );
      })
      .toEqual({
        currentStepIndex:
          1,

        status:
          'In Progress',

        historyLength:
          1,
      });

    console.log(
      '\n========== FIRST APPROVAL COMPLETE =========='
    );

    console.log(
      'System Admin completed approval step 1.'
    );

    /*
     * =====================================================
     * PART 10 — SIGN OUT SYSTEM ADMIN
     * =====================================================
     */

    const signOutButton =
      page.getByRole(
        'button',
        {
          name:
            'Sign out',
          exact: true,
        }
      );

    await expect(
      signOutButton
    ).toBeVisible();

    await signOutButton.click();

    /*
     * =====================================================
     * PART 11 — LOGIN AS ADMIN
     * =====================================================
     *
     * IMPORTANT:
     *
     * Payroll Manager is NOT the final
     * approver in the current role-based
     * configuration.
     *
     * Current workflow:
     *
     * First:
     * Payroll Manager / System Admin
     *
     * Final release:
     * Admin / System Admin
     *
     * We therefore use the separate
     * "admin" demo account here.
     * =====================================================
     */

    await loginAs(
      'admin'
    );

    console.log(
      '\n========== SECOND USER =========='
    );

    console.log(
      'Logged in as Admin'
    );

    /*
     * =====================================================
     * PART 12 — RETURN TO PAYROLL REGISTER
     * =====================================================
     */

    await page.goto(
      '/payroll-report',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const finalReleaseButton =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll →',
          exact: true,
        }
      );

    await expect(
      finalReleaseButton
    ).toBeVisible({
      timeout:
        15_000,
    });

    const finalReleaseDisabled =
      await finalReleaseButton
        .isDisabled();

    const finalReleaseTitle =
      await finalReleaseButton
        .getAttribute(
          'title'
        );

    console.log(
      '\nFINAL APPROVER BUTTON DISABLED:'
    );

    console.log(
      finalReleaseDisabled
    );

    console.log(
      '\nFINAL APPROVER BUTTON TITLE:'
    );

    console.log(
      finalReleaseTitle
    );

    /*
     * Admin should qualify as the
     * FINAL_APPROVER / release role.
     */
    await expect(
      finalReleaseButton
    ).toBeEnabled();

    /*
     * =====================================================
     * PART 13 — SECOND / FINAL APPROVAL
     * =====================================================
     */

    await finalReleaseButton.click();

    await expect(
      page.getByRole(
        'heading',
        {
          name:
            'Approve this payroll?',
          exact: true,
        }
      )
    ).toBeVisible();

    const finalApproveButton =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll',
          exact: true,
        }
      );

    await expect(
      finalApproveButton
    ).toBeVisible();

    await finalApproveButton.click();

    await page.waitForTimeout(
      700
    );

    /*
     * =====================================================
     * PART 14 — INSPECT FINAL RESULT
     * =====================================================
     */

    console.log(
      '\n========== AFTER SECOND / FINAL APPROVAL =========='
    );

    console.log(
      '\nCURRENT URL:'
    );

    console.log(
      page.url()
    );

    const finalPageText =
      await page
        .locator('body')
        .innerText();

    console.log(
      '\nPAGE TEXT:'
    );

    console.log(
      finalPageText
        .replace(
          /\n{3,}/g,
          '\n\n'
        )
        .slice(
          0,
          15000
        )
    );

    /*
     * Inspect the final payroll workflow state.
     */
    const finalStorage =
      await page.evaluate(() => {
        const keys = [
          'hrpro:cutoff',
          'hrpro:payDate',
          'hrpro:payrollBatch',
          'hrpro:runStages',
          'hrpro:generated',
          'hrpro:payrollHistory',
        ];

        const result:
          Record<
            string,
            string | null
          > = {};

        for (
          const key of keys
        ) {
          result[key] =
            localStorage.getItem(
              key
            );
        }

        return result;
      });

    console.log(
      '\nFINAL PAYROLL STORAGE:'
    );

    console.log(
      JSON.stringify(
        finalStorage,
        null,
        2
      )
    );

    console.log(
      '\n=============================================\n'
    );
  }
);