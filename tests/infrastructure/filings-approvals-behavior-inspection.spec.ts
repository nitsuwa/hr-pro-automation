import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_087 | Inspect filing/approval enforcement in Review',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      120_000
    );

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    /*
     * =====================================================
     * ENSURE SET_087 SETTINGS ARE ENABLED
     * =====================================================
     */

    await settings.openGeneral();

    const overtime =
      page.getByRole(
        'checkbox',
        {
          name:
            /Overtime — Outlier OT/i,
        }
      );

    const timekeepingAdjustments =
      page.getByRole(
        'checkbox',
        {
          name:
            /Timekeeping Adjustments — A missing-punch fix/i,
        }
      );

    const leave =
      page.getByRole(
        'checkbox',
        {
          name:
            /Leave — Reclassifying an absence as leave/i,
        }
      );

    if (
      !(await overtime.isChecked())
    ) {
      await overtime.check();
    }

    if (
      !(
        await timekeepingAdjustments
          .isChecked()
      )
    ) {
      await timekeepingAdjustments.check();
    }

    if (
      !(await leave.isChecked())
    ) {
      await leave.check();
    }

    await expect(
      overtime
    ).toBeChecked();

    await expect(
      timekeepingAdjustments
    ).toBeChecked();

    await expect(
      leave
    ).toBeChecked();

    /*
     * =====================================================
     * INSPECT APPROVALS TAB
     * =====================================================
     */

    await page.goto(
      '/time-attendance',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const approvalsButton =
      page.getByRole(
        'button',
        {
          name:
            'Approvals',
          exact:
            true,
        }
      );

    await expect(
      approvalsButton
    ).toBeVisible();

    await approvalsButton.click();

    await page.waitForTimeout(
      300
    );

    const approvalsSnapshot =
      await page.evaluate(() => {
        const clean = (
          value:
            string | null
        ) =>
          (
            value ?? ''
          )
            .replace(
              /\s+/g,
              ' '
            )
            .trim();

        return {
          headings:
            Array.from(
              document.querySelectorAll(
                'h1, h2, h3'
              )
            )
              .map(
                element =>
                  clean(
                    element.textContent
                  )
              )
              .filter(
                Boolean
              ),

          buttons:
            Array.from(
              document.querySelectorAll(
                'button'
              )
            )
              .map(
                element =>
                  clean(
                    element.textContent
                  )
              )
              .filter(
                Boolean
              ),

          text:
            clean(
              document.body.innerText
            ).slice(
              0,
              12000
            ),
        };
      });

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_087 — APPROVALS TAB'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nHEADINGS:'
    );

    console.log(
      approvalsSnapshot.headings
    );

    console.log(
      '\nBUTTONS:'
    );

    console.log(
      approvalsSnapshot.buttons
    );

    console.log(
      '\nPAGE TEXT:'
    );

    console.log(
      approvalsSnapshot.text
    );

    /*
     * =====================================================
     * CREATE A SIMPLE REVIEW BATCH
     * =====================================================
     *
     * We use a seeded employee only to inspect
     * whether direct DTR adjustment controls are
     * still available while filing/approval is
     * required.
     */

    await page.goto(
      '/timesheet',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const payrollDate =
      page.getByLabel(
        'Payroll date',
        {
          exact:
            true,
        }
      );

    await expect(
      payrollDate
    ).toBeVisible();

    await payrollDate.fill(
      '2026-09-20'
    );

    const batchName =
      page.getByLabel(
        /^Batch name/
      );

    await batchName.fill(
      'SET087_Filing_Approvals'
    );

    const search =
      page.getByLabel(
        'Search',
        {
          exact:
            true,
        }
      );

    await search.fill(
      'Juan Dela Cruz'
    );

    const employeeRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      employeeRow
    ).toBeVisible();

    const employeeCheckbox =
      employeeRow.locator(
        'input[type="checkbox"]'
      );

    await employeeCheckbox.check();

    await expect(
      employeeCheckbox
    ).toBeChecked();

    const reviewButton =
      page.getByRole(
        'button',
        {
          name:
            'Review attendance →',
          exact:
            true,
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
          exact:
            true,
        }
      );

    await expect(
      submitToReview
    ).toBeVisible();

    await submitToReview.click();

    /*
     * =====================================================
     * OPEN EMPLOYEE REVIEW DETAILS
     * =====================================================
     */

    const reviewRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      reviewRow
    ).toBeVisible({
      timeout:
        15_000,
    });

    await reviewRow.click();

    await page.waitForTimeout(
      300
    );

    const reviewSnapshot =
      await page.evaluate(() => {
        const clean = (
          value:
            string | null
        ) =>
          (
            value ?? ''
          )
            .replace(
              /\s+/g,
              ' '
            )
            .trim();

        const visible = (
          element:
            Element
        ) => {
          const html =
            element as HTMLElement;

          const style =
            window.getComputedStyle(
              html
            );

          return (
            style.display !==
              'none' &&
            style.visibility !==
              'hidden'
          );
        };

        const buttons =
          Array.from(
            document.querySelectorAll(
              'button'
            )
          )
            .filter(
              visible
            )
            .map(
              element => ({
                text:
                  clean(
                    element.textContent
                  ),

                title:
                  element.getAttribute(
                    'title'
                  ),

                disabled:
                  (
                    element as
                      HTMLButtonElement
                  ).disabled,
              })
            )
            .filter(
              item =>
                item.text
            );

        const inputs =
          Array.from(
            document.querySelectorAll(
              'input, select, textarea'
            )
          )
            .filter(
              visible
            )
            .map(
              element => {
                const input =
                  element as
                    HTMLInputElement;

                return {
                  tag:
                    element.tagName,

                  type:
                    input.type ??
                    null,

                  value:
                    input.value ??
                    null,

                  disabled:
                    input.disabled,

                  ariaLabel:
                    element.getAttribute(
                      'aria-label'
                    ),
                };
              }
            );

        return {
          headings:
            Array.from(
              document.querySelectorAll(
                'h1, h2, h3, h4'
              )
            )
              .filter(
                visible
              )
              .map(
                element =>
                  clean(
                    element.textContent
                  )
              )
              .filter(
                Boolean
              ),

          buttons,

          inputs,

          text:
            clean(
              document.body.innerText
            ).slice(
              0,
              15000
            ),
        };
      });

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_087 — EMPLOYEE REVIEW DETAILS'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nHEADINGS:'
    );

    console.log(
      reviewSnapshot.headings
    );

    console.log(
      '\nVISIBLE BUTTONS:'
    );

    console.log(
      reviewSnapshot.buttons
    );

    console.log(
      '\nVISIBLE INPUTS:'
    );

    console.log(
      reviewSnapshot.inputs
    );

    console.log(
      '\nPAGE TEXT:'
    );

    console.log(
      reviewSnapshot.text
    );

    /*
     * =====================================================
     * POLICY STORAGE
     * =====================================================
     */

    const approvalPolicy =
      await page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem(
              'hrpro:approvalPolicy'
            ) ?? '{}'
          )
      );

    console.log(
      '\nAPPROVAL POLICY:'
    );

    console.log(
      approvalPolicy
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * We will use this output to determine whether
     * SET_087 truly prevents direct DTR changes and
     * routes Overtime, Timekeeping Adjustments and
     * Leave through the Approvals workflow.
     */
  }
);
