<p align="left"><img src="docs/help/assets/hrpro-header.svg" alt="HR PRO QA Automation" width="470"></p>

# HR PRO automated testing

This project lets **Playwright** open the [HR PRO prototype](https://hrproprototype.netlify.app/), carry out steps, and check that expected results appear. You can run existing tests without coding experience. The [illustrated guide](https://hr-pro-automation-help.vercel.app/) shows screenshots, buttons, and real examples.

## Your first test (no login required)

1. Install [VS Code](https://code.visualstudio.com/), [Git](https://git-scm.com/), and [Node.js LTS](https://nodejs.org/). Then restart VS Code.
2. Open **VS Code → Terminal → New Terminal**. Paste these lines **one at a time**, pressing Enter after each:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
npm ci
npx playwright install chromium
```

This downloads the project and installs its testing tools.

3. Paste this command into the same terminal to open Playwright's visual test window:

```powershell
npx playwright test tests/smoke/login.spec.ts --grep "SMOKE-001" --ui --project=chromium
```

4. Find **SMOKE-001 | HR PRO login page loads** and click ▶. A green result means the sign-in heading, demo-account message, and Sign in button appeared. **No password or account is needed.**

[**Follow the visual walkthrough →**](https://hr-pro-automation-help.vercel.app/#install)

**Which website?** The project already uses `https://hrproprototype.netlify.app/` by default. You do not need to edit `playwright.config.ts` or `E2E_BASE_URL` for your first test. These technical settings only control which website tests open.

## What's inside?

| Folder/file | Meaning |
|---|---|
| [`tests/smoke/`](tests/smoke/) | Simple sign-in page and navigation checks. Start here. |
| [`tests/regression/setup/`](tests/regression/setup/) | Tests for Departments, Employees, and other HR PRO features. Some change records. |
| [`playwright/pages/`](playwright/pages/) | Reusable instructions for clicking buttons and filling fields. |
| [`playwright/fixtures/`](playwright/fixtures/) | Shared setup, including demo-role sign-in. |
| [`playwright.config.ts`](playwright.config.ts) | Website address and test browser settings. |
| [`docs/help/index.html`](docs/help/index.html) | Visual guide. Can be opened locally as HTML. |

Advanced inspection scripts are in `tests/infrastructure/`; beginners can ignore them.

## Learn to edit a test—not just run commands

Follow the [hands-on editing exercise in the visual guide](https://hr-pro-automation-help.vercel.app/#edit-test-practice). This starts with a real existing check in [`tests/smoke/login.spec.ts`](tests/smoke/login.spec.ts) and shows how to make a **separate practice test** that selects the HR Officer demo role.

**What you edit:** the test's descriptive name, the action (which option is selected), and the expected result. The guide provides a full working example, then asks you to change it to Payroll Manager yourself. Keep the original test untouched.

After editing the new file, run it in Playwright UI Mode:

```powershell
npx playwright test tests/smoke/demo-selection-practice.spec.ts --ui --project=chromium
```

The file above **does not exist until you create it in VS Code**. The guide explains where to create it, how to edit it, and how to verify its result.

For a different HR PRO feature, don't simply rename the test. Observe the actual buttons and fields, change the browser steps, and update the expected result. Learn from the [existing Department creation test](tests/regression/setup/department-creation.spec.ts) for tests that save information.

**Workflow:** Choose a scenario → try it → edit steps **and** checks → run your test → verify the result → share through a GitHub pull request.

Tests that add, edit, or delete information must run only on designated practice environments with fictional records. Do not run them on live HR systems.

**Need help?** Use the [guide's quick fixes](https://hr-pro-automation-help.vercel.app/#help-quick) or the [more detailed manual](docs/help/USER_MANUAL.md).
