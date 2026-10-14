import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_110 | Inspect how LILO-approved overtime is represented in Review',
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
     * SET_109 — ENABLE LILO APPROVAL MODE
     * =====================================================
     */

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

    await expect(
      liloApproved
    ).toBeChecked();

    /*
     * =====================================================
     * CREATE TWO CONTROLLED OT DAYS IN DTR
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

    await expect(
      fetchButton
    ).toBeVisible();

    await fetchButton.click();

    const sampleButton =
      page.getByRole(
        'button',
        {
          name:
            /Load sample LILO logs/i,
        }
      );

    await expect(
      sampleButton
    ).toBeVisible();

    await sampleButton.click();

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

      localStorage.setItem(
        'hrpro:otApprovals',
        '{}'
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
        'SET110_LILO_Authorized_Inspection'
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
     * =====================================================
     * INSPECT SEP 16 + SEP 17 ROW CONTROLS
     * =====================================================
     */

    for (
      const dateLabel of [
        'Sep 16',
        'Sep 17',
      ]
    ) {
      const row =
        page.getByRole(
          'row',
          {
            name:
              new RegExp(
                `^${dateLabel}`
              ),
          }
        );

      await expect(
        row
      ).toBeVisible();

      const rowText =
        (
          await row.innerText()
        )
          .replace(
            /\s+/g,
            ' '
          )
          .trim();

      const controls =
        await row.evaluate(
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

            return Array.from(
              element.querySelectorAll(
                'input, select, button'
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

                  text:
                    clean(
                      control.textContent
                    ),

                  className:
                    control.getAttribute(
                      'class'
                    ),
                };
              }
            );
          }
        );

      console.log(
        '\n============================================'
      );

      console.log(
        `SET_110 — ${dateLabel} ROW`
      );

      console.log(
        '============================================'
      );

      console.log(
        '\nROW TEXT:'
      );

      console.log(
        rowText
      );

      console.log(
        '\nCONTROLS:'
      );

      console.log(
        JSON.stringify(
          controls,
          null,
          2
        )
      );
    }

    const storage =
      await page.evaluate(
        () => ({
          approvalPolicy:
            localStorage.getItem(
              'hrpro:approvalPolicy'
            ),

          otApprovals:
            localStorage.getItem(
              'hrpro:otApprovals'
            ),
        })
      );

    console.log(
      '\nCURRENT STORAGE:'
    );

    console.log(
      JSON.stringify(
        storage,
        null,
        2
      )
    );

    console.log(
      '\n============================================\n'
    );

    /*
     * Inspection only.
     *
     * The previous test proved that raw DTR overtime is
     * still "unfiled" even when LILO approval mode is on.
     *
     * This inspection tells us which Review control the
     * prototype uses to represent/accept hours that were
     * already approved in LILO, so SET_110 can be tested
     * without inventing the wrong workflow.
     */
  }
);
