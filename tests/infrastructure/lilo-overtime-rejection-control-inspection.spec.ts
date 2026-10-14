import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_111 | Inspect rejection control for LILO-approved overtime',
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

    await settings.openGeneral();

    const liloApproved =
      page.getByRole(
        'checkbox',
        {
          name:
            /Overtime is approved in LILO before it reaches HR PRO/i,
        }
      );

    await expect(
      liloApproved
    ).toBeVisible();

    if (
      !(await liloApproved.isChecked())
    ) {
      await liloApproved.check();
    }

    /*
     * Create two controlled overtime days.
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
            /Fetch\/Upload LILO DTR/i,
        }
      )
      .click();

    await page
      .getByRole(
        'button',
        {
          name:
            /Load sample LILO logs/i,
        }
      )
      .click();

    await page.waitForTimeout(
      250
    );

    await page.evaluate(() => {
      const logs =
        JSON.parse(
          localStorage.getItem(
            'hrpro:dtrLogs'
          ) ?? '{}'
        );

      if (!logs['E-0001']) {
        logs['E-0001'] = {};
      }

      logs['E-0001']['2026-09-16'] = {
        inMin: 480,
        outMin: 1140,
      };

      logs['E-0001']['2026-09-17'] = {
        inMin: 480,
        outMin: 1080,
      };

      localStorage.setItem(
        'hrpro:dtrLogs',
        JSON.stringify(logs)
      );
    });

    await page.keyboard.press(
      'Escape'
    );

    await page.reload({
      waitUntil:
        'domcontentloaded',
    });

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
        'SET111_Rejection_Control_Inspection'
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

    await reviewRow.click();

    /*
     * Accept Sep 16 and Sep 17 as already approved in LILO.
     */

    const sep16Input =
      page
        .getByRole(
          'row',
          {
            name:
              /^Sep 16/,
          }
        )
        .locator(
          'input.ot-approve-input'
        );

    await expect(
      sep16Input
    ).toBeVisible();

    await sep16Input.fill(
      '2.00'
    );

    await page.keyboard.press(
      'Tab'
    );

    await page.waitForTimeout(
      150
    );

    const sep17Input =
      page
        .getByRole(
          'row',
          {
            name:
              /^Sep 17/,
          }
        )
        .locator(
          'input.ot-approve-input'
        );

    await expect(
      sep17Input
    ).toBeVisible();

    await sep17Input.fill(
      '1.00'
    );

    await page.keyboard.press(
      'Tab'
    );

    await page.waitForTimeout(
      250
    );

    /*
     * Now inspect the approved Sep 17 row instead of assuming
     * the rejection action lives in Approvals > Overtime.
     */

    const approvedSep17 =
      page.getByRole(
        'row',
        {
          name:
            /^Sep 17/,
        }
      );

    await expect(
      approvedSep17
    ).toBeVisible();

    const rowInspection =
      await approvedSep17.evaluate(
        element => {
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
            text:
              clean(
                element.textContent
              ),

            html:
              (
                element as
                  HTMLElement
              ).outerHTML.slice(
                0,
                10000
              ),

            controls:
              Array.from(
                element.querySelectorAll(
                  'input, button, select, a'
                )
              ).map(
                control => {
                  const input =
                    control as
                      HTMLInputElement;

                  return {
                    tag:
                      control.tagName,

                    type:
                      input.type ??
                      null,

                    value:
                      input.value ??
                      null,

                    text:
                      clean(
                        control.textContent
                      ),

                    placeholder:
                      control.getAttribute(
                        'placeholder'
                      ),

                    ariaLabel:
                      control.getAttribute(
                        'aria-label'
                      ),

                    title:
                      control.getAttribute(
                        'title'
                      ),

                    className:
                      control.getAttribute(
                        'class'
                      ),
                  };
                }
              ),
          };
        }
      );

    const relatedStorage =
      await page.evaluate(() => {
        const result:
          Record<
            string,
            string | null
          > = {};

        for (
          let index = 0;
          index <
          localStorage.length;
          index++
        ) {
          const key =
            localStorage.key(
              index
            );

          if (
            key &&
            /ot|overtime|approval/i.test(
              key
            )
          ) {
            result[key] =
              localStorage.getItem(
                key
              );
          }
        }

        return result;
      });

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_111 — APPROVED SEP 17 ROW INSPECTION'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nROW:'
    );

    console.log(
      rowInspection.text
    );

    console.log(
      '\nCONTROLS:'
    );

    console.log(
      JSON.stringify(
        rowInspection.controls,
        null,
        2
      )
    );

    console.log(
      '\nRELATED LOCAL STORAGE:'
    );

    console.log(
      JSON.stringify(
        relatedStorage,
        null,
        2
      )
    );

    console.log(
      '\nROW HTML:'
    );

    console.log(
      rowInspection.html
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * Excel SET_111 says:
     * "Process another overtime record and mark it as
     * rejected from payroll."
     *
     * We are identifying the actual prototype control for
     * that rejection instead of assuming it must be under
     * Approvals > Overtime.
     */
  }
);
