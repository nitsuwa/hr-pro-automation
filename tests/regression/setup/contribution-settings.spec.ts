import {
  test,
  expect,
} from '../../../playwright/fixtures/hrpro.fixture';

import { SettingsPage } from '../../../playwright/pages/settings.page';

test.describe(
  'HR PRO Weekly Statutory Contribution Settings',
  () => {
    test(
      'SET-CONTRIB-001 | SET_032-042 | Every Pay Week configuration persists',
      async ({
        page,
        loginAs,
      }) => {
        await loginAs(
          'systemAdmin'
        );

        const settings =
          new SettingsPage(page);

        await settings.openGeneral();

        await settings
          .selectContributionTiming(
            'every-pay-week'
          );

        let policy =
          await page.evaluate(() =>
            JSON.parse(
              localStorage.getItem(
                'hrpro:contributionPolicy'
              ) ?? '{}'
            )
          );

        expect(
          policy.timing
        ).toBe('SPLIT');

        await page.reload({
          waitUntil:
            'domcontentloaded',
        });

        await settings.openGeneral();

        await expect(
          settings
            .contributionTimingRadios
            .nth(0)
        ).toBeChecked();

        policy =
          await page.evaluate(() =>
            JSON.parse(
              localStorage.getItem(
                'hrpro:contributionPolicy'
              ) ?? '{}'
            )
          );

        expect(
          policy.timing
        ).toBe('SPLIT');
      }
    );

    test(
      'SET-CONTRIB-002 | SET_043-055 | First Four Weeks configuration persists',
      async ({
        page,
        loginAs,
      }) => {
        await loginAs(
          'systemAdmin'
        );

        const settings =
          new SettingsPage(page);

        await settings.openGeneral();

        await settings
          .selectContributionTiming(
            'first-four-weeks'
          );

        let policy =
          await page.evaluate(() =>
            JSON.parse(
              localStorage.getItem(
                'hrpro:contributionPolicy'
              ) ?? '{}'
            )
          );

        expect(
          policy.timing
        ).toBe('UNTIL_PAID');

        await page.reload({
          waitUntil:
            'domcontentloaded',
        });

        await settings.openGeneral();

        await expect(
          settings
            .contributionTimingRadios
            .nth(1)
        ).toBeChecked();

        policy =
          await page.evaluate(() =>
            JSON.parse(
              localStorage.getItem(
                'hrpro:contributionPolicy'
              ) ?? '{}'
            )
          );

        expect(
          policy.timing
        ).toBe('UNTIL_PAID');
      }
    );

    test(
      'SET-CONTRIB-003 | SET_056-069 | Selected 2nd and 4th Pay Weeks persist',
      async ({
        page,
        loginAs,
      }) => {
        await loginAs(
          'systemAdmin'
        );

        const settings =
          new SettingsPage(page);

        await settings.openGeneral();

        await settings
          .selectContributionTiming(
            'selected-weeks'
          );

        await settings
          .setContributionWeeks([
            2,
            4,
          ]);

        let policy =
          await page.evaluate(() =>
            JSON.parse(
              localStorage.getItem(
                'hrpro:contributionPolicy'
              ) ?? '{}'
            )
          );

        expect(
          policy.timing
        ).toBe(
          'SELECTED_WEEKS'
        );

        expect(
          policy.weeks
        ).toEqual([
          2,
          4,
        ]);

        await page.reload({
          waitUntil:
            'domcontentloaded',
        });

        await settings.openGeneral();

        await expect(
          settings
            .contributionTimingRadios
            .nth(2)
        ).toBeChecked();

        await expect(
          settings
            .contributionWeekButton(
              2
            )
        ).toHaveAttribute(
          'aria-pressed',
          'true'
        );

        await expect(
          settings
            .contributionWeekButton(
              4
            )
        ).toHaveAttribute(
          'aria-pressed',
          'true'
        );

        await expect(
          settings
            .contributionWeekButton(
              1
            )
        ).toHaveAttribute(
          'aria-pressed',
          'false'
        );

        await expect(
          settings
            .contributionWeekButton(
              3
            )
        ).toHaveAttribute(
          'aria-pressed',
          'false'
        );

        await expect(
          settings
            .contributionWeekButton(
              5
            )
        ).toHaveAttribute(
          'aria-pressed',
          'false'
        );

        policy =
          await page.evaluate(() =>
            JSON.parse(
              localStorage.getItem(
                'hrpro:contributionPolicy'
              ) ?? '{}'
            )
          );

        expect(
          policy.weeks
        ).toEqual([
          2,
          4,
        ]);
      }
    );

    test(
      'SET-CONTRIB-004 | SET_070-082 | Last Pay Week configuration persists',
      async ({
        page,
        loginAs,
      }) => {
        await loginAs(
          'systemAdmin'
        );

        const settings =
          new SettingsPage(page);

        await settings.openGeneral();

        await settings
          .selectContributionTiming(
            'last-pay-week'
          );

        let policy =
          await page.evaluate(() =>
            JSON.parse(
              localStorage.getItem(
                'hrpro:contributionPolicy'
              ) ?? '{}'
            )
          );

        expect(
          policy.timing
        ).toBe(
          'DESIGNATED'
        );

        await page.reload({
          waitUntil:
            'domcontentloaded',
        });

        await settings.openGeneral();

        await expect(
          settings
            .contributionTimingRadios
            .nth(3)
        ).toBeChecked();

        policy =
          await page.evaluate(() =>
            JSON.parse(
              localStorage.getItem(
                'hrpro:contributionPolicy'
              ) ?? '{}'
            )
          );

        expect(
          policy.timing
        ).toBe(
          'DESIGNATED'
        );
      }
    );
  }
);