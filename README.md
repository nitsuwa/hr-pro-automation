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

## How do I make a new test?

Follow the [illustrated Create a Test walkthrough](https://hr-pro-automation-help.vercel.app/#create). It shows how to pick a scenario, try it manually, locate real controls, learn from [an existing Department test](tests/regression/setup/department-creation.spec.ts), create a new file, run it, and share it.

**Workflow:** Choose a scenario → try it → write browser steps and checks → run and verify → share through a GitHub pull request.

Tests that add, edit, or delete information must run only on designated practice environments with fictional records. Do not run them on live HR systems.

**Need help?** Use the [guide's quick fixes](https://hr-pro-automation-help.vercel.app/#help-quick) or the [more detailed manual](docs/help/USER_MANUAL.md).
