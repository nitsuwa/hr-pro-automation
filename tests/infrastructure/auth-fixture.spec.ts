import {
  test,
  expect,
} from '../../playwright/fixtures/hrpro.fixture';

test.describe('HR PRO Authentication Fixture', () => {
  test(
    'INFRA-003 | Reusable fixture can authenticate System Admin',
    async ({ loginAs }) => {
      const page = await loginAs('systemAdmin');

      await expect(
        page.getByText('Employees', {
          exact: true,
        }).first()
      ).toBeVisible();
    }
  );

  test(
    'INFRA-004 | Reusable fixture can authenticate Employee',
    async ({ loginAs }) => {
      const page = await loginAs('employee');

      /*
       * LoginPage already verifies that the Sign in
       * screen disappears successfully.
       *
       * Here we additionally make sure HR PRO remains
       * loaded after authentication.
       */
      await expect(page).not.toHaveURL(/login/i);
    }
  );
});