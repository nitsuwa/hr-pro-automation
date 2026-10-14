import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../playwright/pages/settings.page';

test(
  'TEMP | SET_088-096 | Inspect overtime approved in LILO workflow',
  async ({
    page,
    loginAs,
  }) => {
    test.setTimeout(
      120_000
    );

    /*
     * =====================================================
     * SET_088
     * LOGIN
     * =====================================================
     */

    await loginAs(
      'systemAdmin'
    );

    const settings =
      new SettingsPage(page);

    /*
     * =====================================================
     * SET_089-091
     * SETTINGS > ORGANIZATIONAL SETUP >
     * WHERE OVERTIME IS APPROVED
     * =====================================================
     */

    await settings.openGeneral();

    const liloApprovedCheckbox =
      page.getByRole(
        'checkbox',
        {
          name:
            /Overtime is approved in LILO before it reaches HR PRO/i,
        }
      );

    await expect(
      liloApprovedCheckbox
    ).toBeVisible();

    if (
      !(
        await liloApprovedCheckbox
          .isChecked()
      )
    ) {
      await liloApprovedCheckbox.check();
    }

    await expect(
      liloApprovedCheckbox
    ).toBeChecked();

    const policy =
      await page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem(
              'hrpro:approvalPolicy'
            ) ?? '{}'
          )
      );

    console.log(
      '\n============================================'
    );

    console.log(
      'SET_088-091 — LILO OVERTIME SETTING'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nOVERTIME APPROVED IN LILO:'
    );

    console.log(
      await liloApprovedCheckbox
        .isChecked()
    );

    console.log(
      '\nAPPROVAL POLICY:'
    );

    console.log(
      policy
    );

    /*
     * =====================================================
     * SET_092-094
     * INSPECT AVAILABLE LILO RETRIEVAL / SYNC PATH
     * =====================================================
     *
     * SET_092 and SET_093 happen inside LILO itself.
     * This inspection checks what HR PRO exposes
     * for retrieving/synchronizing that data.
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

    await page.waitForTimeout(
      250
    );

    const liloModal =
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

          buttons:
            Array.from(
              document.querySelectorAll(
                'button'
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
      'SET_092-094 — LILO RETRIEVAL UI'
    );

    console.log(
      '============================================'
    );

    console.log(
      '\nHEADINGS:'
    );

    console.log(
      liloModal.headings
    );

    console.log(
      '\nBUTTONS:'
    );

    console.log(
      liloModal.buttons
    );

    console.log(
      '\nPAGE TEXT:'
    );

    console.log(
      liloModal.text
    );

    /*
     * If the prototype offers its built-in
     * "Load sample LILO logs" action, use it
     * only as a prototype integration sample.
     *
     * We do NOT treat this as proof that an
     * employee really filed + approved OT in
     * the external LILO application.
     */

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
        350
      );

      const afterSample =
        await page.evaluate(() => {
          const keys = [
            'hrpro:dtrLogs',
            'hrpro:otApprovals',
            'hrpro:approvalPolicy',
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
        '\nAFTER LOADING SAMPLE LILO LOGS:'
      );

      console.log(
        JSON.stringify(
          afterSample,
          null,
          2
        )
      );

      const pageText =
        (
          await page
            .locator('body')
            .innerText()
        )
          .replace(
            /\s+/g,
            ' '
          )
          .trim();

      console.log(
        '\nTIMESHEET AFTER SAMPLE LOAD:'
      );

      console.log(
        pageText.slice(
          0,
          12000
        )
      );
    }

    /*
     * Close any open LILO modal/dropdown by
     * pressing Escape before navigating.
     */

    await page.keyboard.press(
      'Escape'
    );

    /*
     * =====================================================
     * SET_095-096
     * APPROVALS > OVERTIME
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

    const overtimeButton =
      page.getByRole(
        'button',
        {
          name:
            'Overtime',
          exact:
            true,
        }
      );

    await expect(
      overtimeButton
    ).toBeVisible();

    await overtimeButton.click();

    await page.waitForTimeout(
      250
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
                'h1, h2, h3, h4'
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
      'SET_095-096 — APPROVALS > OVERTIME'
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

    console.log(
      '\n============================================\n'
    );

    /*
     * IMPORTANT:
     *
     * SET_092 = filing OT inside external LILO.
     * SET_093 = approving OT inside external LILO.
     *
     * Those two cannot be claimed as tested by
     * HR PRO alone unless the external LILO system
     * is available to the automation.
     *
     * This test verifies the HR PRO-side setting
     * and inspects its LILO retrieval / authorized
     * overtime behavior for SET_094-096.
     */
  }
);
