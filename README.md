<p><img src="docs/help/assets/hrpro-header.svg" width="440" alt="HR PRO QA Automation"></p>

# HR PRO automated testing

**New teammate? Start with the [visual guide](https://hr-pro-automation-help.vercel.app/#run).** It starts with **running one test**, then explains the project, the workflow, and basic syntax. No prior coding required to follow along.

Playwright runs browser actions on HR PRO and checks expected results. This saves time on repeated QA checks, but a passing test only confirms the checks included in that test.

## Run your first test

**Before you run anything:** You need authorized access to an approved **non-production** HR PRO environment and approved test accounts. Check the URL in `playwright.config.ts` or any `E2E_BASE_URL` override. Do not test with real employee data.

1. Install [VS Code](https://code.visualstudio.com/), [Git](https://git-scm.com/), and [Node.js LTS](https://nodejs.org/).
2. In VS Code, open **Terminal → New Terminal**.
3. Enter these commands one at a time:

```powershell
git clone https://github.com/nitsuwa/hr-pro-automation.git
cd hr-pro-automation
npm ci
npx playwright install chromium
```

4. Run one navigation test in Playwright UI Mode:

```powershell
npx playwright test tests/smoke/navigation.spec.ts --grep "SMOKE-018" --ui --project=chromium
```

5. In the Playwright window, click **▶** on **SMOKE-018 | Settings opens successfully**. Look at the **Actions** panel and browser view. Confirm the page opens correctly.

**[See the illustrated, beginner-friendly instructions →](https://hr-pro-automation-help.vercel.app/#run)**

## What's in the repository?

| Where | Why it matters |
|---|---|
| [`tests/smoke/`](tests/smoke/) | Quick login and navigation checks — start here. |
| [`tests/regression/setup/`](tests/regression/setup/) | Detailed HR PRO Setup feature tests; some change data. |
| [`playwright/pages/`](playwright/pages/) | Reusable page actions and locators. |
| [`playwright/fixtures/`](playwright/fixtures/) | Reusable setup and login helpers. |
| [`playwright.config.ts`](playwright.config.ts) | Browser and target test site. |
| [`docs/help/index.html`](docs/help/index.html) | Visual guide (also opens as a local HTML file). |

`tests/infrastructure/` contains advanced inspection utilities, **not** ordinary regression tests.

## How we work

**Choose a requirement → Try it manually → Write a test → Run and verify → Share via pull request.**

- To run the smoke list visually: `npx playwright test tests/smoke --ui --project=chromium`.
- To run Setup regression visually: `npx playwright test tests/regression/setup --ui --project=chromium` (**only** in approved disposable QA environments with fictional data).
- To see the test report: `npx playwright show-report`.

**New tests:** Start from a similar existing file. `test(...)` names the check, `page.goto(...)` navigates, and `expect(...)` verifies the result. Read the [syntax walkthrough](https://hr-pro-automation-help.vercel.app/#syntax) before editing tests.

## If you get stuck

Open the guide's [quick troubleshooting section](https://hr-pro-automation-help.vercel.app/#help). For extra technical commands, the [written manual](docs/help/USER_MANUAL.md) is still available.

**Offline:** Save `docs/help/index.html` to read the guide locally. Testing HR PRO still needs the installed project, approved credentials, and access to the test site.

Never send credentials or real employee records to AI tools or the public repository.
