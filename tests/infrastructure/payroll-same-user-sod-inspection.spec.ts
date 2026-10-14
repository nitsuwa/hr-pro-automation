import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_136-143 | Verify same user cannot approve and release payroll',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      180_000
    );

    /*
     * =====================================================
     * SET_136
     * ENSURE SEGREGATION OF DUTIES IS ENABLED
     * =====================================================
     */

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    await settings.openGeneral();

    const segregation =
      page.getByRole(
        'checkbox',
        {
          name:
            /Approval and release must be done by different people/i,
        }
      );

    await expect(
      segregation
    ).toBeVisible();

    if (
      !(await segregation.isChecked())
    ) {
      await segregation.check();
    }

    await expect(
      segregation
    ).toBeChecked();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_136 — SEGREGATION OF DUTIES'
    );

    console.log(
      '============================================'
    );

    console.log(
      await segregation.isChecked()
    );

    /*
     * =====================================================
     * SET_137
     * CREATE, COMPUTE, AND SUBMIT A PAYROLL RUN
     * =====================================================
     */

    await page.goto(
      '/timesheet',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const fetchButton =
      page.getByRole(
        'button',
        {
          name:
            /Fetch\/Upload LILO DTR/i,
        }
      );

    if (
      await fetchButton.count()
    ) {
      await fetchButton.click();

      const sampleButton =
        page.getByRole(
          'button',
          {
            name:
              /Load sample LILO logs/i,
          }
        );

      if (
        await sampleButton.count()
      ) {
        await sampleButton.click();

        await page.waitForTimeout(
          200
        );
      }

      await page.keyboard.press(
        'Escape'
      );
    }

    await page
      .getByLabel(
        'Payroll date',
        {
          exact:
            true,
        }
      )
      .fill(
        '2026-10-05'
      );

    await page
      .getByLabel(
        /^Batch name/
      )
      .fill(
        'SET136_143_Same_User_Block'
      );

    await page
      .getByLabel(
        'Search',
        {
          exact:
            true,
        }
      )
      .fill(
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

    await employeeRow
      .locator(
        'input[type="checkbox"]'
      )
      .check();

    await page
      .getByRole(
        'button',
        {
          name:
            'Review attendance →',
          exact:
            true,
        }
      )
      .click();

    await page
      .getByRole(
        'button',
        {
          name:
            'Submit to Review',
          exact:
            true,
        }
      )
      .click();

    const reviewRow =
      page
        .locator('tr')
        .filter({
          hasText:
            'Juan Dela Cruz',
        });

    await expect(
      reviewRow
    ).toBeVisible();

    const submitToSmartPay =
      page.getByRole(
        'button',
        {
          name:
            'Submit for payroll value check →',
          exact:
            true,
        }
      );

    await expect(
      submitToSmartPay
    ).toBeVisible();

    await submitToSmartPay.click();

    const confirmReview =
      page.getByRole(
        'button',
        {
          name:
            'Submit',
          exact:
            true,
        }
      );

    if (
      await confirmReview.count()
    ) {
      await confirmReview.click();
    }

    await page.waitForTimeout(
      200
    );

    if (
      !page.url().includes(
        '/payroll-value'
      )
    ) {
      const goPayroll =
        page.getByRole(
          'button',
          {
            name:
              'Go to Payroll Value →',
            exact:
              true,
          }
        );

      if (
        await goPayroll.count()
      ) {
        await goPayroll.click();
      } else {
        await page.goto(
          '/payroll-value',
          {
            waitUntil:
              'domcontentloaded',
          }
        );
      }
    }

    await page.waitForURL(
      /\/payroll-value/,
      {
        timeout:
          15_000,
      }
    );

    const submitForApproval =
      page.getByRole(
        'button',
        {
          name:
            'Submit for approval →',
          exact:
            true,
        }
      );

    await expect(
      submitForApproval
    ).toBeVisible();

    await submitForApproval.click();

    await page.waitForURL(
      /\/payroll-report/,
      {
        timeout:
          15_000,
      }
    );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_137 — PAYROLL SUBMITTED FOR APPROVAL'
    );

    console.log(
      '============================================'
    );

    console.log(
      await page.evaluate(
        () =>
          localStorage.getItem(
            'hrpro:generated'
          )
      )
    );

    /*
     * =====================================================
     * SET_138
     * LOGIN AS A USER AUTHORIZED TO APPROVE AND RELEASE
     *
     * System Admin is role-authorized for both steps.
     * =====================================================
     */

    await page
      .getByRole(
        'button',
        {
          name:
            'Sign out',
          exact:
            true,
        }
      )
      .click();

    await loginAs(
      'systemAdmin'
    );

    await page.goto(
      '/payroll-report',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const firstApprove =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll →',
          exact:
            true,
        }
      );

    await expect(
      firstApprove
    ).toBeVisible();

    await expect(
      firstApprove
    ).toBeEnabled();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_138 — SYSTEM ADMIN CAN ACCESS RUN'
    );

    console.log(
      '============================================'
    );

    console.log(
      (
        await page
          .locator('body')
          .innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
        .slice(
          0,
          7000
        )
    );

    /*
     * =====================================================
     * SET_139
     * SAME USER PERFORMS FIRST APPROVAL
     * =====================================================
     */

    await firstApprove.click();

    const firstConfirm =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll',
          exact:
            true,
        }
      );

    await expect(
      firstConfirm
    ).toBeVisible();

    await firstConfirm.click();

    await page.waitForTimeout(
      250
    );

    const afterFirstApproval =
      await page.evaluate(
        () => {
          const raw =
            localStorage.getItem(
              'hrpro:generated'
            );

          return raw
            ? JSON.parse(raw)
            : null;
        }
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_139 — AFTER SAME USER APPROVES'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        {
          stage:
            afterFirstApproval?.stage,

          workflow:
            afterFirstApproval?.workflow,

          releasedAt:
            afterFirstApproval?.releasedAt,
        },
        null,
        2
      )
    );

    /*
     * =====================================================
     * SET_140-141
     * SAME USER MUST NOT BE ABLE TO RELEASE
     * =====================================================
     */

    const releaseSameUser =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll →',
          exact:
            true,
        }
      );

    await expect(
      releaseSameUser
    ).toBeVisible();

    const sameUserDisabled =
      await releaseSameUser.isDisabled();

    const sameUserTitle =
      await releaseSameUser.getAttribute(
        'title'
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_140-141 — SAME USER RELEASE CONTROL'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        {
          disabled:
            sameUserDisabled,

          title:
            sameUserTitle,

          text:
            await releaseSameUser.innerText(),
        },
        null,
        2
      )
    );

    /*
     * Hard safety assertion for the Excel requirement:
     * the same person must not be able to perform release.
     */
    expect(
      sameUserDisabled
    ).toBe(true);

    /*
     * =====================================================
     * SET_142
     * DIFFERENT AUTHORIZED ADMIN ACCESSES THE RUN
     * =====================================================
     */

    await page
      .getByRole(
        'button',
        {
          name:
            'Sign out',
          exact:
            true,
        }
      )
      .click();

    await loginAs(
      'admin'
    );

    await page.goto(
      '/payroll-report',
      {
        waitUntil:
          'domcontentloaded',
      }
    );

    const releaseDifferentUser =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll →',
          exact:
            true,
        }
      );

    await expect(
      releaseDifferentUser
    ).toBeVisible();

    await expect(
      releaseDifferentUser
    ).toBeEnabled();

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_142 — DIFFERENT ADMIN CAN ACCESS RUN'
    );

    console.log(
      '============================================'
    );

    console.log(
      (
        await page
          .locator('body')
          .innerText()
      )
        .replace(
          /\s+/g,
          ' '
        )
        .trim()
        .slice(
          0,
          7000
        )
    );

    /*
     * =====================================================
     * SET_143
     * DIFFERENT ADMIN RELEASES THE PAYROLL
     * =====================================================
     */

    await releaseDifferentUser.click();

    const finalConfirm =
      page.getByRole(
        'button',
        {
          name:
            'Approve payroll',
          exact:
            true,
        }
      );

    await expect(
      finalConfirm
    ).toBeVisible();

    await finalConfirm.click();

    await page.waitForTimeout(
      250
    );

    const finalState =
      await page.evaluate(
        () => {
          const generatedRaw =
            localStorage.getItem(
              'hrpro:generated'
            );

          const stagesRaw =
            localStorage.getItem(
              'hrpro:runStages'
            );

          const historyRaw =
            localStorage.getItem(
              'hrpro:payrollHistory'
            );

          return {
            generated:
              generatedRaw
                ? JSON.parse(
                    generatedRaw
                  )
                : null,

            runStages:
              stagesRaw
                ? JSON.parse(
                    stagesRaw
                  )
                : null,

            payrollHistory:
              historyRaw
                ? JSON.parse(
                    historyRaw
                  )
                : null,
          };
        }
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_143 — FINAL RELEASE BY DIFFERENT ADMIN'
    );

    console.log(
      '============================================'
    );

    console.log(
      JSON.stringify(
        {
          stage:
            finalState
              .generated
              ?.stage,

          workflow:
            finalState
              .generated
              ?.workflow,

          releasedAt:
            finalState
              .generated
              ?.releasedAt,

          runStages:
            finalState
              .runStages,

          payrollHistory:
            finalState
              .payrollHistory,
        },
        null,
        2
      )
    );

    console.log(
      '\n============================================\n'
    );
  }
);
