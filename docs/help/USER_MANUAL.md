# HR PRO QA — User Manual

**Official guide:** https://hr-pro-automation.netlify.app

This document is a written reference. The website is the main step-by-step guide. HR PRO is the system being tested; **Playwright** runs browser checks; **GitHub** stores the code and its review history.

## Before you begin: what the folders mean

- `tests/smoke/` — basic login and navigation checks. Start with `navigation.spec.ts` and `SMOKE-018`.
- `tests/regression/setup/` — Setup feature tests for Departments, Employees, and other HR PRO settings. New Setup test files belong here.
- `tests/infrastructure/` — advanced UI inspection tools, not part of the standard test suite.
- `playwright/fixtures/` and `playwright/pages/` — shared login and reusable page actions.
- `package.json` — terminal commands; `playwright.config.ts` — browser and target URL.

[Visual folder map](https://hr-pro-automation.netlify.app/#structure)

## 1. Install

Install Git, Node.js, and Visual Studio Code. Get access to the repository and an approved HR PRO testing environment.

Open the VS Code terminal:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
npm ci
npx playwright install chromium
```

For an existing clone, first check your branch and working tree:

```powershell
git status
# Continue only with a clean working tree.
git switch main
git fetch origin
git merge --ff-only origin/main
```

Only switch or merge with a clean working tree. Do not reset or discard someone else's changes.

## 2. Run tests in UI Mode

```powershell
npx playwright test tests/smoke --ui --project=chromium
```

For a first read-only practice, run **SMOKE-018 (Settings)** from `navigation.spec.ts` in the test list. Click **▶ Run** and inspect **Actions**, **Before/After**, and **Errors**. See the [guided UI Mode exercise](https://hr-pro-automation.netlify.app/#run). For approved Setup checks: `npx playwright test tests/regression/setup --ui --project=chromium`.

**Check the test URL first.** The default URL is configured in `playwright.config.ts`; `E2E_BASE_URL` may override it. Use an approved non-production environment and fictional data for tests that change records.

### Pick the right command

Use `npx playwright` as the primary conventional Playwright CLI. The npm scripts in `package.json` remain optional shorthand. See the [copyable command reference](https://hr-pro-automation.netlify.app/#commands).

In VS Code's Terminal, inside the project folder:

| What you need | Command |
| --- | --- |
| All smoke tests in UI Mode | `npx playwright test tests/smoke --ui --project=chromium` |
| One test (`SMOKE-018`) | `npx playwright test tests/smoke/navigation.spec.ts --grep "SMOKE-018" --ui --project=chromium` |
| One Setup test file | `npx playwright test tests/regression/setup/department-creation.spec.ts --ui --project=chromium` |
| Setup regression group | `npx playwright test tests/regression/setup --ui --project=chromium` |
| Full standard suite in UI Mode | `npx playwright test tests/smoke tests/regression --ui --project=chromium` |
| Smoke tests in terminal (run immediately) | `npx playwright test tests/smoke --project=chromium` |
| Setup tests in terminal (run immediately) | `npx playwright test tests/regression/setup --project=chromium` |
| Full standard suite in terminal (run immediately) | `npx playwright test tests/smoke tests/regression --project=chromium` |

For **UI Mode**, select a test and click ▶. Use **Run all** only when you're ready to execute the whole displayed group. Full standard runs include Smoke + Regression, not Infrastructure scripts. For detailed screenshots, [see running tests](https://hr-pro-automation.netlify.app/#run-options).

**Caution:** Some Setup tests mutate data. Check `E2E_BASE_URL` or `playwright.config.ts` and run them only in an approved disposable non-production QA environment with fictional records. Follow any required mutation authorization.

## 3. Verify results

A green icon only says that the script's assertions passed. To verify the *requirement*:

1. Read the expected result.
2. Read the corresponding `expect(...)` assertion.
3. Inspect the test timeline and actual HR PRO screen.
4. If data is saved, verify it again after reopening or reloading.
5. Record the result and evidence in the [QA execution log](../QA_EXECUTION_LOG.md) or a GitHub issue.

For a red result, check whether the cause is test code, data/environment, or the actual HR PRO behavior. Never change a correct expected result merely to obtain a green test.

## 4. Understand the syntax

```ts
import { test, expect } from '../../../playwright/fixtures/hrpro.fixture';

test('QA-EXAMPLE | Settings opens', async ({ page, loginAs }) => {
  await loginAs('systemAdmin');
  await page.goto('/settings');
  const button = page.getByRole('button', { name: 'Organization Setup' });
  await expect(button).toBeVisible();
});
```

- `test(...)` names a test case.
- `page` is the browser tab.
- `await` waits for the action or check.
- `getByRole(...)` finds a visible user-interface control by role and name.
- `expect(...).toBeVisible()` checks the expected result.

That snippet checks navigation only. Tests of saved settings should also verify persistence using assertions such as `toHaveValue(...)` or `toHaveCount(...)`.

## 5. Add tests for existing or new features

1. Confirm the requirement, expected outcome, roles, and allowed fictional data.
2. Try the workflow manually in HR PRO and inspect actual labels.
3. Find a similar test in [Setup tests](../../tests/regression/setup/); reuse the login fixture and page objects.
4. Add a small test with meaningful `expect(...)` assertions.
5. Run the test in UI Mode, verify its result, and record evidence.
6. Propose the change with a GitHub pull request.

Use the [step-by-step creation tutorial](https://hr-pro-automation.netlify.app/#create) for both Excel cases and new features. It explains how to inspect controls, write assertions, and give AI a prompt based on real UI evidence. A person must review, run, and verify every generated test. Never share secrets or real employee records.

## 6. Share changes in GitHub

From a clean, updated `main`:

```powershell
git switch -c qa/employee-search
# Write and verify your test, then:
git add tests/regression/setup/employee-search.spec.ts
git commit -m "test: verify employee search"
git push -u origin qa/employee-search
```

Replace the example filename with your actual file. Open GitHub → **Compare & pull request**, target `main`, and ask for review.

## References

- [Playwright UI Mode](https://playwright.dev/docs/test-ui-mode)
- [Playwright locators](https://playwright.dev/docs/locators)
- [Playwright assertions](https://playwright.dev/docs/test-assertions)
- [HR PRO QA website](https://hr-pro-automation.netlify.app)
