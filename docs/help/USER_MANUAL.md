# HR PRO QA — User Manual

**Official guide:** https://hr-pro-automation.netlify.app

This document is a written reference. The website is the main step-by-step guide. HR PRO is the system being tested; **Playwright** runs browser checks; **GitHub** stores the code and its review history.

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
npm run test:ui:smoke
```

For a first read-only practice, run **SMOKE-018 (Settings)** from `navigation.spec.ts` in the test list. Click **▶ Run** and inspect **Actions**, **Before/After**, and **Errors**. See the [guided UI Mode exercise](https://hr-pro-automation.netlify.app/#run). For approved Setup checks: `npm run test:ui:setup`.

**Check the test URL first.** The default URL is configured in `playwright.config.ts`; `E2E_BASE_URL` may override it. Use an approved non-production environment and fictional data for tests that change records.

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
